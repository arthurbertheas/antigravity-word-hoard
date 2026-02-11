import { useState, useRef, useEffect } from "react";

const initialLists = [
  {
    id: 1, name: "Mots à retravailler — 39/02/2026", count: 3,
    date: "Aujourd'hui à 21h03", tags: ["ratés"],
    words: ["clocheton", "minerve", "muscat"],
  },
  {
    id: 2, name: "Sons complexes — Léo", count: 8,
    date: "Hier à 14h35", tags: ["CP", "Phonologie"],
    words: ["chrysanthème", "pharmacie", "orthographe", "sympathique", "rhododendron", "phénomène", "catastrophe", "bibliothèque"],
  },
  {
    id: 3, name: "xxx", count: 1,
    date: "Aujourd'hui à 12h25", tags: ["ratés", "CE1"],
    words: ["capitonnage"],
  },
  {
    id: 4, name: "Mots à retravailler — 20/02", count: 4,
    date: "Aujourd'hui à 12h25", tags: ["ratés", "CP", "CE1"],
    words: ["tamarin", "bouture", "bryone", "bugle"],
  },
];

const tagSuggestions = ["CP", "CE1", "CE2", "CM1", "CM2", "Phonologie", "Lecture", "Orthographe"];

/* ========== Icons ========== */
const Icons = {
  back: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  dots: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="1.3" fill="currentColor"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="12" cy="8" r="1.3" fill="currentColor"/></svg>,
  edit: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 5H13M6 5V3.5C6 3.22 6.22 3 6.5 3H9.5C9.78 3 10 3.22 10 3.5V5M7 7.5V12M9 7.5V12M4 5L4.5 14H11.5L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  duplicate: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M10.5 5.5V4C10.5 2.9 9.6 2 8.5 2H4C2.9 2 2 2.9 2 4V8.5C2 9.6 2.9 10.5 4 10.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  play: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L13 8L5 13V3Z" fill="currentColor"/></svg>,
};

/* ========== Overlay ========== */
function Overlay({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,20,35,0.45)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
        {children}
      </div>
    </div>
  );
}

/* ========== Dropdown Menu ========== */
function ActionMenu({ isOpen, onClose, onEdit, onDelete, anchorRef }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!isOpen) return;
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    const h = (e) => { if (ref.current && !ref.current.contains(e.target) && anchorRef?.current && !anchorRef.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    { icon: Icons.edit, label: "Modifier", color: "#6C5CE7", bg: "#F0EDFF", action: onEdit },
    { divider: true },
    { icon: Icons.trash, label: "Supprimer", color: "#EF4444", bg: "#FEE2E2", action: onDelete },
  ];

  return (
    <div ref={ref} style={{
      position: "fixed", top: pos.top, right: pos.right, zIndex: 9999,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)",
      borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset",
      overflow: "hidden", width: 190,
      animation: "menuPop 0.2s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      {items.map((item, i) => item.divider ? (
        <div key={i} style={{ height: 1, background: "#F3F4F6", margin: "4px 12px" }} />
      ) : (
        <button key={i} onClick={() => { onClose(); item.action(); }} style={{
          width: "100%", padding: "10px 14px", border: "none", background: "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 11,
          fontSize: 13.5, fontWeight: 500, color: item.color === "#EF4444" ? "#EF4444" : "#374151",
          fontFamily: "'DM Sans', sans-serif", transition: "background 0.12s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = item.color === "#EF4444" ? "#FEF2F2" : "#F8F9FC"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: item.bg, color: item.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{item.icon}</div>
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ========== Delete Modal ========== */
function DeleteModal({ isOpen, list, onConfirm, onCancel }) {
  return (
    <Overlay isOpen={isOpen} onClose={onCancel}>
      <div style={{
        background: "#fff", borderRadius: 22, width: 380, maxWidth: "92vw",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15)", padding: 28, textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, margin: "0 auto 16px",
          background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#EF4444", animation: "shake 0.5s ease 0.15s",
        }}>{Icons.trash}</div>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>
          Supprimer cette liste ?
        </h3>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 22 }}>
          <strong style={{ color: "#1A1A2E" }}>"{list?.name}"</strong><br />sera définitivement supprimée.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E5E7EB",
            background: "#fff", color: "#6B7280", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Annuler</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
          }}>Supprimer</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ========== Edit Modal ========== */
function EditModal({ isOpen, list, onSave, onCancel }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && list) {
      setName(list.name);
      setDesc("");
      setTags([...list.tags]);
    }
  }, [isOpen, list]);

  const addTag = (t) => { if (t && !tags.includes(t) && tags.length < 8) { setTags([...tags, t]); setTagInput(""); } };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  return (
    <Overlay isOpen={isOpen} onClose={onCancel}>
      <div style={{
        background: "#fff", borderRadius: 22, width: 440, maxWidth: "92vw",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid #F3F4F6",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: "#F0EDFF",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#6C5CE7",
            }}>{Icons.edit}</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
              Modifier la liste
            </h3>
          </div>
          <button onClick={onCancel} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer", color: "#9CA3AF",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{Icons.close}</button>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nom */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 6, display: "block" }}>
              Nom <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input type="text" value={name} onChange={e => setName(e.target.value.slice(0, 50))}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10,
                  border: "1.5px solid #C4B8FF", background: "#fff",
                  fontSize: 14, color: "#1A1A2E", outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9CA3AF" }}>
                {name.length}/50
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 6, display: "block" }}>
              Description <span style={{ fontSize: 11, fontWeight: 400, color: "#9CA3AF" }}>(optionnel)</span>
            </label>
            <textarea value={desc} onChange={e => setDesc(e.target.value.slice(0, 200))} rows={2}
              placeholder="Pour travailler avec Léo les sons complexes..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #E5E7EB", background: "#fff",
                fontSize: 14, color: "#1A1A2E", outline: "none", resize: "vertical",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 6, display: "block" }}>
              Étiquettes
            </label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
              padding: "8px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
              background: "#fff", minHeight: 40, cursor: "text",
            }} onClick={() => inputRef.current?.focus()}>
              {tags.map(t => (
                <span key={t} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 10px", borderRadius: 14,
                  background: "#F0EDFF", color: "#6C5CE7", fontSize: 12, fontWeight: 500,
                }}>
                  {t}
                  <button onClick={e => { e.stopPropagation(); removeTag(t); }} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6C5CE7", fontSize: 13, padding: 0, lineHeight: 1,
                  }}>×</button>
                </span>
              ))}
              <input ref={inputRef} type="text" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); addTag(tagInput.trim()); } }}
                placeholder={tags.length === 0 ? "Ajouter..." : ""}
                style={{
                  border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 80,
                  fontFamily: "'DM Sans', sans-serif", color: "#1A1A2E", background: "transparent",
                }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {tagSuggestions.filter(s => !tags.includes(s)).slice(0, 6).map(s => (
                <button key={s} onClick={() => addTag(s)} style={{
                  padding: "2px 10px", borderRadius: 12, border: "1px solid #E5E7EB",
                  background: "#F8F9FC", color: "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Words preview */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 6, display: "block" }}>
              Mots ({list?.words?.length || 0})
            </label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 5,
              padding: "12px 14px", borderRadius: 10, background: "#F8F9FC",
              border: "1px solid #F3F4F6", maxHeight: 100, overflowY: "auto",
            }}>
              {list?.words?.map((w, i) => (
                <span key={i} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 16,
                  background: "#fff", border: "1px solid #E5E7EB",
                  fontSize: 13, color: "#374151", fontWeight: 500,
                }}>
                  {w}
                  <button style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#C4C4C4", fontSize: 13, padding: 0, lineHeight: 1,
                  }}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px 22px", display: "flex", gap: 10, justifyContent: "flex-end",
          borderTop: "1px solid #F3F4F6",
        }}>
          <button onClick={onCancel} style={{
            padding: "10px 20px", borderRadius: 10, border: "1.5px solid #E5E7EB",
            background: "#fff", color: "#6B7280", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}>Annuler</button>
          <button onClick={() => onSave({ name, desc, tags })} disabled={!name.trim()} style={{
            padding: "10px 22px", borderRadius: 10, border: "none",
            background: name.trim() ? "#6C5CE7" : "#C4B8FF", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: name.trim() ? "pointer" : "not-allowed",
            boxShadow: name.trim() ? "0 3px 10px rgba(108,92,231,0.3)" : "none",
          }}>Enregistrer</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ========== List Card ========== */
function ListCard({ list, isLoaded, onLoad, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dotsRef = useRef(null);

  return (
    <div
      onClick={() => !menuOpen && onLoad(list)}
      style={{
        padding: "14px 16px", borderRadius: 16,
        border: isLoaded ? "1.5px solid #6C5CE7" : "1px solid #E5E7EB",
        background: isLoaded ? "rgba(108,92,231,0.03)" : "#fff",
        display: "flex", flexDirection: "column", gap: 7,
        cursor: "pointer", position: "relative", overflow: "visible",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={e => { if (!isLoaded && !menuOpen) { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
      onMouseLeave={e => { if (!isLoaded) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}}
    >
      {/* Row 1 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 600,
          color: isLoaded ? "#6C5CE7" : "#1A1A2E", lineHeight: 1.35, flex: 1,
        }}>{list.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
            color: isLoaded ? "#6C5CE7" : "#6B7280",
            background: isLoaded ? "rgba(108,92,231,0.08)" : "#F3F4F6",
            padding: "2px 8px", borderRadius: 6,
          }}>{list.count} mots</span>
          <div style={{ position: "relative" }}>
            <button ref={dotsRef} onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{
              width: 28, height: 28, borderRadius: 8, border: "none",
              background: menuOpen ? "#F0EDFF" : "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: menuOpen ? "#6C5CE7" : "#C4C4C4", transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!menuOpen) { e.currentTarget.style.color = "#9CA3AF"; e.currentTarget.style.background = "#F8F9FC"; }}}
            onMouseLeave={e => { if (!menuOpen) { e.currentTarget.style.color = "#C4C4C4"; e.currentTarget.style.background = "transparent"; }}}
            >{Icons.dots}</button>
            <ActionMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}
              onEdit={() => onEdit(list)} onDelete={() => onDelete(list)} anchorRef={dotsRef}
            />
          </div>
        </div>
      </div>
      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{list.date}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {list.tags.map(t => (
          <span key={t} style={{
            padding: "2px 10px", borderRadius: 10,
            background: isLoaded ? "rgba(108,92,231,0.08)" : "#F0EDFF",
            color: "#7C6FD4", fontSize: 11.5, fontWeight: 500,
          }}>{t}</span>
        ))}
      </div>
      <span style={{
        fontSize: 12, color: "#B0B5C0", fontStyle: "italic",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{list.words.slice(0, 3).join(", ")}{list.words.length > 3 ? "…" : ""}</span>


    </div>
  );
}

/* ========== MAIN APP ========== */
export default function App() {
  const [lists, setLists] = useState(initialLists);
  const [search, setSearch] = useState("");
  const [loadedId, setLoadedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = lists.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const handleLoad = (list) => {
    setLoadedId(list.id);
    showToast(`✓ "${list.name}" chargée — ${list.count} mots`);
  };

  const handleDelete = () => {
    const name = deleteTarget.name;
    setLists(prev => prev.filter(l => l.id !== deleteTarget.id));
    if (loadedId === deleteTarget.id) setLoadedId(null);
    setDeleteTarget(null);
    showToast(`🗑️ "${name}" supprimée`);
  };

  const handleEdit = ({ name, desc, tags }) => {
    setLists(prev => prev.map(l => l.id === editTarget.id ? { ...l, name, tags } : l));
    setEditTarget(null);
    showToast(`✏️ Liste modifiée`);
  };

  const handleDuplicate = (list) => {
    const newList = { ...list, id: Date.now(), name: `${list.name} (copie)`, date: "À l'instant" };
    setLists(prev => [newList, ...prev]);
    showToast(`📋 "${list.name}" dupliquée`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: hsl(230 25% 95%); }
        input::placeholder, textarea::placeholder { color: #B0B5C0; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes menuPop { from { opacity: 0; transform: scale(0.92) translateY(-4px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes shake { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-8deg) } 40% { transform: rotate(8deg) } 60% { transform: rotate(-4deg) } 80% { transform: rotate(4deg) } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px) } to { opacity: 1; transform: translate(-50%, 0) } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "flex-start",
        justifyContent: "center", padding: "32px 16px",
      }}>
        <div style={{
          width: 350, background: "#fff", borderRadius: 20,
          border: "1px solid hsl(214 32% 91%)",
          boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.08)",
          display: "flex", flexDirection: "column",
          maxHeight: "90vh",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "20px 20px 16px", borderBottom: "1px solid #F3F4F6",
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
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                {lists.length} listes sauvegardées
              </p>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "14px 16px 8px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 14px", borderRadius: 10,
              border: "1.5px solid #E5E7EB", background: "#F8F9FC",
            }}>
              <span style={{ color: "#9CA3AF", flexShrink: 0 }}>{Icons.search}</span>
              <input type="text" placeholder="Rechercher une liste..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13, color: "#1A1A2E", fontFamily: "'DM Sans', sans-serif", flex: 1,
                }}
              />
            </div>
          </div>

          {/* Cards */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "8px 16px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {filtered.map(list => (
              <ListCard key={list.id} list={list} isLoaded={loadedId === list.id}
                onLoad={handleLoad}
                onEdit={l => setEditTarget(l)}
                onDelete={l => setDeleteTarget(l)}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                Aucune liste trouvée
              </div>
            )}
          </div>

          {/* Create */}
          <div style={{ padding: "12px 16px 18px" }}>
            <button style={{
              width: "100%", padding: "11px 16px", borderRadius: 12,
              border: "2px dashed #C4B8FF", background: "#F8F6FF",
              color: "#6C5CE7", fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EDEAFF"; e.currentTarget.style.borderColor = "#6C5CE7"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F8F6FF"; e.currentTarget.style.borderColor = "#C4B8FF"; }}
            >
              {Icons.plus} Créer une nouvelle liste
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteModal isOpen={!!deleteTarget} list={deleteTarget}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <EditModal isOpen={!!editTarget} list={editTarget}
        onSave={handleEdit} onCancel={() => setEditTarget(null)} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%",
          background: "rgba(26,26,46,0.92)", backdropFilter: "blur(12px)",
          color: "#fff", padding: "10px 20px", borderRadius: 12,
          fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)", zIndex: 999,
        }}>{toast}</div>
      )}
    </>
  );
}
