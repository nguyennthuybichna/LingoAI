import { useState, useEffect } from 'react';
import { User, Mail, ShieldAlert, Sparkles, Key, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (username.trim() === '') {
      setErrorMsg('Tên đăng nhập không được chỉ chứa dấu cách!');
      return;
    }

    if (showPasswordForm) {
      if (!oldPassword) {
        setErrorMsg('Vui lòng nhập mật khẩu cũ!');
        return;
      }
      if (!password) {
        setErrorMsg('Vui lòng nhập mật khẩu mới!');
        return;
      }
      if (password.trim() === '') {
        setErrorMsg('Mật khẩu mới không được chỉ chứa dấu cách!');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp!');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = { username: username.trim(), email: email.trim() };
      if (showPasswordForm) {
        payload.oldPassword = oldPassword;
        payload.password = password;
      }

      const res = await api.updateProfile(payload);
      
      
      updateUser(res.user, res.token);
      
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      showToast('Cập nhật hồ sơ thành công! ✨');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem' }}>
        <header className="profile-header" style={{ marginBottom: '2rem' }}>
          <h1 className="profile-header__title" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4a044e', margin: 0 }}>Hồ sơ cá nhân</h1>
          <p className="profile-header__subtitle" style={{ color: '#db2777', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
            Xem và cập nhật thông tin cá nhân của bạn.
          </p>
        </header>

        <section style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          flex: 1 
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #fbcfe8',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '550px',
            padding: '2.5rem',
            boxShadow: '0 10px 25px -5px rgba(244, 114, 182, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #fbcfe8', paddingBottom: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fbcfe8, #f472b6, #db2777)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: '900',
                boxShadow: '0 4px 10px rgba(219, 39, 119, 0.2)'
              }}>
                {getInitials(user?.username)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', color: '#4a044e', fontWeight: 'bold', margin: 0 }}>{user?.username}</h2>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}>
                <ShieldAlert size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a044e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={15} style={{ color: '#db2777' }} />
                  <span>Tên người dùng</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. lingokawaii"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: '#4a044e'
                  }}
                />
              </div>

              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a044e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} style={{ color: '#db2777' }} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@lingo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: '#4a044e'
                  }}
                />
              </div>

              {}
              {!showPasswordForm ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: '1px solid #db2777',
                    color: '#db2777',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s',
                    marginTop: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fff5fb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <Key size={14} />
                  <span>Đổi mật khẩu</span>
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid #fbcfe8',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  background: '#fff5fb',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#4a044e' }}>Đổi mật khẩu</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setOldPassword('');
                        setPassword('');
                        setConfirmPassword('');
                        setErrorMsg('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Hủy
                    </button>
                  </div>

                  {}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a044e' }}>Mật khẩu cũ</label>
                    <input
                      type="password"
                      required={showPasswordForm}
                      placeholder="Nhập mật khẩu hiện tại..."
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #fbcfe8',
                        borderRadius: '6px',
                        outline: 'none',
                        fontSize: '0.9rem',
                        background: '#fff'
                      }}
                    />
                  </div>

                  {}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a044e' }}>Mật khẩu mới</label>
                    <input
                      type="password"
                      required={showPasswordForm}
                      placeholder="Nhập mật khẩu mới..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #fbcfe8',
                        borderRadius: '6px',
                        outline: 'none',
                        fontSize: '0.9rem',
                        background: '#fff'
                      }}
                    />
                  </div>

                  {}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4a044e' }}>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      required={showPasswordForm}
                      placeholder="Xác nhận mật khẩu mới..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        border: '1px solid #fbcfe8',
                        borderRadius: '6px',
                        outline: 'none',
                        fontSize: '0.9rem',
                        background: '#fff'
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn--primary"
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  boxShadow: '0 4px 12px rgba(244, 114, 182, 0.2)'
                }}
              >
                {isSubmitting ? (
                  <span>Đang lưu...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>

      {toastMessage && (
        <div className="custom-toast" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#4a044e',
          color: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '999px',
          boxShadow: '0 10px 15px -3px rgba(74, 4, 78, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          zIndex: 2000,
          border: '1px solid #fbcfe8',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <Sparkles size={16} style={{ color: '#f472b6' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
