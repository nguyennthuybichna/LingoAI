import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Facebook, Lock, Mail, Rocket } from 'lucide-react';
import Logo from '../components/Logo';

const GoogleIcon = ({ size = 22, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    {...props}
  >
    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.12 1 1.16 5.92 1.16 12s4.96 11 11.08 11c6.38 0 10.62-4.474 10.62-10.78 0-.727-.08-1.282-.177-1.935H12.24z" />
  </svg>
);
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      loginUser(res.user, res.token);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--left" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--right" aria-hidden="true" />
      <div className="auth-page__sparkle auth-page__sparkle--1" aria-hidden="true">✦</div>
      <div className="auth-page__sparkle auth-page__sparkle--2" aria-hidden="true">✦</div>
      <div className="auth-page__heart" aria-hidden="true">♥</div>

      <div className="auth-card">
        <div className="auth-card__header">
          <Logo vertical showBook />
          <p className="auth-card__subtitle">
            Your adorable gateway to global communication
          </p>
        </div>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <label className="field">
            <span className="field__label">
              <Mail size={14} />
              Email của bạn
            </span>
            <input
              type="email"
              className="field__input"
              placeholder="hello@lingokawaii.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field__label-row">
              <span className="field__label">
                <Lock size={14} />
                Mật khẩu
              </span>
            </span>
            <div className="field__input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="field__input field__input--plain"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="field__eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Hiện/ẩn mật khẩu"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <label className="checkbox">
            <input type="checkbox" defaultChecked />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button type="submit" disabled={loading} className="btn btn--primary btn--block btn--lg">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập ngay'}
            <Rocket size={18} />
          </button>
        </form>

        <div className="auth-divider">
          <span>HOẶC TIẾP TỤC VỚI</span>
        </div>

        <div className="auth-social">
          <button type="button" className="btn btn--social">
            <GoogleIcon size={18} />
            Google
          </button>
          <button type="button" className="btn btn--social">
            <Facebook size={18} />
            Facebook
          </button>
        </div>

        <p className="auth-card__footer">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="link-accent">Đăng ký ngay →</Link>
        </p>
      </div>
    </div>
  );
}

