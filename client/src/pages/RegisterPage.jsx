import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Facebook, Lock, Mail, ShieldCheck, User } from 'lucide-react';
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

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (username.trim() === '') {
      setError('Tên đăng nhập không được chỉ chứa dấu cách');
      return;
    }

    if (password.trim() === '') {
      setError('Mật khẩu không được chỉ chứa dấu cách');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(username, email, password);
      loginUser(res.user, res.token);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-page__glow auth-page__glow--left" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--right" aria-hidden="true" />
      <div className="auth-page__heart" aria-hidden="true">♥</div>

      <div className="auth-card">
        <div className="auth-card__header">
          <Logo vertical />
          <p className="auth-card__subtitle">Tham gia cùng hàng nghìn dịch giả</p>
        </div>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <label className="field">
            <span className="field__label">Họ và Tên</span>
            <div className="field__control">
              <User size={18} className="field__icon" />
              <input 
                type="text" 
                placeholder="Nhập tên của bạn" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <div className="field__control">
              <Mail size={18} className="field__icon" />
              <input 
                type="email" 
                placeholder="hello@lingokawaii.ai" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field__label">Mật khẩu</span>
            <div className="field__control">
              <Lock size={18} className="field__icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field__label">Xác nhận mật khẩu</span>
            <div className="field__control">
              <ShieldCheck size={18} className="field__icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn btn--primary btn--block btn--lg">
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-card__footer">
          Đã có tài khoản?{' '}
          <Link to="/login" className="link-accent">Đăng nhập</Link>
        </p>
      </div>

      <div className="auth-below">
        <p className="auth-below__label">HOẶC ĐĂNG KÝ BẰNG</p>
        <div className="auth-below__social">
          <button type="button" className="auth-circle-btn" aria-label="Google">
            <GoogleIcon size={22} />
          </button>
          <button type="button" className="auth-circle-btn" aria-label="Facebook">
            <Facebook size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}

