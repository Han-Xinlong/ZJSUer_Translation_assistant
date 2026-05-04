import hashlib
import hmac
import json
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, Tuple

from app.core.config import settings
from app.schemas.auth import LearningState, UserPublic


class UserStoreError(RuntimeError):
    pass


class DuplicateUserError(UserStoreError):
    pass


class InvalidCredentialsError(UserStoreError):
    pass


class UserStore:
    def __init__(self, database_path: str) -> None:
        self.database_path = Path(database_path)
        self._initialized = False

    def initialize(self) -> None:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    display_name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sessions (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    expires_at TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS learning_states (
                    user_id INTEGER PRIMARY KEY,
                    payload TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                );
                """
            )
        self._initialized = True

    def create_user(self, email: str, password: str, display_name: str = "") -> Tuple[str, UserPublic]:
        self._ensure_initialized()
        normalized_email = email.strip().lower()
        resolved_name = display_name.strip() or normalized_email.split("@")[0]
        now = self._now()

        try:
            with self._connect() as connection:
                cursor = connection.execute(
                    """
                    INSERT INTO users (email, display_name, password_hash, created_at)
                    VALUES (?, ?, ?, ?)
                    """,
                    (normalized_email, resolved_name, self._hash_password(password), now),
                )
                user_id = int(cursor.lastrowid)
                connection.execute(
                    """
                    INSERT INTO learning_states (user_id, payload, updated_at)
                    VALUES (?, ?, ?)
                    """,
                    (user_id, LearningState().model_dump_json(), now),
                )
        except sqlite3.IntegrityError as exc:
            raise DuplicateUserError("该邮箱已注册，请直接登录。") from exc

        user = UserPublic(id=user_id, email=normalized_email, display_name=resolved_name)
        return self.create_session(user_id), user

    def authenticate(self, email: str, password: str) -> Tuple[str, UserPublic]:
        self._ensure_initialized()
        normalized_email = email.strip().lower()
        with self._connect() as connection:
            row = connection.execute(
                "SELECT id, email, display_name, password_hash FROM users WHERE email = ?",
                (normalized_email,),
            ).fetchone()

        if row is None or not self._verify_password(password, str(row["password_hash"])):
            raise InvalidCredentialsError("邮箱或密码不正确。")

        user = UserPublic(
            id=int(row["id"]),
            email=str(row["email"]),
            display_name=str(row["display_name"]),
        )
        return self.create_session(user.id), user

    def create_session(self, user_id: int) -> str:
        self._ensure_initialized()
        token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=settings.auth_token_days)
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO sessions (token, user_id, expires_at, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (token, user_id, expires_at.isoformat(), now.isoformat()),
            )
        return token

    def get_user_by_token(self, token: str) -> Optional[UserPublic]:
        self._ensure_initialized()
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT users.id, users.email, users.display_name, sessions.expires_at
                FROM sessions
                JOIN users ON users.id = sessions.user_id
                WHERE sessions.token = ?
                """,
                (token,),
            ).fetchone()

        if row is None:
            return None

        expires_at = datetime.fromisoformat(str(row["expires_at"]))
        if expires_at <= datetime.now(timezone.utc):
            self.delete_session(token)
            return None

        return UserPublic(
            id=int(row["id"]),
            email=str(row["email"]),
            display_name=str(row["display_name"]),
        )

    def delete_session(self, token: str) -> None:
        self._ensure_initialized()
        with self._connect() as connection:
            connection.execute("DELETE FROM sessions WHERE token = ?", (token,))

    def get_learning_state(self, user_id: int) -> LearningState:
        self._ensure_initialized()
        with self._connect() as connection:
            row = connection.execute(
                "SELECT payload FROM learning_states WHERE user_id = ?",
                (user_id,),
            ).fetchone()

        if row is None:
            return LearningState()

        try:
            payload = json.loads(str(row["payload"]))
        except json.JSONDecodeError:
            return LearningState()
        return LearningState.model_validate(payload)

    def save_learning_state(self, user_id: int, state: LearningState) -> LearningState:
        self._ensure_initialized()
        now = self._now()
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO learning_states (user_id, payload, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    payload = excluded.payload,
                    updated_at = excluded.updated_at
                """,
                (user_id, state.model_dump_json(), now),
            )
        return state

    def _connect(self) -> sqlite3.Connection:
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _ensure_initialized(self) -> None:
        if not self._initialized:
            self.initialize()

    def _hash_password(self, password: str) -> str:
        salt = secrets.token_hex(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
        return f"pbkdf2_sha256$120000${salt}${digest.hex()}"

    def _verify_password(self, password: str, password_hash: str) -> bool:
        try:
            algorithm, iterations, salt, expected = password_hash.split("$", 3)
        except ValueError:
            return False
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations),
        )
        return hmac.compare_digest(digest.hex(), expected)

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()


user_store = UserStore(settings.database_path)
