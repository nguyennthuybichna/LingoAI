import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Copy,
  Gauge,
  History,
  Languages,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../api/api';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../contexts/AuthContext';

const sliceToMaxNonWhitespace = (str, max) => {
  let count = 0;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (!/\s/.test(char)) {
      if (count >= max) break;
      count++;
    }
    result += char;
  }
  return result;
};

const defaultStats = [
  { label: 'LATENCY', value: '142ms', icon: Gauge },
  { label: 'ACCURACY', value: '99.2%', icon: Languages },
  { label: 'GLOSSARY HITS', value: '12', icon: Sparkles },
  { label: 'CONFIDENCE', value: 'High', icon: ShieldCheck },
];

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [domain, setDomain] = useState('General');
  const [showDomainSelect, setShowDomainSelect] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [copyStatus, setCopyStatus] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Vietnamese');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [availableDomains, setAvailableDomains] = useState(['General', 'IT & Tech', 'Marketing', 'Tài liệu chung']);
  const location = useLocation();
  const debouncedText = useDebounce(text, 1000);

  useEffect(() => {
    const fetchCustomDomains = async () => {
      try {
        const res = await api.getGlossary();
        if (res.data) {
          const glossaryDomains = res.data.map(item => item.domain).filter(Boolean);
          const uniqueDomains = Array.from(new Set([...['General', 'IT & Tech', 'Marketing', 'Tài liệu chung'], ...glossaryDomains]));
          setAvailableDomains(uniqueDomains);
        }
      } catch (err) {
        console.warn("Failed to load custom domains:", err);
      }
    };
    fetchCustomDomains();
  }, []);

  useEffect(() => {
    if (location.state && location.state.text) {
      setText(location.state.text);
      if (location.state.domain) {
        setDomain(location.state.domain);
      }
      if (location.state.sourceLanguage) {
        setSourceLanguage(location.state.sourceLanguage);
      }
      if (location.state.targetLanguage) {
        setTargetLanguage(location.state.targetLanguage);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (debouncedText && debouncedText.trim() !== '') {
      console.log('Debounced text input:', debouncedText);
    }
  }, [debouncedText]);



  const handleTranslate = async () => {
    if (!text.trim()) return;

    const charCount = text.replace(/\s/g, '').length;
    if (charCount > 2000) {
      setToastMessage('Nội dung dịch vượt quá giới hạn 2000 ký tự.');
      setTimeout(() => setToastMessage(''), 4000);
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const res = await api.translate(text, domain, sourceLanguage, targetLanguage);
      setTranslatedText(res.translatedText);


    } catch (err) {
      if (err.status === 429 && err.error === 'LIMIT_REACHED') {
        setIsTranslating(false);
        if (!user) {
          setShowLimitModal(true);
        } else {
          setToastMessage('Bạn đã đạt giới hạn dịch thuật trong ngày.');
          setTimeout(() => setToastMessage(''), 4000);
        }
        return;
      }

      console.error("Backend translation API failed:", err);
      setToastMessage(err.message || 'Dịch thuật thất bại. Vui lòng thử lại.');
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleClear = () => {
    setText('');
    setTranslatedText('');
    setStats(defaultStats);
  };

  return (
    <div className="app-shell app-shell--workspace">
      <Sidebar />

      <main className="app-main app-main--workspace">
        <header className="workspace-topbar">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div
              className="domain-pill"
              style={{ position: 'relative', cursor: 'pointer', zIndex: 100 }}
              onClick={() => setShowDomainSelect(!showDomainSelect)}
            >
              <span>Domain:</span>
              <strong>{domain}</strong>
              <ChevronDown size={16} />
              {showDomainSelect && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  background: '#fff',
                  border: '1px solid #fbcfe8',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(244, 114, 182, 0.12)',
                  minWidth: '150px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {availableDomains.map(dom => (
                    <button
                      key={dom}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDomain(dom);
                        setShowDomainSelect(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px 12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        color: domain === dom ? '#ec4899' : '#4a044e',
                        fontWeight: domain === dom ? '700' : '500',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => e.target.style.background = '#fff5fb'}
                      onMouseLeave={e => e.target.style.background = 'none'}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', background: '#fff', padding: '0.45rem 0.85rem', borderRadius: '20px', border: '1px solid #fbcfe8', fontSize: '0.82rem' }}>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', fontWeight: 'bold', color: '#db2777', cursor: 'pointer' }}
              >
                {['English', 'Vietnamese', 'Japanese', 'Korean', 'French', 'Spanish'].map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <span style={{ color: '#9ca3af', fontWeight: '500' }}>→</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', fontWeight: 'bold', color: '#db2777', cursor: 'pointer' }}
              >
                {['English', 'Vietnamese', 'Japanese', 'Korean', 'French', 'Spanish'].map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="workspace-topbar__actions">
            <button type="button" className="icon-btn" aria-label="Thông báo">
              <Bell size={20} />
            </button>
            <div className="avatar" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #fbcfe8, #f472b6)', width: '2.25rem', height: '2.25rem', borderRadius: '50%' }} />
          </div>
        </header>

        <section className="translate-workspace">
          <article className="translate-panel">
            <header className="translate-panel__header">
              <span className="lang-tag lang-tag--source">Source: {sourceLanguage}</span>
              <div className="translate-panel__tools">
                <button
                  type="button"
                  className="icon-btn icon-btn--sm"
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                  }}
                  aria-label="Sao chép nguồn"
                >
                  <Copy size={16} />
                </button>
                <button type="button" className="icon-btn icon-btn--sm" onClick={handleClear} aria-label="Xóa">
                  <Trash2 size={16} />
                </button>
              </div>
            </header>
            <textarea
              className="translate-panel__textarea"
              placeholder="Enter the magic text you want to translate here... Lingo AI is ready to help! ✨"
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Wand2 size={18} className="translate-panel__wand" style={{ bottom: '3.5rem' }} />
            <footer className="translate-panel__footer" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
              <span>Độ dài</span>
              <span style={{ 
                fontWeight: 'bold', 
                color: text.replace(/\s/g, '').length > 2000 ? '#ef4444' : (text.replace(/\s/g, '').length === 2000 ? '#db2777' : '#9ca3af') 
              }}>
                {text.replace(/\s/g, '').length} / 2000
              </span>
            </footer>
          </article>

          <button type="button" className="translate-float-btn" onClick={handleTranslate} disabled={isTranslating}>
            <Sparkles size={18} />
            Translate
          </button>

          <article className="translate-panel translate-panel--target">
            <header className="translate-panel__header">
              <span className="lang-tag lang-tag--target">Target: {targetLanguage}</span>
              <div className="translate-panel__tools">
                <button type="button" className="icon-btn icon-btn--sm" onClick={handleCopy} aria-label="Sao chép bản dịch">
                  {copyStatus ? <span style={{ fontSize: '11px', color: '#db2777', fontWeight: 'bold' }}>✓</span> : <Copy size={16} />}
                </button>
                <button type="button" className="icon-btn icon-btn--sm" aria-label="Lịch sử">
                  <History size={16} />
                </button>
              </div>
            </header>

            {isTranslating ? (
              <div className="translate-loading">
                <div className="skeleton-line skeleton-line--blue skeleton-line--lg" />
                <div className="skeleton-line skeleton-line--blue skeleton-line--md" />

                <div className="thinking-box">
                  <span className="thinking-box__face">◡</span>
                  <p>Thinking really hard...</p>
                </div>

                <div className="skeleton-line skeleton-line--blue skeleton-line--sm" />
              </div>
            ) : (
              <textarea
                className="translate-panel__textarea"
                value={translatedText}
                readOnly
                placeholder="Bản dịch của bạn sẽ xuất hiện ở đây..."
                style={{ background: 'transparent', resize: 'none' }}
              />
            )}

            <footer className="translate-panel__footer">
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{
                    width: isTranslating ? '65%' : translatedText ? '100%' : '0%',
                    transition: 'width 0.8s ease'
                  }}
                />
              </div>
              <div className="progress-labels">
                <span>AI Logic Processor</span>
                <span style={{ color: isTranslating ? '#db2777' : '#9ca3af' }}>
                  {isTranslating ? 'Translating...' : 'Ready'}
                </span>
              </div>
            </footer>
          </article>
        </section>
      </main>

      {toastMessage && (
        <div className="custom-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {showLimitModal && (
        <div className="rate-limit-modal-overlay">
          <div className="rate-limit-modal-card">
            <div className="rate-limit-modal-header">
              <Sparkles size={36} className="rate-limit-modal-icon" />
              <h3>Đạt giới hạn dịch miễn phí</h3>
            </div>
            <p className="rate-limit-modal-text">
              Bạn đã sử dụng hết 5 lượt dịch miễn phí! Vui lòng đăng ký tài khoản để tiếp tục dịch và mở khóa tính năng Quản lý Thuật ngữ (Glossary).
            </p>
            <div className="rate-limit-modal-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate('/register')}
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                Đăng ký ngay
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowLimitModal(false)}
                style={{ border: '1px solid #e5e7eb', background: '#f9fafb', color: '#4b5563', cursor: 'pointer', fontWeight: '600' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

