from pathlib import Path


class PromptLoader:
    def __init__(self) -> None:
        self.prompt_dir = Path(__file__).resolve().parents[3] / "prompts"

    def load(self, key: str) -> str:
        path = self.prompt_dir / f"{key}.md"
        if not path.exists():
            raise FileNotFoundError(f"Prompt template not found: {path}")
        return path.read_text(encoding="utf-8")

