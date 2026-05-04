import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

function AuthView({ errorMessage, isBusy, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    passwordConfirm: ""
  });
  const [visibleFields, setVisibleFields] = useState({
    password: false,
    passwordConfirm: false
  });
  const [formError, setFormError] = useState("");

  const isRegister = mode === "register";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFormError("");
    setVisibleFields({
      password: false,
      passwordConfirm: false
    });
  }

  function togglePasswordField(field) {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field]
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (isRegister && form.password !== form.passwordConfirm) {
      setFormError("两次输入的密码不一致，请重新确认。");
      return;
    }

    const payload = {
      display_name: form.displayName.trim(),
      email: form.email.trim(),
      password: form.password
    };
    if (isRegister) {
      onRegister(payload);
      return;
    }
    onLogin({
      email: payload.email,
      password: payload.password
    });
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-label="账号登录">
        <div>
          <p className="eyebrow">ZJSUer AI Translation</p>
          <h1>{isRegister ? "创建学习账号" : "登录学习工作台"}</h1>
          <p className="auth-copy">登录后，历史记录、表达库、表达改进库和学习目标会保存到你的个人数据空间。</p>
        </div>

        <div className="auth-tabs" aria-label="账号操作">
          <button className={mode === "login" ? "mode active" : "mode"} onClick={() => switchMode("login")} type="button">
            登录
          </button>
          <button className={mode === "register" ? "mode active" : "mode"} onClick={() => switchMode("register")} type="button">
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              <span>昵称</span>
              <input
                autoComplete="name"
                onChange={(event) => updateField("displayName", event.target.value)}
                placeholder="例如：晓东"
                value={form.displayName}
              />
            </label>
          )}
          <label>
            <span>邮箱</span>
            <input
              autoComplete="email"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            <span>密码</span>
            <PasswordInput
              autoComplete={isRegister ? "new-password" : "current-password"}
              isVisible={visibleFields.password}
              onChange={(value) => updateField("password", value)}
              onToggle={() => togglePasswordField("password")}
              value={form.password}
            />
          </label>

          {isRegister && (
            <label>
              <span>确认密码</span>
              <PasswordInput
                autoComplete="new-password"
                isVisible={visibleFields.passwordConfirm}
                onChange={(value) => updateField("passwordConfirm", value)}
                onToggle={() => togglePasswordField("passwordConfirm")}
                value={form.passwordConfirm}
              />
            </label>
          )}

          {(formError || errorMessage) && <p className="error-message">{formError || errorMessage}</p>}

          <button className="primary-action" disabled={isBusy} type="submit">
            {isBusy ? <Loader2 className="spin" size={18} /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? "注册并进入" : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}

function PasswordInput({ autoComplete, isVisible, onChange, onToggle, value }) {
  return (
    <div className="password-field">
      <input
        autoComplete={autoComplete}
        minLength={6}
        onChange={(event) => onChange(event.target.value)}
        placeholder="至少 6 位"
        required
        type={isVisible ? "text" : "password"}
        value={value}
      />
      <button aria-label={isVisible ? "隐藏密码" : "显示密码"} onClick={onToggle} type="button">
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default AuthView;
