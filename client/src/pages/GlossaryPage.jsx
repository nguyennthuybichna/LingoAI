import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Languages, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { api } from '../api/api';

const AVAILABLE_LANGUAGES = ['English', 'Vietnamese', 'Japanese', 'Korean', 'French', 'Spanish'];

export default function GlossaryPage() {
  const [terms, setTerms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);

  
  const [formSource, setFormSource] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formSourceLang, setFormSourceLang] = useState('English');
  const [formTargetLang, setFormTargetLang] = useState('Vietnamese');
  const [formDomain, setFormDomain] = useState('General');
  const [customDomain, setCustomDomain] = useState('');
  const [formActive, setFormActive] = useState(true);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGlossary();
      setTerms(res.data || []);
    } catch (err) {
      console.error('Failed to load glossary:', err);
      alert('Không thể tải danh sách thuật ngữ: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const baseCategories = ['General', 'IT & Tech', 'Marketing', 'Tài liệu chung'];
  const allCategories = Array.from(new Set([...baseCategories, ...terms.map(t => t.domain).filter(Boolean)]));

  const handleOpenAddModal = () => {
    setEditingTerm(null);
    setFormSource('');
    setFormTarget('');
    setFormSourceLang('English');
    setFormTargetLang('Vietnamese');
    setFormDomain('General');
    setCustomDomain('');
    setFormActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (term) => {
    setEditingTerm(term);
    setFormSource(term.sourceTerm);
    setFormTarget(term.targetTerm);
    setFormSourceLang(term.sourceLanguage || 'English');
    setFormTargetLang(term.targetLanguage || 'Vietnamese');
    setFormActive(term.isActive !== false);

    if (allCategories.includes(term.domain)) {
      setFormDomain(term.domain || 'General');
      setCustomDomain('');
    } else {
      setFormDomain('Custom...');
      setCustomDomain(term.domain || '');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formSource.trim() || !formTarget.trim()) return;

    const selectedDomain = formDomain === 'Custom...' ? customDomain.trim() : formDomain;
    if (!selectedDomain) {
      alert('Vui lòng nhập nhóm (Domain) tùy chỉnh');
      return;
    }

    try {
      if (editingTerm) {
        
        const res = await api.updateGlossaryTerm(
          editingTerm._id,
          formSource.trim(),
          formTarget.trim(),
          selectedDomain,
          formSourceLang,
          formTargetLang,
          formActive
        );
        const updatedItem = res.data;
        setTerms(prev => prev.map(item => item._id === editingTerm._id ? updatedItem : item));
      } else {
        
        const res = await api.addGlossaryTerm(
          formSource.trim(),
          formTarget.trim(),
          selectedDomain,
          formSourceLang,
          formTargetLang
        );
        setTerms(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save glossary term:', err);
      alert('Không thể lưu thuật ngữ: ' + err.message);
    }
  };

  const handleOpenDeleteModal = (term) => {
    setTermToDelete(term);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!termToDelete) return;
    try {
      await api.deleteGlossaryTerm(termToDelete._id);
      setTerms(prev => prev.filter(item => item._id !== termToDelete._id));
      setShowDeleteModal(false);
      setTermToDelete(null);
    } catch (err) {
      console.error('Failed to delete glossary term:', err);
      alert('Không thể xóa thuật ngữ: ' + err.message);
    }
  };

  const getCategoryTone = (domain) => {
    if (!domain) return 'pink';
    switch (domain.toLowerCase()) {
      case 'it & tech':
      case 'tech':
        return 'blue';
      case 'marketing':
        return 'purple';
      case 'general':
      default:
        return 'pink';
    }
  };

  
  const filteredTerms = terms.filter(term =>
    (term.sourceTerm || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (term.targetTerm || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (term.domain || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (term.sourceLanguage || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (term.targetLanguage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTerms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  
  const totalTerms = terms.length;
  const uniqueCategories = new Set(terms.map(t => t.domain).filter(Boolean)).size;
  const verifiedTerms = terms.filter(t => t.isActive !== false).length;

  const stats = [
    { label: 'TOTAL TERMS', value: String(totalTerms) },
    { label: 'CATEGORIES', value: String(uniqueCategories) },
    { label: 'VERIFIED TERMS', value: String(verifiedTerms) },
    { label: 'STATUS', value: isLoading ? 'Syncing...' : 'Connected' },
  ];

  return (
    <div className="app-shell app-shell--glossary">
      <Sidebar />

      <main className="app-main app-main--glossary">
        <header className="glossary-header">
          <div>
            <h1 className="glossary-header__title">Term Glossary</h1>
            <p className="glossary-header__subtitle">
              Manage your cross-project terminology and AI hints.
            </p>
          </div>

          <div className="glossary-header__actions">
            <div className="search-field search-field--inline">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search terms, languages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); 
                }}
              />
            </div>
            <button type="button" className="btn btn--primary" onClick={handleOpenAddModal}>
              <Plus size={18} />
              Add New
            </button>
          </div>
        </header>

        <section className="stats-row">
          {stats.map(({ label, value }) => (
            <article key={label} className="stats-row__card">
              <p className="stats-row__label">{label}</p>
              <p className="stats-row__value">{value}</p>
            </article>
          ))}
        </section>

        <section className="table-card">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#db2777', fontWeight: 'bold' }}>
              Đang tải danh sách thuật ngữ...
            </div>
          ) : filteredTerms.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              Không tìm thấy thuật ngữ nào. Hãy bấm "+ Add New" để thêm mới!
            </div>
          ) : (
            <>
              <table className="data-table data-table--glossary">
                <thead>
                  <tr>
                    <th>Source Term</th>
                    <th>Target Term</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((row) => (
                    <tr key={row._id}>
                      <td>
                        <span className="term-cell">
                          <Languages size={14} />
                          <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#4a044e' }}>{row.sourceTerm}</strong>
                            <span style={{ fontSize: '10px', color: '#db2777', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                              {row.sourceLanguage || 'English'}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
                          <span style={{ color: '#4a044e', fontWeight: '500' }}>{row.targetTerm}</span>
                          <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                            {row.targetLanguage || 'Vietnamese'}
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className={`cat-badge cat-badge--${getCategoryTone(row.domain)}`}>
                          {row.domain || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot status-dot--${row.isActive !== false ? 'green' : 'orange'}`}>
                          {row.isActive !== false ? 'Verified' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn icon-btn--sm"
                            aria-label="Sửa"
                            onClick={() => handleOpenEditModal(row)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn--sm icon-btn--danger"
                            aria-label="Xóa"
                            onClick={() => handleOpenDeleteModal(row)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <footer className="table-card__footer">
                <p>
                  Showing {filteredTerms.length === 0 ? 0 : indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredTerms.length)} of {filteredTerms.length} entries
                </p>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      aria-label="Trang trước"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`pagination__page ${currentPage === idx + 1 ? 'pagination__page--active' : ''}`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      aria-label="Trang sau"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </footer>
            </>
          )}
        </section>
      </main>

      {}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(74, 4, 78, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #fbcfe8',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(244, 114, 182, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ margin: 0, color: '#4a044e', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {editingTerm ? 'Edit Glossary Term' : 'Add New Glossary Term'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a044e' }}>Source Term</label>
                  <select
                    value={formSourceLang}
                    onChange={(e) => setFormSourceLang(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#db2777',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder={`Enter term in ${formSourceLang}...`}
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a044e' }}>Target Term</label>
                  <select
                    value={formTargetLang}
                    onChange={(e) => setFormTargetLang(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#db2777',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  required
                  placeholder={`Enter translation in ${formTargetLang}...`}
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a044e' }}>Category (Domain)</label>
                <select
                  value={formDomain}
                  onChange={(e) => {
                    setFormDomain(e.target.value);
                    if (e.target.value !== 'Custom...') {
                      setCustomDomain('');
                    }
                  }}
                  style={{
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px',
                    outline: 'none',
                    background: '#fff',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  {[...allCategories, 'Custom...'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formDomain === 'Custom...' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom category..."
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      border: '1px solid #fbcfe8',
                      borderRadius: '8px',
                      outline: 'none',
                      fontSize: '0.9rem',
                      marginTop: '0.25rem'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#db2777', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a044e', cursor: 'pointer' }}>
                  Active / Verified
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowModal(false)}
                  style={{
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    color: '#4b5563',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(74, 4, 78, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #fbcfe8',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(244, 114, 182, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, color: '#4a044e', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Xóa thuật ngữ?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
              Bạn có chắc chắn muốn xóa thuật ngữ <strong>"{termToDelete?.sourceTerm}"</strong>? Hành động này không thể hoàn tác.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTermToDelete(null);
                }}
                style={{
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  color: '#4b5563',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.15)'
                }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
