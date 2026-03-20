import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { SF, BR, BR2, TX, TX2, BT, BTB, BTT, RD, BG, NS } from "../constants.js";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      const msgs = {
        "auth/invalid-email": "Adresse courriel invalide.",
        "auth/user-not-found": "Aucun compte avec ce courriel.",
        "auth/wrong-password": "Mot de passe incorrect.",
        "auth/email-already-in-use": "Ce courriel est deja utilise.",
        "auth/weak-password": "Le mot de passe doit contenir au moins 6 caracteres.",
        "auth/invalid-credential": "Courriel ou mot de passe incorrect.",
        "auth/too-many-requests": "Trop de tentatives. Reessayez plus tard.",
      };
      setError(msgs[e.code] || "Une erreur est survenue.");
    }
    setLoading(false);
  };

  const inp = { width: "100%", background: SF, border: "0.5px solid " + BR2, borderRadius: 10, padding: "10px 12px", color: TX, fontSize: 16, boxSizing: "border-box" };

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <style>{NS}</style>
      <p style={{ fontSize: 32, fontWeight: 800, color: TX, fontFamily: "'Montserrat', sans-serif", marginBottom: 6, letterSpacing: "-0.01em" }}>Budgeti</p>
      <p style={{ fontSize: 14, color: TX2, marginBottom: 28 }}>Votre budget personnel</p>
      <div style={{ width: "100%", maxWidth: 360, background: SF, border: "1px solid " + BR, borderRadius: 16, padding: "24px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            style={{ flex: 1, padding: "9px", background: mode === "login" ? BT : "none", border: "1px solid " + (mode === "login" ? BTB : BR), borderRadius: 9, color: mode === "login" ? BTT : TX2, fontSize: 13, cursor: "pointer", fontWeight: mode === "login" ? 500 : 400 }}
            onClick={() => { setMode("login"); setError(""); }}
          >Connexion</button>
          <button
            style={{ flex: 1, padding: "9px", background: mode === "signup" ? BT : "none", border: "1px solid " + (mode === "signup" ? BTB : BR), borderRadius: 9, color: mode === "signup" ? BTT : TX2, fontSize: 13, cursor: "pointer", fontWeight: mode === "signup" ? 500 : 400 }}
            onClick={() => { setMode("signup"); setError(""); }}
          >Inscription</button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Courriel</label>
          <input style={inp} type="email" placeholder="votre@courriel.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Mot de passe</label>
          <input style={inp} type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        {error && <p style={{ fontSize: 12, color: RD, marginBottom: 12, textAlign: "center" }}>{error}</p>}
        <button
          style={{ width: "100%", padding: "13px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 15, fontWeight: 500, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          onClick={handle}
          disabled={loading}
        >
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </button>
      </div>
    </div>
  );
}
