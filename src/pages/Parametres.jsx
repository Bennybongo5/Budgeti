import { useState, useRef } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { DEFAULT_CATS, ICONS_CAT, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD } from "../constants.js";
import Modal from "../components/Modal.jsx";

const googleProvider = new GoogleAuthProvider();

export default function Parametres({ user, cats, inp, card, updTxs, updRecs, updRrecs, updDettes, updProjets, updCats, updPaieM, setDetSel, setPrjSel }) {
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [clearStep, setClearStep] = useState(1);
  const [editCat, setEditCat] = useState(null);
  const [editCatFrm, setEditCatFrm] = useState({ label: "", icon: "" });
  const [editCatCustomIco, setEditCatCustomIco] = useState("");
  const [delCat, setDelCat] = useState(null);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLbl, setNewCatLbl] = useState("");
  const [newCatIco, setNewCatIco] = useState("📦");
  const [newCatCustomIco, setNewCatCustomIco] = useState("");
  const [reorderMode, setReorderMode] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const listRef = useRef(null);
  const dragState = useRef({ from: null, over: null, moveHandler: null });

  const onTouchStart = (i) => () => {
    dragState.current.from = i;
    setDragIdx(i);
    const moveHandler = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const row = el?.closest('[data-catrow]');
      if (row) {
        const idx = +row.dataset.catrow;
        if (dragState.current.over !== idx) {
          dragState.current.over = idx;
          setDragOverIdx(idx);
        }
      }
    };
    dragState.current.moveHandler = moveHandler;
    listRef.current?.addEventListener('touchmove', moveHandler, { passive: false });
  };

  const onTouchEnd = () => {
    if (dragState.current.moveHandler) {
      listRef.current?.removeEventListener('touchmove', dragState.current.moveHandler);
    }
    const { from, over } = dragState.current;
    if (from !== null && over !== null && from !== over) {
      updCats(p => { const a = [...p]; const [m] = a.splice(from, 1); a.splice(over, 0, m); return a; });
    }
    dragState.current = { from: null, over: null, moveHandler: null };
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const addCat = () => {
    if (!newCatLbl.trim()) return;
    const id = "cat-" + Date.now();
    updCats(p => [...p, { id, label: newCatLbl.trim(), icon: newCatIco || "📦" }]);
    setNewCatLbl(""); setNewCatIco("📦"); setNewCatCustomIco(""); setShowAddCat(false);
  };

  const errMsg = code => ({
    "auth/invalid-email": "Adresse courriel invalide.",
    "auth/user-not-found": "Aucun compte avec ce courriel.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/email-already-in-use": "Ce courriel est deja utilise.",
    "auth/weak-password": "Au moins 6 caracteres requis.",
    "auth/invalid-credential": "Courriel ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Reessayez plus tard.",
  }[code] || "Une erreur est survenue.");

  const handleEmail = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword(""); setShowEmail(false);
    } catch (e) { setError(errMsg(e.code)); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setLoading(false);
    } catch (e) {
      if (e.code === "auth/popup-blocked" || e.code === "auth/popup-closed-by-user") {
        try { await signInWithRedirect(auth, googleProvider); }
        catch (e2) { setError("Erreur Google : " + e2.code); setLoading(false); }
      } else {
        setError("Erreur Google : " + e.code); setLoading(false);
      }
    }
  };


const handleSignOut = async () => {
    await signOut(auth);
    setShowEmail(false);
    setEmail(""); setPassword(""); setError("");
  };

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Parametres</p>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: 0 }}>Categories</p>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { setReorderMode(r => !r); setDragIdx(null); setDragOverIdx(null); }} style={{ background: reorderMode ? BT : "none", border: "1px solid " + (reorderMode ? BTB : BR), borderRadius: 8, color: reorderMode ? BTT : TX3, fontSize: 11, padding: "4px 8px", cursor: "pointer", fontWeight: reorderMode ? 600 : 400 }}>{reorderMode ? "Terminer" : "Modifier l'ordre"}</button>
            {!reorderMode && <button onClick={() => { setNewCatLbl(""); setNewCatIco("📦"); setNewCatCustomIco(""); setShowAddCat(true); }} style={{ background: BT, border: "1px solid " + BTB, borderRadius: 8, color: BTT, fontSize: 16, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</button>}
          </div>
        </div>
        <div ref={listRef}>
          {(cats || []).map((c, i) => (
            <div
              key={c.id}
              data-catrow={i}
              draggable={reorderMode}
              onDragStart={reorderMode ? () => { dragState.current.from = i; setDragIdx(i); } : undefined}
              onDragOver={reorderMode ? e => { e.preventDefault(); dragState.current.over = i; setDragOverIdx(i); } : undefined}
              onDrop={reorderMode ? () => {
                const { from, over } = dragState.current;
                if (from === null || from === over) { setDragIdx(null); setDragOverIdx(null); return; }
                updCats(p => { const a = [...p]; const [m] = a.splice(from, 1); a.splice(over, 0, m); return a; });
                dragState.current = { from: null, over: null, moveHandler: null };
                setDragIdx(null); setDragOverIdx(null);
              } : undefined}
              onDragEnd={reorderMode ? () => { setDragIdx(null); setDragOverIdx(null); } : undefined}
              onTouchStart={reorderMode ? onTouchStart(i) : undefined}
              onTouchEnd={reorderMode ? onTouchEnd : undefined}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "0.5px solid " + BR, opacity: dragIdx === i ? 0.4 : 1, background: dragOverIdx === i && dragIdx !== i ? SF2 : "transparent", borderRadius: 6, transition: "background 0.1s" }}
            >
              {reorderMode
                ? <span style={{ fontSize: 16, color: TX3, cursor: "grab", padding: "0 2px", flexShrink: 0, userSelect: "none", touchAction: "none" }}>⠿</span>
                : <span style={{ width: 22, flexShrink: 0 }} />}
              <span style={{ fontSize: 20, width: 28, textAlign: "center", flexShrink: 0 }}>{c.icon}</span>
              <p style={{ flex: 1, fontSize: 13, color: TX, margin: 0 }}>{c.label}</p>
              {!reorderMode && <button onClick={() => { setEditCat(c); setEditCatFrm({ label: c.label, icon: c.icon }); setEditCatCustomIco(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 15, padding: "2px 6px" }}>✎</button>}
              {!reorderMode && <button onClick={() => setDelCat(c)} style={{ background: "none", border: "none", cursor: "pointer", color: RD, fontSize: 15, padding: "2px 6px" }}>🗑</button>}
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 14px" }}>Compte</p>

        {user ? (
          <div>
            {/* Profile card */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid " + BR, flexShrink: 0 }} />
                : <div style={{ width: 52, height: 52, borderRadius: "50%", background: BT, border: "2px solid " + BTB, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {(user.displayName || user.email || "?")[0].toUpperCase()}
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                {user.displayName && <p style={{ fontSize: 14, fontWeight: 600, color: TX, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</p>}
                <p style={{ fontSize: 12, color: TX2, margin: "0 0 5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#3a7a2a", background: "#e0f0d8", border: "1px solid #a8d898", borderRadius: 20, padding: "2px 8px" }}>● Connecte</span>
              </div>
            </div>

            <p style={{ fontSize: 11, color: TX3, margin: "0 0 14px" }}>Vos donnees sont synchronisees avec le nuage.</p>

            <button
              onClick={handleSignOut}
              style={{ width: "100%", padding: "11px", background: RD, border: "1px solid " + RD, borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >Se deconnecter</button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 11, color: TX3, margin: "0 0 14px" }}>
              Connectez-vous pour synchroniser vos donnees sur tous vos appareils. L'application fonctionne normalement sans compte.
            </p>

            {!showEmail ? (
              <div>
                <button
                  onClick={handleGoogle} disabled={loading}
                  style={{ width: "100%", padding: "12px", background: SF, border: "1px solid " + BR, borderRadius: 10, color: TX, fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
                >
                  <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.1-10.4 7.1-17.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.9 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.6v6.2C6.5 42.8 14.7 48 24 48z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6v-6.2H2.6C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l8-6.2z"/><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z"/></svg>
                  Continuer avec Google
                </button>

                <button
                  onClick={() => { setShowEmail(true); setError(""); }}
                  style={{ width: "100%", padding: "12px", background: "none", border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  ✉ Continuer avec Email
                </button>

                {error && <p style={{ fontSize: 12, color: RD, marginTop: 10 }}>{error}</p>}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <button style={{ flex: 1, padding: "7px", background: mode === "login" ? BT : "none", border: "1px solid " + (mode === "login" ? BTB : BR), borderRadius: 8, color: mode === "login" ? BTT : TX2, fontSize: 12, cursor: "pointer", fontWeight: mode === "login" ? 500 : 400 }} onClick={() => { setMode("login"); setError(""); }}>Connexion</button>
                  <button style={{ flex: 1, padding: "7px", background: mode === "signup" ? BT : "none", border: "1px solid " + (mode === "signup" ? BTB : BR), borderRadius: 8, color: mode === "signup" ? BTT : TX2, fontSize: 12, cursor: "pointer", fontWeight: mode === "signup" ? 500 : 400 }} onClick={() => { setMode("signup"); setError(""); }}>Inscription</button>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Courriel</label>
                  <input style={inp} type="email" placeholder="votre@courriel.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEmail()} />
                </div>
                <div style={{ marginBottom: error ? 10 : 14 }}>
                  <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Mot de passe</label>
                  <input style={inp} type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEmail()} />
                </div>
                {error && <p style={{ fontSize: 12, color: RD, marginBottom: 10 }}>{error}</p>}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleEmail} disabled={loading}
                    style={{ flex: 1, padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
                  >{loading ? "..." : mode === "login" ? "Se connecter" : "Creer un compte"}</button>
                  <button
                    onClick={() => { setShowEmail(false); setError(""); setEmail(""); setPassword(""); }}
                    style={{ padding: "11px 14px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }}
                  >Retour</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 8px" }}>Donnees</p>
        <p style={{ fontSize: 11, color: TX3, margin: "0 0 12px" }}>Efface toutes les donnees de l'application de facon permanente.</p>
        <button
          onClick={() => { setShowClear(true); setClearStep(1); }}
          style={{ width: "100%", padding: "11px", background: "none", border: "1px solid " + RD, borderRadius: 10, color: RD, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >Tout effacer</button>
      </div>

      {editCat && (
        <Modal title="Modifier la categorie">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label>
            <input autoFocus style={inp} value={editCatFrm.label} onChange={e => setEditCatFrm(f => ({ ...f, label: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Icone</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {ICONS_CAT.map(ic => (
                <button key={ic} type="button" onClick={() => { setEditCatFrm(f => ({ ...f, icon: ic })); setEditCatCustomIco(""); }} style={{ fontSize: 18, padding: "5px 7px", background: editCatFrm.icon === ic && !editCatCustomIco ? BT : SF, border: "1px solid " + (editCatFrm.icon === ic && !editCatCustomIco ? BTB : BR), borderRadius: 7, cursor: "pointer" }}>{ic}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: TX3, whiteSpace: "nowrap" }}>Ou coller un emoji :</span>
              <input style={{ width: 54, padding: "6px", background: SF, border: "1px solid " + (editCatCustomIco ? BTB : BR2), borderRadius: 8, fontSize: 22, textAlign: "center", boxSizing: "border-box" }} value={editCatCustomIco} onChange={e => { setEditCatCustomIco(e.target.value); if (e.target.value) setEditCatFrm(f => ({ ...f, icon: e.target.value })); }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => { if (!editCatFrm.label.trim()) return; updCats(p => p.map(c => c.id === editCat.id ? { ...c, label: editCatFrm.label.trim(), icon: editCatFrm.icon } : c)); setEditCat(null); }}>Enregistrer</button>
            <button style={{ padding: "11px 14px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => { setEditCat(null); setEditCatCustomIco(""); }}>Annuler</button>
          </div>
        </Modal>
      )}

      {delCat && (
        <Modal title="Supprimer la categorie">
          <p style={{ fontSize: 13, color: TX2, margin: "0 0 16px" }}>Supprimer <strong>{delCat.icon} {delCat.label}</strong> ? Les transactions et charges liees a cette categorie ne seront pas supprimees.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "11px", background: RD, border: "1px solid " + RD, borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => { updCats(p => p.filter(c => c.id !== delCat.id)); setDelCat(null); }}>Supprimer</button>
            <button style={{ padding: "11px 14px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => setDelCat(null)}>Annuler</button>
          </div>
        </Modal>
      )}

      {showAddCat && (
        <Modal title="Nouvelle categorie">
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label>
            <input autoFocus style={inp} value={newCatLbl} onChange={e => setNewCatLbl(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Icone</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {ICONS_CAT.map(ic => (
                <button key={ic} type="button" onClick={() => { setNewCatIco(ic); setNewCatCustomIco(""); }} style={{ fontSize: 18, padding: "5px 7px", background: newCatIco === ic && !newCatCustomIco ? BT : SF, border: "1px solid " + (newCatIco === ic && !newCatCustomIco ? BTB : BR), borderRadius: 7, cursor: "pointer" }}>{ic}</button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: TX3, whiteSpace: "nowrap" }}>Ou coller un emoji :</span>
              <input style={{ width: 54, padding: "6px", background: SF, border: "1px solid " + (newCatCustomIco ? BTB : BR2), borderRadius: 8, fontSize: 22, textAlign: "center", boxSizing: "border-box" }} value={newCatCustomIco} onChange={e => { setNewCatCustomIco(e.target.value); if (e.target.value) setNewCatIco(e.target.value); }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={addCat}>Creer</button>
            <button style={{ padding: "11px 14px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => setShowAddCat(false)}>Annuler</button>
          </div>
        </Modal>
      )}

      {showClear && (
        <Modal title={clearStep === 1 ? "Effacer toutes les donnees ?" : "Derniere confirmation"}>
          {clearStep === 1 && (
            <div>
              <p style={{ fontSize: 13, color: TX2, margin: "0 0 16px" }}>Cette action va effacer toutes les donnees : transactions, dettes, projets, depenses recurrentes et categories personnalisees. Elle est irreversible.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, padding: "12px", background: "#f5d5d0", border: "1px solid #d4877a", borderRadius: 12, color: "#7a2a1a", fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => setClearStep(2)}>Continuer</button>
                <button style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => setShowClear(false)}>Annuler</button>
              </div>
            </div>
          )}
          {clearStep === 2 && (
            <div>
              <p style={{ fontSize: 13, color: RD, margin: "0 0 16px", fontWeight: 500 }}>Es-tu vraiment certain ? Toutes tes donnees seront supprimees definitivement.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, padding: "12px", background: RD, border: "1px solid " + RD, borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { updTxs(() => []); updRecs(() => []); updRrecs(() => []); updDettes(() => []); updProjets(() => []); updCats(() => DEFAULT_CATS); updPaieM(() => ({})); setDetSel(null); setPrjSel(null); setShowClear(false); setClearStep(1); }}>Oui, tout effacer</button>
                <button style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => setShowClear(false)}>Annuler</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
