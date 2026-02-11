import { useState, useEffect } from "react";

const Icons = {
  folder: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 5C2 4.17 2.67 3.5 3.5 3.5H6L7.5 5.5H12.5C13.33 5.5 14 6.17 14 7V12C14 12.83 13.33 13.5 12.5 13.5H3.5C2.67 13.5 2 12.83 2 12V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  unlink: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  save: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M12.5 14H3.5C2.95 14 2.5 13.55 2.5 13V3C2.5 2.45 2.95 2 3.5 2H10.5L13.5 5V13C13.5 13.55 13.05 14 12.5 14Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2V5.5H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L13 8L5 13V3Z" fill="currentColor"/></svg>,
  forward: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
};

const tagSuggestions = ["CE2", "CM1", "CM2", "Phonologie", "Lecture", "Orthographe"];

/* ========== Edit Modal ========== */
function EditModal({ isOpen, onClose, onSave, initialName, initialTags }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialName || "");
      setDesc("");
      setTags(initialTags ? [...initialTags] : []);
    }
  }, [isOpen]);

  const addTag = (t) => { if (t && !tags.includes(t) && tags.length < 8) { setTags([...tags, t]); setTagInput(""); } };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,20,35,0.45)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 22, width: 420, maxWidth: "92vw",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15)", overflow: "hidden",
        animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 22px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid #F3F4F6",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "#F0EDFF",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#6C5CE7",
            }}>{Icons.edit}</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
              Modifier la liste
            </h3>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer", color: "#9CA3AF",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{Icons.close}</button>
        </div>

        {/* Form */}
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Nom */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 5, display: "block" }}>
              Nom de la liste <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input type="text" value={name} onChange={e => setName(e.target.value.slice(0, 50))}
                style={{
                  width: "100%", padding: "10px 50px 10px 14px", borderRadius: 10,
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
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 5, display: "block" }}>
              Description <span style={{ fontSize: 11, fontWeight: 400, color: "#9CA3AF" }}>(optionnel)</span>
            </label>
            <textarea value={desc} onChange={e => setDesc(e.target.value.slice(0, 200))} rows={2}
              placeholder="Pour travailler les sons complexes..."
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
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 5, display: "block" }}>
              Étiquettes <span style={{ fontSize: 11, fontWeight: 400, color: "#9CA3AF" }}>(optionnel)</span>
            </label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center",
              padding: "8px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
              background: "#fff", minHeight: 38,
            }}>
              {tags.map(t => (
                <span key={t} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 9px", borderRadius: 12,
                  background: "#F0EDFF", color: "#6C5CE7", fontSize: 12, fontWeight: 500,
                }}>
                  {t}
                  <button onClick={() => removeTag(t)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6C5CE7", fontSize: 13, padding: 0, lineHeight: 1,
                  }}>×</button>
                </span>
              ))}
              <input type="text" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); addTag(tagInput.trim()); } }}
                placeholder={tags.length === 0 ? "Ajouter..." : ""}
                style={{
                  border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 70,
                  fontFamily: "'DM Sans', sans-serif", color: "#1A1A2E", background: "transparent",
                }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginRight: 2 }}>Suggestions :</span>
              {tagSuggestions.filter(s => !tags.includes(s)).slice(0, 5).map(s => (
                <button key={s} onClick={() => addTag(s)} style={{
                  padding: "2px 9px", borderRadius: 10, border: "1px solid #E5E7EB",
                  background: "#F8F9FC", color: "#6B7280", fontSize: 11, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C4B8FF"; e.currentTarget.style.color = "#6C5CE7"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#6B7280"; }}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* Words preview */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 5, display: "block" }}>
              Aperçu (4 mots)
            </label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 5,
              padding: "10px 12px", borderRadius: 10, background: "#F8F9FC", border: "1px solid #F3F4F6",
            }}>
              {["chamelier", "chèvrefeuille", "chatoiement", "sandre"].map(w => (
                <span key={w} style={{
                  padding: "4px 10px", borderRadius: 14,
                  background: "#fff", border: "1px solid #E5E7EB",
                  fontSize: 13, color: "#374151", fontWeight: 500,
                }}>{w}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 22px 20px", display: "flex", gap: 10, justifyContent: "flex-end",
          borderTop: "1px solid #F3F4F6",
        }}>
          <button onClick={onClose} style={{
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
          }}>Mettre à jour</button>
        </div>
      </div>
    </div>
  );
}

/* ========== Detach Confirm Modal ========== */
function DetachModal({ isOpen, listName, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(15,20,35,0.45)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 22, width: 380, maxWidth: "92vw",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15)", padding: 28, textAlign: "center",
        animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, margin: "0 auto 16px",
          background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M10 6V10M10 14H10.01" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="10" r="8" stroke="#D97706" strokeWidth="1.5"/>
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>
          Détacher cette liste ?
        </h3>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 22 }}>
          <strong style={{ color: "#1A1A2E" }}>"{listName}"</strong> ne sera plus liée
          à Ma Liste. Les mots resteront dans votre sélection actuelle.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid #E5E7EB",
            background: "#fff", color: "#6B7280", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Annuler</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "11px", borderRadius: 12, border: "none",
            background: "#D97706", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(217,119,6,0.25)",
          }}>Détacher</button>
        </div>
      </div>
    </div>
  );
}

/* ========== Main Panel ========== */
function Panel() {
  const [listName, setListName] = useState("Mots à retravailler — 39/02");
  const [listTags, setListTags] = useState(["ratés", "CP"]);
  const [isLinked, setIsLinked] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [detachOpen, setDetachOpen] = useState(false);
  const [detaching, setDetaching] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleEditSave = ({ name, tags }) => {
    setListName(name);
    setListTags(tags);
    setEditOpen(false);
    showToast("✏️ Liste mise à jour");
  };

  const handleDetach = () => {
    setDetachOpen(false);
    setDetaching(true);
    setTimeout(() => {
      setIsLinked(false);
      setDetaching(false);
      showToast("Liste détachée — les mots sont conservés");
    }, 400);
  };

  const handleRelink = () => {
    setIsLinked(true);
    showToast("✓ Liste reliée");
  };

  return (
    <div style={{
      width: 320, background: "#fff", borderRadius: 20,
      border: "1px solid hsl(214 32% 91%)",
      boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.08)",
      display: "flex", flexDirection: "column", height: 580,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 16px 12px", borderBottom: "1px solid #F3F4F6",
      }}>
        <button style={{
          width: 34, height: 34, borderRadius: 9, border: "1.5px solid #E5E7EB",
          background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#6B7280", flexShrink: 0,
        }}>{Icons.forward}</button>
        <div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>Ma Liste</h2>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>Liste et actions</p>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, cursor: "pointer" }}>🗑️ VIDER</span>
      </div>

      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 9, flex: 1, overflow: "hidden" }}>
        {/* Mes listes */}
        <button style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "11px 14px", borderRadius: 11,
          border: "1.5px solid #6C5CE7", background: "rgba(108,92,231,0.04)", cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ color: "#6C5CE7" }}>{Icons.folder}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6C5CE7" }}>Mes listes sauvegardées</span>
          </div>
          <span style={{ color: "#6C5CE7" }}>{Icons.forward}</span>
        </button>

        {/* Loaded list block */}
        {isLinked && !detaching && (
          <div style={{
            padding: "9px 11px", borderRadius: 11,
            border: "1px solid #E5E7EB", background: "#F8F9FC",
            display: "flex", alignItems: "center", gap: 9,
            animation: "fadeIn 0.2s ease",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#fff", border: "1px solid #E5E7EB", color: "#6B7280",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>{Icons.folder}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, color: "#374151",
                display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{listName}</span>
              <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                {listTags.map(t => (
                  <span key={t} style={{
                    padding: "1px 6px", borderRadius: 7,
                    background: "#EEEDF5", color: "#6B7280", fontSize: 10, fontWeight: 500,
                  }}>{t}</span>
                ))}
              </div>
            </div>
            {/* EDIT button */}
            <button onClick={() => setEditOpen(true)} style={{
              width: 26, height: 26, borderRadius: 6, border: "none",
              background: "transparent", color: "#B0B5C0",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F0EDFF"; e.currentTarget.style.color = "#6C5CE7"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B0B5C0"; }}
            title="Modifier nom, description, tags"
            >{Icons.edit}</button>
            {/* DETACH button */}
            <button onClick={() => setDetachOpen(true)} style={{
              width: 26, height: 26, borderRadius: 6, border: "none",
              background: "transparent", color: "#B0B5C0",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B0B5C0"; }}
            title="Détacher la liste"
            >{Icons.unlink}</button>
          </div>
        )}

        {/* Detaching animation */}
        {detaching && (
          <div style={{
            padding: "9px 11px", borderRadius: 11,
            border: "1px solid #E5E7EB", background: "#F8F9FC",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            animation: "slideOut 0.35s ease forwards",
            overflow: "hidden",
          }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Détachement…</span>
          </div>
        )}

        {/* Relink button (if detached) */}
        {!isLinked && !detaching && (
          <button onClick={handleRelink} style={{
            padding: "8px 11px", borderRadius: 11,
            border: "1.5px dashed #D1D5DB", background: "#F8F9FC",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            cursor: "pointer", transition: "all 0.15s",
            fontSize: 12, fontWeight: 500, color: "#9CA3AF",
            animation: "fadeIn 0.3s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#6C5CE7"; e.currentTarget.style.color = "#6C5CE7"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.color = "#9CA3AF"; }}
          >
            🔗 Relier à une liste sauvegardée
          </button>
        )}

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>4</span>
          <span style={{ fontSize: 12, color: "#6B7280" }}>mots</span>
        </div>

        {/* Words */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {["chamelier", "chèvrefeuille", "chatoiement", "sandre"].map((w, i) => (
            <div key={w} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "7px 11px", borderRadius: 9,
              border: "1px solid #F3F4F6", background: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: "#C4C4C4", minWidth: 16 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>{w}</span>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", fontSize: 14 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 7 }}>
        <button style={{
          width: "100%", padding: "11px 14px", borderRadius: 13,
          border: "none", background: "#6C5CE7", color: "#fff",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 3px 12px rgba(108,92,231,0.3)",
        }}>
          {Icons.play} Lancer la sélection →
        </button>
      </div>

      {/* Modals */}
      <EditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        initialName={listName}
        initialTags={listTags}
      />
      <DetachModal
        isOpen={detachOpen}
        listName={listName}
        onConfirm={handleDetach}
        onCancel={() => setDetachOpen(false)}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%",
          background: "rgba(26,26,46,0.92)", backdropFilter: "blur(12px)",
          color: "#fff", padding: "9px 18px", borderRadius: 10,
          fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
          animation: "toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)", zIndex: 999,
        }}>{toast}</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: hsl(230 25% 95%); }
        input::placeholder, textarea::placeholder { color: #B0B5C0; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes slideOut { 
          from { opacity: 1; max-height: 60px; padding: 9px 11px; margin-bottom: 0; } 
          to { opacity: 0; max-height: 0; padding: 0 11px; margin-bottom: -9px; } 
        }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px) } to { opacity: 1; transform: translate(-50%, 0) } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh", padding: "24px 16px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
            Actions sur la liste chargée
          </h1>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
            Clique ✏️ pour modifier ou ✕ pour détacher
          </p>
        </div>
        <Panel />
      </div>
    </>
  );
}
