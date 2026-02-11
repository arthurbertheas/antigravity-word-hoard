import { useState, useRef, useEffect } from "react";

const lists = [
  { id: 1, name: "Mots à retravailler — 39/02", count: 3, date: "Auj. 21h03", tags: ["ratés"] },
  { id: 2, name: "Sons complexes — Léo", count: 8, date: "Hier 14h35", tags: ["CP", "Phono"] },
  { id: 3, name: "xxx", count: 1, date: "Auj. 12h25", tags: ["ratés", "CE1"] },
  { id: 4, name: "Mots à retravailler — 20/02", count: 4, date: "Auj. 12h25", tags: ["ratés", "CP"] },
  { id: 5, name: "Graphèmes PH — Marie", count: 12, date: "15/01", tags: ["CE2", "Lecture"] },
  { id: 6, name: "Révisions trimestre 2", count: 15, date: "12/01", tags: ["CM1"] },
  { id: 7, name: "Mots irréguliers", count: 6, date: "10/01", tags: ["CE2", "Ortho"] },
  { id: 8, name: "Confusions b/d — Tom", count: 9, date: "08/01", tags: ["CP", "Phono"] },
  { id: 9, name: "Syllabes complexes CCV", count: 7, date: "05/01", tags: ["CE1"] },
  { id: 10, name: "Mots outils fréquents", count: 20, date: "02/01", tags: ["CP"] },
  { id: 11, name: "Lecture rapide — groupe A", count: 14, date: "28/12", tags: ["CE1", "Lecture"] },
  { id: 12, name: "Dictée préparée S12", count: 10, date: "22/12", tags: ["CM1", "Ortho"] },
];

const Icons = {
  back: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  dots: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3.5" cy="7" r="1.1" fill="currentColor"/><circle cx="7" cy="7" r="1.1" fill="currentColor"/><circle cx="10.5" cy="7" r="1.1" fill="currentColor"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 5H13M6 5V3.5C6 3.22 6.22 3 6.5 3H9.5C9.78 3 10 3.22 10 3.5V5M7 7.5V12M9 7.5V12M4 5L4.5 14H11.5L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};

/* ========== Dropdown ========== */
function ActionMenu({ isOpen, onClose, onEdit, onDelete, anchorRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    const h = (e) => { if (ref.current && !ref.current.contains(e.target) && !anchorRef.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={ref} style={{
      position: "fixed", top: pos.top, right: pos.right, zIndex: 9999,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)",
      borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 10px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset",
      overflow: "hidden", width: 170,
      animation: "menuPop 0.18s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      {[
        { icon: Icons.edit, label: "Modifier", color: "#6C5CE7", bg: "#F0EDFF", action: onEdit },
        { icon: Icons.trash, label: "Supprimer", color: "#EF4444", bg: "#FEE2E2", action: onDelete },
      ].map((item, i) => (
        <button key={i} onClick={() => { onClose(); item.action(); }} style={{
          width: "100%", padding: "9px 12px", border: "none", background: "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, fontWeight: 500, color: item.color === "#EF4444" ? "#EF4444" : "#374151",
          fontFamily: "'DM Sans', sans-serif", transition: "background 0.1s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = item.color === "#EF4444" ? "#FEF2F2" : "#F8F9FC"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: item.bg, color: item.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{item.icon}</div>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ========== Compact Row ========== */
function CompactRow({ list, isLoaded, onLoad, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dotsRef = useRef(null);

  return (
    <div
      onClick={() => !menuOpen && onLoad(list)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 12,
        border: isLoaded ? "1.5px solid #6C5CE7" : "1px solid transparent",
        background: isLoaded ? "rgba(108,92,231,0.03)" : "transparent",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => { if (!isLoaded) e.currentTarget.style.background = "#F8F9FC"; }}
      onMouseLeave={e => { if (!isLoaded) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Name + tags */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600,
            color: isLoaded ? "#6C5CE7" : "#1A1A2E",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{list.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: "#B0B5C0" }}>{list.date}</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#D1D5DB" }} />
          {list.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              padding: "1px 7px", borderRadius: 8,
              background: isLoaded ? "rgba(108,92,231,0.08)" : "#F0EDFF",
              color: "#7C6FD4", fontSize: 10, fontWeight: 500,
            }}>{t}</span>
          ))}
          {list.tags.length > 2 && (
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>+{list.tags.length - 2}</span>
          )}
        </div>
      </div>

      {/* Count badge */}
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
        color: isLoaded ? "#6C5CE7" : "#6B7280",
        background: isLoaded ? "rgba(108,92,231,0.08)" : "#F3F4F6",
        padding: "2px 7px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0,
      }}>{list.count}</span>

      {/* Dots */}
      <button ref={dotsRef} onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{
        width: 26, height: 26, borderRadius: 7, border: "none",
        background: menuOpen ? "#F0EDFF" : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        color: menuOpen ? "#6C5CE7" : "#C4C4C4", transition: "all 0.12s", flexShrink: 0,
      }}
      onMouseEnter={e => { if (!menuOpen) { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.background = "#F3F4F6"; }}}
      onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.color = "#C4C4C4"; e.currentTarget.style.background = "transparent"; }}}
      >{Icons.dots}</button>

      <ActionMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}
        onEdit={() => onEdit(list)} onDelete={() => onDelete(list)} anchorRef={dotsRef} />
    </div>
  );
}

/* ========== Panel ========== */
function Panel({ compact, lists: data }) {
  const [search, setSearch] = useState("");
  const [loadedId, setLoadedId] = useState(1);
  const [toast, setToast] = useState(null);

  const filtered = data.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  return (
    <div style={{
      width: compact ? 340 : 340, background: "#fff", borderRadius: 20,
      border: "1px solid hsl(214 32% 91%)",
      boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.08)",
      display: "flex", flexDirection: "column",
      height: 560,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: compact ? "16px 16px 12px" : "20px 20px 16px",
        borderBottom: "1px solid #F3F4F6",
      }}>
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          border: "1.5px solid #E5E7EB", background: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#6B7280", transition: "all 0.15s", flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#C4B8FF"; e.currentTarget.style.color = "#6C5CE7"; e.currentTarget.style.background = "#F8F6FF"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = "#fff"; }}
        >{Icons.back}</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
            Mes listes
          </h2>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{data.length} listes</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: compact ? "10px 12px 4px" : "14px 16px 8px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: compact ? "7px 12px" : "9px 14px",
          borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#F8F9FC",
        }}>
          <span style={{ color: "#9CA3AF", flexShrink: 0 }}>{Icons.search}</span>
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, color: "#1A1A2E", fontFamily: "'DM Sans', sans-serif", flex: 1,
            }}
          />
        </div>
      </div>

      {/* Counter */}
      {compact && (
        <div style={{
          padding: "6px 16px 2px",
          fontSize: 10, fontWeight: 600, color: "#9CA3AF",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </div>
      )}

      {/* Lists */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: compact ? "4px 4px" : "8px 16px",
        display: "flex", flexDirection: "column",
        gap: compact ? 1 : 8,
      }}>
        {compact ? (
          filtered.map(l => (
            <CompactRow key={l.id} list={l} isLoaded={loadedId === l.id}
              onLoad={l => { setLoadedId(l.id); showToast(`✓ "${l.name}" chargée`); }}
              onEdit={l => showToast(`✏️ Modifier: ${l.name}`)}
              onDelete={l => showToast(`🗑️ Supprimer: ${l.name}`)}
            />
          ))
        ) : (
          filtered.map(l => (
            <div key={l.id} onClick={() => { setLoadedId(l.id); showToast(`✓ "${l.name}" chargée`); }}
              style={{
                padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                border: loadedId === l.id ? "1.5px solid #6C5CE7" : "1px solid #E5E7EB",
                background: loadedId === l.id ? "rgba(108,92,231,0.03)" : "#fff",
                display: "flex", flexDirection: "column", gap: 7,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (loadedId !== l.id) { e.currentTarget.style.borderColor = "#D1D5DB"; }}}
              onMouseLeave={e => { if (loadedId !== l.id) { e.currentTarget.style.borderColor = "#E5E7EB"; }}}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600, color: loadedId === l.id ? "#6C5CE7" : "#1A1A2E", lineHeight: 1.35, flex: 1 }}>
                  {l.name}
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
                  color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 6, flexShrink: 0, marginLeft: 8,
                }}>{l.count} mots</span>
              </div>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{l.date}</span>
              <div style={{ display: "flex", gap: 5 }}>
                {l.tags.map(t => (
                  <span key={t} style={{ padding: "2px 10px", borderRadius: 10, background: "#F0EDFF", color: "#7C6FD4", fontSize: 11.5, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create */}
      <div style={{ padding: compact ? "8px 12px 14px" : "12px 16px 18px" }}>
        <button style={{
          width: "100%", padding: compact ? "9px 12px" : "11px 16px", borderRadius: 12,
          border: "2px dashed #C4B8FF", background: "#F8F6FF",
          color: "#6C5CE7", fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#EDEAFF"; e.currentTarget.style.borderColor = "#6C5CE7"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#F8F6FF"; e.currentTarget.style.borderColor = "#C4B8FF"; }}
        >{Icons.plus} Nouvelle liste</button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%",
          background: "rgba(26,26,46,0.92)", backdropFilter: "blur(12px)",
          color: "#fff", padding: "8px 18px", borderRadius: 10,
          fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
          animation: "toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)", zIndex: 999,
        }}>{toast}</div>
      )}
    </div>
  );
}

/* ========== MAIN ========== */
export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: hsl(230 25% 95%); }
        input::placeholder { color: #B0B5C0; }
        @keyframes menuPop { from { opacity: 0; transform: scale(0.92) translateY(-4px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px) } to { opacity: 1; transform: translate(-50%, 0) } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh", padding: "32px 16px",
        display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", alignItems: "flex-start",
      }}>
        {/* Current */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{
              fontFamily: "'Sora', sans-serif", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "4px 14px", borderRadius: 8, background: "#F3F4F6", color: "#6B7280",
            }}>Actuel — Cards</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>~4 listes visibles</span>
          </div>
          <Panel compact={false} lists={lists} />
        </div>

        {/* Compact */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{
              fontFamily: "'Sora', sans-serif", fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "4px 14px", borderRadius: 8, background: "#F0EDFF", color: "#6C5CE7",
            }}>Compact — Rows</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>~10 listes visibles</span>
          </div>
          <Panel compact={true} lists={lists} />
        </div>
      </div>
    </>
  );
}
