import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./LoginPage.scss";

function LoginPage() {
  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const data = await api.login(email, password);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.role);

    navigate("/");
  } catch (err) {
    setError(err.response?.data?.message || "Ошибка входа");
  }
};

  return (
    <div className="page-login">
      <div className="login-card">
        <h2 className="login-title">Вход в систему</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="email"
            placeholder="Введите email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" type="submit">
            Войти
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}

export default LoginPage;