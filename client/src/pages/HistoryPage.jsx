import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../api/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [availableDomains, setAvailableDomains] = useState(['General', 'IT & Tech', 'Marketing', 'Tài liệu chung']);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

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
        console.warn("Failed to load custom domains in HistoryPage:", err);
      }
    };
    fetchCustomDomains();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getTranslationHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed fetching history from backend:", err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteTranslation(id);
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error("Backend delete translation failed:", err.message);
      alert('Không thể xóa lịch sử dịch: ' + err.message);
    }
  };

  const handleTranslateAgain = (item) => {
    navigate('/workspace', {
      state: {
        text: item.originalText,
        domain: item.domain,
        sourceLanguage: item.sourceLanguage,
        targetLanguage: item.targetLanguage
      }
    });
  };

  const getTimeAgoText = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins || 1} phút trước`;
    }
    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'Hôm qua';
    }
    return `${diffDays} ngày trước`;
  };

  const getLangCode = (lang) => {
    if (!lang) return 'EN';
    switch (lang.toLowerCase()) {
      case 'english': return 'EN';
      case 'vietnamese': return 'VI';
      case 'japanese': return 'JA';
      case 'korean': return 'KO';
      case 'french': return 'FR';
      case 'spanish': return 'ES';
      default: return lang.substring(0, 2).toUpperCase();
    }
  };

  const getCategoryTone = (domain) => {
    if (!domain) return 'pink';
    switch (domain.toLowerCase()) {
      case 'it & tech':
      case 'tech':
      case 'it':
        return 'blue';
      case 'marketing':
        return 'purple';
      case 'general':
      default:
        return 'pink';
    }
  };

  
  const filteredHistory = history.filter(item => {
    
    const matchesSearch = 
      item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Hôm nay') {
      const todayDate = new Date().toDateString();
      return new Date(item.createdAt).toDateString() === todayDate;
    }
    if (activeTab === 'IT & Tech') {
      return item.domain === 'IT & Tech' || item.domain === 'IT' || item.domain === 'tech';
    }
    if (activeTab === 'Marketing') {
      return item.domain === 'Marketing';
    }
    if (activeTab === 'Tài liệu chung') {
      return item.domain === 'Tài liệu chung' || item.domain === 'General';
    }
    
    
    return item.domain === activeTab;
  });

  const tabs = ['Tất cả', 'Hôm nay', 'IT & Tech', 'Marketing', 'Tài liệu chung'];
  availableDomains.forEach(dom => {
    const lower = dom.toLowerCase();
    if (lower !== 'general' && lower !== 'tài liệu chung' && lower !== 'it & tech' && lower !== 'it' && lower !== 'tech' && lower !== 'marketing') {
      if (!tabs.includes(dom)) {
        tabs.push(dom);
      }
    }
  });

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <header className="history-header">
          <div>
            <h1 className="history-header__title">Lịch sử dịch thuật</h1>
            <p className="history-header__subtitle">
              Xem lại và quản lý các bản dịch gần đây của bạn.
            </p>
          </div>

          <div className="search-field search-field--inline">
            <Search size={18} />
            <input 
              type="search" 
              placeholder="Tìm kiếm bản dịch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="history-toolbar">
          <div className="history-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                type="button"
                className={`history-tab ${activeTab === tab ? 'history-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#db2777', fontWeight: 'bold' }}>
            Đang tải lịch sử bản dịch...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>
            Không tìm thấy bản dịch nào trong lịch sử.
          </div>
        ) : (
          <section className="history-grid">
            {filteredHistory.map((item) => (
              <article key={item._id} className="history-card">
                <div className="history-card__meta">
                  <div className="history-card__badges">
                    <span className="badge badge--soft" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                      {getLangCode(item.sourceLanguage)} → {getLangCode(item.targetLanguage)}
                    </span>
                    <span className={`cat-badge cat-badge--${getCategoryTone(item.domain)}`} style={{ fontSize: '10px' }}>
                      {item.domain || 'General'}
                    </span>
                  </div>
                  <span className="history-card__time">
                    {getTimeAgoText(item.createdAt)}
                  </span>
                </div>

                <div className="history-card__content">
                  <span className="history-card__label">Nguồn</span>
                  <p className="history-card__text history-card__text--source">
                    "{item.originalText}"
                  </p>
                </div>

                <div className="history-card__divider" />

                <div className="history-card__content">
                  <span className="history-card__label">Kết quả</span>
                  <p className="history-card__text history-card__text--target">
                    "{item.translatedText}"
                  </p>
                </div>

                <div className="history-card__actions">
                  <button
                    type="button"
                    className="btn btn--dich-lai"
                    onClick={() => handleTranslateAgain(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      padding: '0.45rem 1rem',
                      borderRadius: '999px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Dịch lại</span>
                  </button>

                  <button 
                    type="button" 
                    className="icon-btn icon-btn--sm icon-btn--danger"
                    onClick={() => handleDelete(item._id)}
                    aria-label="Xóa bản dịch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}

            {}
            <article className="history-card history-card--prompt">
              <div className="history-card__prompt-icon">
                <Plus size={20} />
              </div>
              <h2 className="history-card__prompt-title">Tạo bản dịch mới</h2>
              <p className="history-card__prompt-desc">
                Bạn có muốn dịch đoạn văn bản cần dịch ngay bây giờ không?
              </p>
              <button
                type="button"
                className="btn btn--ghost history-card__prompt-btn"
                onClick={() => navigate('/workspace')}
                style={{
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Bắt đầu ngay
              </button>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}
