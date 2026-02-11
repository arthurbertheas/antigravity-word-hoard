import { useState } from "react";

const Icons = {
  folder: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5C2 4.17 2.67 3.5 3.5 3.5H6L7.5 5.5H12.5C13.33 5.5 14 6.17 14 7V12C14 12.83 13.33 13.5 12.5 13.5H3.5C2.67 13.5 2 12.83 2 12V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  save: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M12.5 14H3.5C2.95 14 2.5 13.55 2.5 13V3C2.5 2.45 2.95 2 3.5 2H10.5L13.5 5V13C13.5 13.55 13.05 14 12.5 14Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2V5.5H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  play: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L13 8L5 13V3Z" fill="currentColor"/></svg>,
  forward: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  unlink: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  link: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5L9.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 4L11 2C12.1 2 14 2.9 14 4L12 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 12L5 14C3.9 14 2 13.1 2 12L4 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

/* ========== Shared ========== */
function PanelShell({ children, height = 520 }) {
  return (
    <div style={{
      width: 290, background: "#fff", borderRadius: 20,
      border: "1px solid hsl(214 32% 91%)",
      boxShadow: "0 4px 20px -2px rgb(0 0 0 / 0.08)",
      display: "flex", flexDirection: "column", height,
    }}>{children}</div>
  );
}

function PanelHeader() {
  return (
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
  );
}

function MesListesButton() {
  return (
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
  );
}

function WordRow({ word, index, isNew }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "7px 11px", borderRadius: 9,
      background: isNew ? "rgba(108,92,231,0.04)" : "#fff",
      border: isNew ? "1px solid #E0DAFB" : "1px solid #F3F4F6",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, color: "#C4C4C4", minWidth: 16 }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>{word}</span>
        {isNew && <span style={{ fontSize: 8, fontWeight: 700, color: "#6C5CE7", background: "#F0EDFF", padding: "1px 5px", borderRadius: 5, letterSpacing: "0.02em" }}>AJOUTÉ</span>}
      </div>
      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", fontSize: 14 }}>×</button>
    </div>
  );
}

/* ===== Loaded list block — NEUTRAL STYLE (less violet) ===== */
function LoadedListBlock() {
  return (
    <div style={{
      padding: "9px 11px", borderRadius: 11,
      border: "1px solid #E5E7EB", background: "#F8F9FC",
      display: "flex", alignItems: "center", gap: 9,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: "#fff", border: "1px solid #E5E7EB",
        color: "#6B7280",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 5C2 4.17 2.67 3.5 3.5 3.5H6L7.5 5.5H12.5C13.33 5.5 14 6.17 14 7V12C14 12.83 13.33 13.5 12.5 13.5H3.5C2.67 13.5 2 12.83 2 12V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, color: "#374151",
          display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>Mots à retravailler — 39/02</span>
        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          {["ratés", "CP"].map(t => (
            <span key={t} style={{
              padding: "1px 6px", borderRadius: 7,
              background: "#EEEDF5", color: "#6B7280", fontSize: 10, fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </div>
      <button style={{
        width: 26, height: 26, borderRadius: 6, border: "none",
        background: "transparent", color: "#B0B5C0",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        transition: "all 0.12s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "#F0EDFF"; e.currentTarget.style.color = "#6C5CE7"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B0B5C0"; }}
      title="Modifier nom, description, tags"
      >{Icons.edit}</button>
      <button style={{
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
  );
}

/* ===== CTA Button ===== */
function LaunchButton({ disabled }) {
  return (
    <button disabled={disabled} style={{
      width: "100%", padding: "11px 14px", borderRadius: 13,
      border: "none", background: disabled ? "#E5E7EB" : "#6C5CE7",
      color: "#fff", fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: disabled ? "none" : "0 3px 12px rgba(108,92,231,0.3)",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = "#5A4BD1"; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = "#6C5CE7"; }}
    >
      {Icons.play} Lancer la sélection →
    </button>
  );
}

function SaveButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "9px 14px", borderRadius: 11,
      border: "1.5px solid #E5E7EB", background: "#fff",
      color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6C5CE7"; e.currentTarget.style.color = "#6C5CE7"; e.currentTarget.style.background = "#F8F6FF"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#fff"; }}
    >
      {Icons.save} {label}
    </button>
  );
}

/* ========== STATE 1: Empty — no words ========== */
function State1() {
  return (
    <PanelShell>
      <PanelHeader />
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        <MesListesButton />
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: "#F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF",
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M6 5H16M6 9H16M6 13H16M6 17H11M3 5H3.01M3 9H3.01M3 13H3.01M3 17H3.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", fontStyle: "italic", lineHeight: 1.4 }}>
            Cliquez sur un mot pour<br />l'ajouter à votre liste
          </p>
        </div>
      </div>
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 7 }}>
        <LaunchButton disabled={true} />
      </div>
    </PanelShell>
  );
}

/* ========== STATE 2: Words selected, no saved list ========== */
function State2() {
  return (
    <PanelShell>
      <PanelHeader />
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 9, flex: 1, overflow: "hidden" }}>
        <MesListesButton />
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>3</span>
          <span style={{ fontSize: 12, color: "#6B7280" }}>mots</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {["aile", "aide", "agréable"].map((w, i) => <WordRow key={w} word={w} index={i} />)}
        </div>
      </div>
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 7 }}>
        <SaveButton label="Sauvegarder cette liste" />
        <LaunchButton disabled={false} />
      </div>
    </PanelShell>
  );
}

/* ========== STATE 3: List loaded, no changes ========== */
function State3() {
  return (
    <PanelShell>
      <PanelHeader />
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 9, flex: 1, overflow: "hidden" }}>
        <MesListesButton />
        <LoadedListBlock />
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>4</span>
          <span style={{ fontSize: 12, color: "#6B7280" }}>mots</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {["chamelier", "chèvrefeuille", "chatoiement", "sandre"].map((w, i) => <WordRow key={w} word={w} index={i} />)}
        </div>
      </div>
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 7 }}>
        <LaunchButton disabled={false} />
      </div>
    </PanelShell>
  );
}

/* ========== STATE 4: List loaded, with changes ========== */
function State4() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 600);
  };

  return (
    <PanelShell>
      <PanelHeader />
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 9, flex: 1, overflow: "hidden" }}>
        <MesListesButton />
        <LoadedListBlock />
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>7</span>
          <span style={{ fontSize: 12, color: "#6B7280" }}>mots</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {["chamelier", "chèvrefeuille", "chatoiement", "sandre"].map((w, i) => <WordRow key={w} word={w} index={i} />)}
          {["amour", "ami", "amitié"].map((w, i) => <WordRow key={w} word={w} index={4 + i} isNew={true} />)}
        </div>
      </div>
      <div style={{ padding: "10px 14px 14px", borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 7 }}>
        {!saving && !saved && <SaveButton label="Sauvegarder les modifications" onClick={handleSave} />}
        {saving && (
          <div style={{
            width: "100%", padding: "9px 14px", borderRadius: 11,
            border: "1.5px solid #E5E7EB", background: "#F8F9FC",
            color: "#9CA3AF", fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <div style={{ width: 14, height: 14, border: "2px solid #E5E7EB", borderTopColor: "#6C5CE7", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            Sauvegarde…
          </div>
        )}
        {saved && (
          <div style={{
            width: "100%", padding: "9px 14px", borderRadius: 11,
            border: "1.5px solid #A7F3D0", background: "#E8FBF5",
            color: "#059669", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            animation: "fadeIn 0.2s ease",
          }}>
            {Icons.check} Sauvegardé
          </div>
        )}
        <LaunchButton disabled={false} />
      </div>
    </PanelShell>
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
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      <div style={{
        minHeight: "100vh", padding: "20px 8px",
        display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", alignItems: "flex-start",
      }}>
        {[
          { label: "Vide", sub: "Aucun mot sélectionné", color: "#9CA3AF", bg: "#F3F4F6", comp: <State1 /> },
          { label: "Mots sélectionnés", sub: "Pas de liste liée", color: "#374151", bg: "#F3F4F6", comp: <State2 /> },
          { label: "Liste chargée", sub: "À jour, pas de modif", color: "#059669", bg: "#E8FBF5", comp: <State3 /> },
          { label: "Liste modifiée", sub: "Mots ajoutés/retirés", color: "#D97706", bg: "#FEF3C7", comp: <State4 /> },
        ].map(({ label, sub, color, bg, comp }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ textAlign: "center" }}>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: 9, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "3px 10px", borderRadius: 6, background: bg, color,
              }}>{label}</span>
              <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}>{sub}</p>
            </div>
            {comp}
          </div>
        ))}
      </div>
    </>
  );
}
