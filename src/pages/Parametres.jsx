import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { DEFAULT_CATS, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, RD } from "../constants.js";
import Modal from "../components/Modal.jsx";

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

export default function Parametres({ user, inp, card, updTxs, updRecs, updRrecs, updDettes, updProjets, updCats, updPaieM, setDetSel, setPrjSel }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [clearStep, setClearStep] = useState(1);

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
      setEmail(""); setPassword("");
    } catch (e) { setError(errMsg(e.code)); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try { await signInWithRedirect(auth, googleProvider); }
    catch (e) { setError("Impossible de se connecter avec Google. (" + e.code + ")"); setLoading(false); }
  };

  const handleApple = async () => {
    setError(""); setLoading(true);
    try { await signInWithRedirect(auth, appleProvider); }
    catch (e) { setError("Impossible de se connecter avec Apple. (" + e.code + ")"); setLoading(false); }
  };

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Parametres</p>

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 12px" }}>Compte</p>

        {user ? (
          <div>
            <div style={{ background: SF2, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: TX3, margin: "0 0 2px" }}>Connecte en tant que</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: TX, margin: 0 }}>{user.email || user.displayName || "Utilisateur"}</p>
            </div>
            <p style={{ fontSize: 11, color: TX3, margin: "0 0 12px" }}>Vos donnees sont synchronisees avec le nuage.</p>
            <button
              onClick={() => signOut(auth)}
              style={{ width: "100%", padding: "11px", background: "#f5d5d0", border: "1px solid #d4877a", borderRadius: 10, color: "#7a2a1a", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >Se deconnecter</button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 11, color: TX3, margin: "0 0 14px" }}>
              Connectez-vous pour synchroniser vos donnees sur tous vos appareils. L'application fonctionne normalement sans compte.
            </p>

            <button
              onClick={handleGoogle} disabled={loading}
              style={{ width: "100%", padding: "11px", background: SF, border: "1px solid " + BR, borderRadius: 10, color: TX, fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.1-10.4 7.1-17.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.9 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.6v6.2C6.5 42.8 14.7 48 24 48z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6v-6.2H2.6C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l8-6.2z"/><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z"/></svg>
              Continuer avec Google
            </button>

            <button
              onClick={handleApple} disabled={loading}
              style={{ width: "100%", padding: "11px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              <svg width="14" height="16" viewBox="0 0 814 1000"><path fill="white" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.2-49.2 190.5-49.2zm-6.7-174.6c31.5-38.2 54.1-91.3 54.1-144.4 0-7.7-.6-15.4-1.9-21.8-51.6 1.9-112.2 34.4-148.9 77.2-28.9 32.7-56.4 84.5-56.4 138.3 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.3 1.3 13.5 1.3 46.4 0 102.6-31.5 137.7-69.8z"/></svg>
              Continuer avec Apple
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, height: "0.5px", background: BR2 }} />
              <span style={{ fontSize: 11, color: TX3 }}>ou avec un courriel</span>
              <div style={{ flex: 1, height: "0.5px", background: BR2 }} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
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
            <button
              onClick={handleEmail} disabled={loading}
              style={{ width: "100%", padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
            >{loading ? "..." : mode === "login" ? "Se connecter" : "Creer un compte"}</button>
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
