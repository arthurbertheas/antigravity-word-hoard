import React, { useState } from 'react';

const mockLists = [
    { id: 1, name: '!!!!', tags: ['Phonologie', 'CE1'], count: 9, date: 'Auj. 13h03' },
    { id: 2, name: '!!!! fd', tags: ['Phonologie'], count: 7, date: 'Auj. 13h02' },
    { id: 3, name: 'Mots à retravailler — 39/02/...', tags: ['ratés'], count: 1, date: 'Auj. 12h42' },
    { id: 4, name: 'Mots à retravailler — 39/02/...', tags: ['ratés'], count: 3, date: 'Auj. 12h38' },
    { id: 5, name: 'Mots à retravailler — 07/02/...', tags: ['ratés', 'auto'], count: 2, date: 'Auj. 12h37' },
];

const mockWords = [
    'chamelier',
    'chèvrefeuille',
    'amérique',
    'américain',
    'ambulance',
    'agenouillé',
    'aéroglisseur',
];

export default function SidePanelListSelector() {
    const [selectedList, setSelectedList] = useState(mockLists[1]);
    const [isListViewOpen, setIsListViewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLists = mockLists.filter(list =>
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelectList = (list) => {
        setSelectedList(list);
        setIsListViewOpen(false);
    };

    const handleDeselect = () => {
        setSelectedList(null);
        setIsListViewOpen(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f7fa',
            padding: '20px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            display: 'flex',
            gap: '40px',
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }

        /* ===== SIDE PANEL ===== */
        .side-panel {
          width: 340px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 700px;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f2f5;
          flex-shrink: 0;
        }

        .panel-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .panel-icon {
          font-size: 20px;
          color: #6366f1;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a2e;
        }

        .panel-subtitle {
          font-size: 12px;
          color: #8b8fa8;
        }

        .panel-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          font-size: 13px;
          color: #8b8fa8;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.15s;
          font-family: inherit;
        }

        .panel-btn:hover {
          background: #f5f6fa;
          color: #6366f1;
        }

        .panel-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f6fa;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          color: #8b8fa8;
          transition: all 0.15s;
        }

        .panel-close:hover {
          background: #eef0f5;
          color: #1a1a2e;
        }

        /* ===== UNIFIED LIST SELECTOR ===== */
        .list-selector-unified {
          margin: 16px;
          border: 1px solid #e8ebf2;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .list-selector-unified:hover {
          border-color: #d0d4e0;
        }

        .list-selector-unified.has-selection {
          border-color: #6366f1;
          background: linear-gradient(135deg, #fafaff 0%, #f8f8ff 100%);
        }

        .selector-main {
          display: flex;
          align-items: center;
          padding: 12px 14px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .selector-main:hover {
          background: rgba(99, 102, 241, 0.04);
        }

        .selector-icon-box {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f1f8;
          border-radius: 10px;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .has-selection .selector-icon-box {
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
        }

        .selector-icon-box svg {
          width: 18px;
          height: 18px;
          color: #8b8fa8;
        }

        .has-selection .selector-icon-box svg {
          color: white;
        }

        .selector-content {
          flex: 1;
          min-width: 0;
        }

        .selector-label {
          font-size: 11px;
          font-weight: 500;
          color: #8b8fa8;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }

        .selector-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .selector-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .selector-tag {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 8px;
          background: #eef0ff;
          color: #6366f1;
          border-radius: 20px;
        }

        .selector-count {
          font-size: 11px;
          color: #8b8fa8;
        }

        .selector-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
        }

        .selector-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: #8b8fa8;
          transition: all 0.15s;
        }

        .selector-btn:hover {
          background: #f0f1f8;
          color: #6366f1;
        }

        .selector-btn.deselect:hover {
          background: #fff0f0;
          color: #ef4444;
        }

        .selector-btn svg {
          width: 16px;
          height: 16px;
        }

        /* ===== STATS SECTION ===== */
        .stats-section {
          padding: 0 20px 16px;
          border-bottom: 1px solid #f0f2f5;
          flex-shrink: 0;
        }

        .stats-count {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
        }

        .stats-count span {
          font-size: 14px;
          font-weight: 500;
          color: #8b8fa8;
        }

        .stats-detail {
          font-size: 12px;
          color: #a0a4b8;
          margin-top: 4px;
        }

        .stats-tags {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .stat-tag {
          font-size: 11px;
          padding: 2px 8px;
          background: #f0f1f8;
          border-radius: 4px;
          color: #6b6f8a;
        }

        /* ===== WORDS LIST ===== */
        .words-section {
          flex: 1;
          overflow-y: auto;
          padding: 8px 16px;
        }

        .word-item {
          padding: 14px 16px;
          background: white;
          border: 1px solid #f0f2f5;
          border-radius: 10px;
          margin-bottom: 8px;
          font-size: 15px;
          color: #1a1a2e;
          transition: all 0.15s;
          cursor: default;
        }

        .word-item:hover {
          border-color: #e0e3eb;
          background: #fafafc;
        }

        /* ===== EMPTY STATE ===== */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #a0a4b8;
          text-align: center;
          padding: 40px 20px;
        }

        .empty-state-icon {
          font-size: 40px;
          margin-bottom: 12px;
          opacity: 0.4;
        }

        .empty-state-text {
          font-size: 13px;
          line-height: 1.5;
        }

        /* ===== BOTTOM CTA ===== */
        .bottom-cta {
          padding: 16px;
          border-top: 1px solid #f0f2f5;
          flex-shrink: 0;
        }

        .cta-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          font-family: inherit;
          transition: all 0.15s;
        }

        .cta-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        /* ===== LIST VIEW (EXPANDED) ===== */
        .list-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .list-view-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f2f5;
          gap: 12px;
          flex-shrink: 0;
        }

        .back-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f6fa;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: #8b8fa8;
          transition: all 0.15s;
        }

        .back-btn:hover {
          background: #eef0f5;
          color: #6366f1;
        }

        .list-view-title {
          flex: 1;
        }

        .list-view-title h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a2e;
          margin: 0;
        }

        .list-view-title span {
          font-size: 12px;
          color: #8b8fa8;
        }

        .search-box {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f2f5;
          flex-shrink: 0;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 38px;
          background: #f5f6fa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238b8fa8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3E%3C/svg%3E") 12px center no-repeat;
          background-size: 18px;
          border: 1px solid transparent;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          color: #1a1a2e;
          transition: all 0.15s;
        }

        .search-input::placeholder {
          color: #a0a4b8;
        }

        .search-input:focus {
          outline: none;
          background-color: white;
          border-color: #6366f1;
        }

        .lists-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .deselect-option {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.15s;
          border-bottom: 1px solid #f0f2f5;
          color: #8b8fa8;
        }

        .deselect-option:hover {
          background: #fff8f8;
          color: #ef4444;
        }

        .deselect-option svg {
          width: 18px;
          height: 18px;
          margin-right: 10px;
        }

        .deselect-option span {
          font-size: 13px;
          font-weight: 500;
        }

        .list-item {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.15s;
          border-left: 3px solid transparent;
        }

        .list-item:hover {
          background: #f8f9fc;
        }

        .list-item.selected {
          background: linear-gradient(90deg, #f0f1ff 0%, #f8f9ff 100%);
          border-left-color: #6366f1;
        }

        .list-item-content {
          flex: 1;
          min-width: 0;
        }

        .list-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }

        .list-item-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .list-item-date {
          font-size: 11px;
          color: #a0a4b8;
        }

        .list-item-tags {
          display: flex;
          gap: 4px;
        }

        .list-item-tag {
          font-size: 10px;
          font-weight: 500;
          padding: 1px 6px;
          background: #eef0ff;
          color: #6366f1;
          border-radius: 10px;
        }

        .list-item-right {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
        }

        .list-item-count {
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f1f8;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #6366f1;
        }

        .list-item.selected .list-item-count {
          background: #6366f1;
          color: white;
        }

        .list-item-menu {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: #c0c4d0;
          opacity: 0;
          transition: all 0.15s;
          font-family: inherit;
        }

        .list-item:hover .list-item-menu {
          opacity: 1;
        }

        .list-item-menu:hover {
          background: #eef0f5;
          color: #8b8fa8;
        }

        .new-list-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 12px 16px 16px;
          padding: 12px;
          background: white;
          border: 2px dashed #d0d4e8;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #6366f1;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .new-list-btn:hover {
          background: #f8f9ff;
          border-color: #6366f1;
        }

        /* ===== DEMO LAYOUT ===== */
        .demo-info {
          flex: 1;
          max-width: 500px;
        }

        .demo-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 8px;
        }

        .demo-desc {
          font-size: 14px;
          color: #8b8fa8;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .state-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .state-btn {
          padding: 10px 16px;
          background: white;
          border: 1px solid #e0e3eb;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #6b6f8a;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .state-btn:hover {
          border-color: #6366f1;
          color: #6366f1;
        }

        .state-btn.active {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }

        .comparison-box {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .comparison-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8b8fa8;
          margin-bottom: 16px;
        }

        .comparison-row {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .comparison-label {
          width: 80px;
          font-size: 12px;
          font-weight: 500;
          color: #a0a4b8;
          flex-shrink: 0;
        }

        .comparison-before, .comparison-after {
          flex: 1;
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 6px;
        }

        .comparison-before {
          background: #fff5f5;
          color: #dc2626;
          text-decoration: line-through;
        }

        .comparison-after {
          background: #f0fdf4;
          color: #16a34a;
        }
      `}</style>

            {/* SIDE PANEL */}
            <div className="side-panel">
                {!isListViewOpen ? (
                    <>
                        {/* Header */}
                        <div className="panel-header">
                            <div className="panel-header-left">
                                <span className="panel-icon">≡</span>
                                <div>
                                    <div className="panel-title">Ma Liste</div>
                                    <div className="panel-subtitle">Liste et actions</div>
                                </div>
                            </div>
                            <div className="panel-actions">
                                <button className="panel-btn">
                                    <span>🗑</span>
                                    <span>VIDER</span>
                                </button>
                                <button className="panel-close">›</button>
                            </div>
                        </div>

                        {/* UNIFIED SELECTOR */}
                        <div className={`list-selector-unified ${selectedList ? 'has-selection' : ''}`}>
                            <div
                                className="selector-main"
                                onClick={() => setIsListViewOpen(true)}
                            >
                                <div className="selector-icon-box">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <div className="selector-content">
                                    {selectedList ? (
                                        <>
                                            <div className="selector-value">{selectedList.name}</div>
                                            <div className="selector-meta">
                                                {selectedList.tags.map((tag, i) => (
                                                    <span key={i} className="selector-tag">{tag}</span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="selector-label">Liste de travail</div>
                                            <div className="selector-value">Aucune liste</div>
                                        </>
                                    )}
                                </div>
                                <div className="selector-actions">
                                    {selectedList && (
                                        <button
                                            className="selector-btn deselect"
                                            onClick={(e) => { e.stopPropagation(); setSelectedList(null); }}
                                            title="Désélectionner"
                                        >
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                    <button className="selector-btn">
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="stats-section">
                            <div className="stats-count">
                                {selectedList ? selectedList.count : '0'} <span>mots</span>
                            </div>
                            <div className="stats-detail">
                                {selectedList ? '22 SYLLABES · MOY. 3.1' : '0 SYLLABES · MOY. ØØ'}
                            </div>
                            {selectedList && (
                                <div className="stats-tags">
                                    <span className="stat-tag">3 NC</span>
                                    <span className="stat-tag">1 NP</span>
                                    <span className="stat-tag">1 ADJ</span>
                                    <span className="stat-tag">1 VER</span>
                                    <span className="stat-tag">1 ADV</span>
                                </div>
                            )}
                        </div>

                        {/* WORDS LIST or EMPTY STATE */}
                        {selectedList ? (
                            <div className="words-section">
                                {mockWords.map((word, i) => (
                                    <div key={i} className="word-item">
                                        {word}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">≡</div>
                                <div className="empty-state-text">
                                    Cliquez sur un mot pour<br />l'ajouter à votre liste.
                                </div>
                            </div>
                        )}

                        {/* Bottom CTA */}
                        <div className="bottom-cta">
                            <button className="cta-button">
                                <span>▶</span>
                                Lancer la sélection
                                <span>›</span>
                            </button>
                        </div>
                    </>
                ) : (
                    /* LIST VIEW (EXPANDED) */
                    <div className="list-view">
                        <div className="list-view-header">
                            <button className="back-btn" onClick={() => setIsListViewOpen(false)}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="list-view-title">
                                <h3>Mes listes</h3>
                                <span>{mockLists.length} listes sauvegardées</span>
                            </div>
                        </div>

                        <div className="search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {selectedList && (
                            <div className="deselect-option" onClick={handleDeselect}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Désélectionner la liste</span>
                            </div>
                        )}

                        <div className="lists-scroll">
                            {filteredLists.map(list => (
                                <div
                                    key={list.id}
                                    className={`list-item ${selectedList?.id === list.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectList(list)}
                                >
                                    <div className="list-item-content">
                                        <div className="list-item-name">{list.name}</div>
                                        <div className="list-item-info">
                                            <span className="list-item-date">{list.date}</span>
                                            <div className="list-item-tags">
                                                {list.tags.map((tag, i) => (
                                                    <span key={i} className="list-item-tag">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="list-item-right">
                                        <div className="list-item-count">{list.count}</div>
                                        <button className="list-item-menu" onClick={(e) => e.stopPropagation()}>
                                            •••
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="new-list-btn">
                            <span>+</span>
                            Nouvelle liste
                        </button>
                    </div>
                )}
            </div>

            {/* DEMO INFO */}
            <div className="demo-info">
                <h1 className="demo-title">Sélecteur Unifié + Liste de mots</h1>
                <p className="demo-desc">
                    L'élément "Mes listes" affiche maintenant la liste sélectionnée et permet de la désélectionner. Les mots de la liste s'affichent en dessous.
                </p>

                <div className="state-toggle">
                    <button
                        className={`state-btn ${!selectedList && !isListViewOpen ? 'active' : ''}`}
                        onClick={() => { setSelectedList(null); setIsListViewOpen(false); }}
                    >
                        Sans sélection
                    </button>
                    <button
                        className={`state-btn ${selectedList && !isListViewOpen ? 'active' : ''}`}
                        onClick={() => { setSelectedList(mockLists[1]); setIsListViewOpen(false); }}
                    >
                        Avec sélection
                    </button>
                    <button
                        className={`state-btn ${isListViewOpen ? 'active' : ''}`}
                        onClick={() => setIsListViewOpen(true)}
                    >
                        Vue liste
                    </button>
                </div>

                <div className="comparison-box">
                    <div className="comparison-title">Avant → Après</div>

                    <div className="comparison-row">
                        <div className="comparison-label">Structure</div>
                        <div className="comparison-before">2 éléments séparés</div>
                        <div className="comparison-after">1 élément unifié</div>
                    </div>

                    <div className="comparison-row">
                        <div className="comparison-label">Désélection</div>
                        <div className="comparison-before">Impossible</div>
                        <div className="comparison-after">Bouton ✕ + option dans liste</div>
                    </div>

                    <div className="comparison-row">
                        <div className="comparison-label">Feedback</div>
                        <div className="comparison-before">Peu visible</div>
                        <div className="comparison-after">Bordure + fond violet</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
