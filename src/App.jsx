import { useState, useMemo, useEffect, useRef } from "react";
import { DEFAULT_CATS, ICONS_CAT, BG, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, NS } from "./constants.js";
import { storage } from "./utils/storage.js";
import { today, ymd, ld, addD } from "./utils/dates.js";
import { getPaies, getFinD, calcAutoInPeriod, calcManuelsInPeriod, calcProportionalMonth, getRecOccurrencesInMonth } from "./utils/calculs.js";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import Modal from "./components/Modal.jsx";
import SaveCancel from "./components/SaveCancel.jsx";
import DelBtn from "./components/DelBtn.jsx";
import CatSelect from "./components/CatSelect.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Dettes from "./pages/Dettes.jsx";
import Projets from "./pages/Projets.jsx";
import Recurrents from "./pages/Recurrents.jsx";
import Analyse from "./pages/Analyse.jsx";
import Parametres from "./pages/Parametres.jsx";

const initTx=[];
const initRec=[];
const initRevRec=[];
const emptyD={nom:"",montantInitial:"",tauxInteret:"",paiementsAuto:[]};
const emptyP={nom:"",objectif:"",icon:"🎯",paiementsAuto:[]};
const initPaie={ frequence: "2semaines", jourSemaine: "Vendredi", jour1: 15, jour2: "fin", dateRef: "" };

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const userRef = useRef(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [showCat, setShowCat] = useState(false);
  const [newCatLbl, setNewCatLbl] = useState("");
  const [newCatIco, setNewCatIco] = useState("📦");
  const [newCatCustomIco, setNewCatCustomIco] = useState("");
  const [catCb, setCatCb] = useState(null);
  const [txs, setTxs] = useState(initTx);
  const [recs, setRecs] = useState(initRec);
  const [rrecs, setRrecs] = useState(initRevRec);
  const [view, setView] = useState("dashboard");
  const [paie, setPaie] = useState(initPaie);
  const [paieOpen, setPaieOpen] = useState(false);
  const [paieM, setPaieM] = useState({});
  const [paieIdx, setPaieIdx] = useState(null);
  const [txForm, setTxForm] = useState({ type: "depense", desc: "", amount: "", cat: DEFAULT_CATS[0].id, date: today() });
  const [showTx, setShowTx] = useState(false);
  const [addType, setAddType] = useState("depense");
  const [recFrm, setRecFrm] = useState({ desc: "", amount: "", cat: DEFAULT_CATS[0].id, jour: 1, frequence: "mois", jourSemaine: "Lundi", dateRef: null });
  const [rrFrm, setRrFrm] = useState({ desc: "", amount: "", jour: 1, frequence: "mois", jourSemaine: "Lundi", dateRef: null });
  const [eTxId, setETxId] = useState(null); const [eTxFrm, setETxFrm] = useState(null);
  const [eRecId, setERecId] = useState(null); const [eRecMod, setERecMod] = useState(false); const [eRecFrm, setERecFrm] = useState({ desc: "", amount: "", cat: DEFAULT_CATS[0].id, jour: 1, frequence: "mois", jourSemaine: "Lundi", dateRef: null });
  const [eRrId, setERrId] = useState(null); const [eRrMod, setERrMod] = useState(false);
  const [filCat, setFilCat] = useState("tout");
  const [selMo, setSelMo] = useState("tout");
  const [dettes, setDettes] = useState([]);
  const [detSel, setDetSel] = useState(null);
  const [showAddDet, setShowAddDet] = useState(false);
  const [detFrm, setDetFrm] = useState(emptyD);
  const [eDetMod, setEDetMod] = useState(false); const [eDetId, setEDetId] = useState(null);
  const [, setShowAddPai] = useState(false);
  const [paiType, setPaiType] = useState(null);
  const [paiFrm, setPaiFrm] = useState({ montant: "", date: today(), jour: "1" });
  const [editPai, setEditPai] = useState(null);
  const [editPaiFrm, setEditPaiFrm] = useState({ montant: "", date: "", jour: "" });
  const [projets, setProjets] = useState([]);
  const [prjSel, setPrjSel] = useState(null);
  const [showAddPrj, setShowAddPrj] = useState(false);
  const [prjFrm, setPrjFrm] = useState(emptyP);
  const [ePrjMod, setEPrjMod] = useState(false); const [ePrjId, setEPrjId] = useState(null);
  const [, setShowAddVer] = useState(false);
  const [verType, setVerType] = useState(null);
  const [verFrm, setVerFrm] = useState({ montant: "", date: today(), jour: "1" });
  const [editVer, setEditVer] = useState(null);
  const [editVerFrm, setEditVerFrm] = useState({ montant: "", date: "", jour: "" });
  // Bottom nav replaces drawer — no drawerOpen state needed
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("budgeti-theme");
    if (saved !== null) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("budgeti-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Load from localStorage on mount ───────────────────────────────────────
  useEffect(() => {
    const p = storage.get("paie-config"); if (p) setPaie(JSON.parse(p.value));
    const m = storage.get("paie-montants"); if (m) setPaieM(JSON.parse(m.value));
    const t = storage.get("budgeti-txs"); if (t) setTxs(JSON.parse(t.value));
    const r = storage.get("budgeti-recs"); if (r) setRecs(JSON.parse(r.value));
    const rr = storage.get("budgeti-rrecs"); if (rr) setRrecs(JSON.parse(rr.value));
    const d = storage.get("budgeti-dettes"); if (d) setDettes(JSON.parse(d.value));
    const pr = storage.get("budgeti-projets"); if (pr) setProjets(JSON.parse(pr.value));
    const c = storage.get("budgeti-cats"); if (c) setCats(JSON.parse(c.value));
  }, []);

  // ── Firebase auth + optional Firestore sync ────────────────────────────────
  useEffect(() => {
    // Handle redirect result (Google/Apple redirect flow)
    getRedirectResult(auth).then(result => {
      if (result?.user) setView("parametres");
    }).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (u) => {
      const wasLoggedIn = !!userRef.current;
      userRef.current = u;
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const d = snap.data();
            if (d.txs !== undefined) { setTxs(d.txs); storage.set("budgeti-txs", JSON.stringify(d.txs)); }
            if (d.recs !== undefined) { setRecs(d.recs); storage.set("budgeti-recs", JSON.stringify(d.recs)); }
            if (d.rrecs !== undefined) { setRrecs(d.rrecs); storage.set("budgeti-rrecs", JSON.stringify(d.rrecs)); }
            if (d.dettes !== undefined) { setDettes(d.dettes); storage.set("budgeti-dettes", JSON.stringify(d.dettes)); }
            if (d.projets !== undefined) { setProjets(d.projets); storage.set("budgeti-projets", JSON.stringify(d.projets)); }
            if (d.cats !== undefined) { setCats(d.cats); storage.set("budgeti-cats", JSON.stringify(d.cats)); }
            if (d.paie !== undefined) { setPaie(d.paie); storage.set("paie-config", JSON.stringify(d.paie)); }
            if (d.paieM !== undefined) { setPaieM(d.paieM); storage.set("paie-montants", JSON.stringify(d.paieM)); }
          } else if (!wasLoggedIn) {
            const lsMap = { txs: "budgeti-txs", recs: "budgeti-recs", rrecs: "budgeti-rrecs", dettes: "budgeti-dettes", projets: "budgeti-projets", cats: "budgeti-cats", paie: "paie-config", paieM: "paie-montants" };
            const upload = {};
            for (const [field, key] of Object.entries(lsMap)) {
              const item = storage.get(key);
              if (item) upload[field] = JSON.parse(item.value);
            }
            if (Object.keys(upload).length > 0) setDoc(doc(db, "users", u.uid), upload);
          }
        } catch (e) {
          console.error("Firestore sync error:", e);
        }
      } else {
        // Déconnexion — vider l'état et le localStorage
        setTxs([]); setRecs([]); setRrecs([]); setDettes([]); setProjets([]);
        setCats(DEFAULT_CATS); setPaie(initPaie); setPaieM({});
        setDetSel(null); setPrjSel(null);
        ["budgeti-txs","budgeti-recs","budgeti-rrecs","budgeti-dettes","budgeti-projets","budgeti-cats","paie-config","paie-montants"].forEach(k => storage.remove(k));
      }
    });
    return unsub;
  }, []);

  // ── Save to localStorage + Firestore (if logged in) ───────────────────────
  const save = (lsKey, fsField, value) => {
    storage.set(lsKey, JSON.stringify(value));
    if (userRef.current) setDoc(doc(db, "users", userRef.current.uid), { [fsField]: value }, { merge: true });
  };

  // ── Updaters ──────────────────────────────────────────────────────────────
  const updPaie    = fn => setPaie(prev    => { const n = typeof fn === "function" ? fn(prev) : fn; save("paie-config",      "paie",    n); return n; });
  const updPaieM   = fn => setPaieM(prev   => { const n = typeof fn === "function" ? fn(prev) : fn; save("paie-montants",    "paieM",   n); return n; });
  const updTxs     = fn => setTxs(prev     => { const n = typeof fn === "function" ? fn(prev) : fn; save("budgeti-txs",      "txs",     n); return n; });
  const updRecs    = fn => setRecs(prev    => { const n = typeof fn === "function" ? fn(prev) : fn; save("budgeti-recs",     "recs",    n); return n; });
  const updRrecs   = fn => setRrecs(prev   => { const n = typeof fn === "function" ? fn(prev) : fn; save("budgeti-rrecs",    "rrecs",   n); return n; });
  const updDettes  = fn => setDettes(prev  => { const n = typeof fn === "function" ? fn(prev) : fn; save("budgeti-dettes",   "dettes",  n); return n; });
  const updProjets = fn => setProjets(prev => { const n = typeof fn === "function" ? fn(prev) : fn; save("budgeti-projets",  "projets", n); return n; });
  const updCats    = fn => setCats(prev    => { const n = typeof fn === "function" ? fn(prev) : fn; save("budgeti-cats",     "cats",    n); return n; });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const addTx = () => { if (!txForm.desc || !txForm.amount || isNaN(+txForm.amount)) return; updTxs(p => [...p, { id: Date.now(), ...txForm, amount: +txForm.amount }]); setTxForm(f => ({ ...f, desc: "", amount: "" })); };
  const delTx = id => {
    const tx = txs.find(x => x.id === id);
    updTxs(p => p.filter(x => x.id !== id));
    if (tx && tx.type === "revenu" && tx.desc === "Paie") {
      updPaieM(p => { const n = { ...p }; delete n[tx.date]; return n; });
    }
  };
  const startETx = x => { setETxId(x.id); setETxFrm({ type: x.type, desc: x.desc, amount: x.amount, cat: x.cat, date: x.date }); };
  const saveETx = () => {
    if (!eTxFrm.desc || !eTxFrm.amount || isNaN(+eTxFrm.amount)) return;
    const orig = txs.find(x => x.id === eTxId);
    updTxs(p => p.map(x => x.id === eTxId ? { ...x, ...eTxFrm, amount: +eTxFrm.amount } : x));
    if (orig && orig.type === "revenu" && orig.desc === "Paie") {
      const newDate = eTxFrm.date || orig.date;
      updPaieM(p => { const n = { ...p }; delete n[orig.date]; n[newDate] = +eTxFrm.amount; return n; });
    }
    setETxId(null); setETxFrm(null);
  };
  const addRec = () => { if (eRecId !== null) { if (!eRecFrm.desc || !eRecFrm.amount || isNaN(+eRecFrm.amount)) return; updRecs(p => p.map(r => r.id === eRecId ? { ...r, ...eRecFrm, amount: +eRecFrm.amount } : r)); setERecId(null); } else { if (!recFrm.desc || !recFrm.amount || isNaN(+recFrm.amount)) return; updRecs(p => [...p, { id: Date.now(), ...recFrm, amount: +recFrm.amount }]); setRecFrm({ desc: "", amount: "", cat: cats[0]?.id || "", jour: 1, frequence: "mois", jourSemaine: "Lundi", dateRef: null }); } };
  const delRec = id => { updRecs(p => p.filter(r => r.id !== id)); setERecId(null); setERecMod(false); };
  const openERec = r => { setERecId(r.id); setERecFrm({ desc: r.desc, amount: r.amount, cat: r.cat, jour: r.jour, frequence: r.frequence || "mois", jourSemaine: r.jourSemaine || "Lundi", dateRef: r.dateRef || null }); setERecMod(true); };
  const addRr = () => { if (!rrFrm.desc || !rrFrm.amount || isNaN(+rrFrm.amount)) return; if (eRrId !== null) { updRrecs(p => p.map(r => r.id === eRrId ? { ...r, ...rrFrm, amount: +rrFrm.amount } : r)); setERrId(null); } else updRrecs(p => [...p, { id: Date.now(), ...rrFrm, amount: +rrFrm.amount }]); setRrFrm({ desc: "", amount: "", jour: 1, frequence: "mois", jourSemaine: "Lundi", dateRef: null }); };
  const delRr = id => { updRrecs(p => p.filter(r => r.id !== id)); setERrId(null); setERrMod(false); };
  const openERr = r => { setERrId(r.id); setRrFrm({ desc: r.desc, amount: r.amount, jour: r.jour, frequence: r.frequence || "mois", jourSemaine: r.jourSemaine || "Lundi", dateRef: r.dateRef || null }); setERrMod(true); };
  const addCat = () => { if (!newCatLbl.trim()) return; const id = "cat-" + Date.now(); updCats(p => [...p, { id, label: newCatLbl.trim(), icon: newCatIco || "📦" }]); if (catCb) catCb(id); setNewCatLbl(""); setNewCatIco("📦"); setShowCat(false); setCatCb(null); };
  const addDette = () => { if (!detFrm.nom || !detFrm.montantInitial || isNaN(+detFrm.montantInitial)) return; const id = "d-" + Date.now(); updDettes(p => [...p, { id, nom: detFrm.nom.trim(), montantInitial: +detFrm.montantInitial, tauxInteret: +detFrm.tauxInteret || 0, paiements: [], dateCreation: today(), paiementsAuto: [] }]); setDetSel(id); setDetFrm(emptyD); setShowAddDet(false); };
  const delDette = id => { updDettes(p => p.filter(d => d.id !== id)); if (detSel === id) setDetSel(null); setEDetMod(false); };
  const addPai = () => { if (!paiFrm.montant || isNaN(+paiFrm.montant)) return; if (paiType === "fixe") { updDettes(p => p.map(d => d.id === detSel ? { ...d, paiementsAuto: [...(d.paiementsAuto || []), { id: "pf-" + Date.now(), montant: +paiFrm.montant, jour: paiFrm.jour || "1" }] } : d)); } else { updDettes(p => p.map(d => d.id === detSel ? { ...d, paiements: [...d.paiements, { id: "p-" + Date.now(), montant: +paiFrm.montant, date: paiFrm.date }] } : d)); } setPaiFrm({ montant: "", date: today(), jour: "1" }); setPaiType(null); setShowAddPai(false); };
  const delPai = (did, pid) => updDettes(p => p.map(d => d.id === did ? { ...d, paiements: d.paiements.filter(x => x.id !== pid) } : d));
  const delPaiFixe = (did, pid) => updDettes(p => p.map(d => d.id === did ? { ...d, paiementsAuto: (d.paiementsAuto || []).filter(x => x.id !== pid) } : d));
  const saveEditPai = () => { if (!editPaiFrm.montant || isNaN(+editPaiFrm.montant)) return; if (editPai.type === "fixe") { updDettes(p => p.map(d => d.id === detSel ? { ...d, paiementsAuto: (d.paiementsAuto || []).map(x => x.id === editPai.id ? { ...x, montant: +editPaiFrm.montant, jour: editPaiFrm.jour } : x) } : d)); } else { updDettes(p => p.map(d => d.id === detSel ? { ...d, paiements: d.paiements.map(x => x.id === editPai.id ? { ...x, montant: +editPaiFrm.montant, date: editPaiFrm.date } : x) } : d)); } setEditPai(null); };
  const addProjet = () => { if (!prjFrm.nom || !prjFrm.objectif || isNaN(+prjFrm.objectif)) return; const id = "pr-" + Date.now(); updProjets(p => [...p, { id, nom: prjFrm.nom.trim(), objectif: +prjFrm.objectif, icon: prjFrm.icon, versements: [], dateCreation: today(), paiementsAuto: [] }]); setPrjSel(id); setPrjFrm(emptyP); setShowAddPrj(false); };
  const delProjet = id => { updProjets(p => p.filter(x => x.id !== id)); if (prjSel === id) setPrjSel(null); setEPrjMod(false); setEPrjId(null); };
  const addVer = () => { if (!verFrm.montant || isNaN(+verFrm.montant)) return; if (verType === "fixe") { updProjets(p => p.map(x => x.id === prjSel ? { ...x, paiementsAuto: [...(x.paiementsAuto || []), { id: "pf-" + Date.now(), montant: +verFrm.montant, jour: verFrm.jour || "1" }] } : x)); } else { updProjets(p => p.map(x => x.id === prjSel ? { ...x, versements: [...x.versements, { id: "v-" + Date.now(), montant: +verFrm.montant, date: verFrm.date }] } : x)); } setVerFrm({ montant: "", date: today(), jour: "1" }); setVerType(null); setShowAddVer(false); };
  const delVer = (pid, vid) => updProjets(p => p.map(x => x.id === pid ? { ...x, versements: x.versements.filter(v => v.id !== vid) } : x));
  const delVerFixe = (pid, vid) => updProjets(p => p.map(x => x.id === pid ? { ...x, paiementsAuto: (x.paiementsAuto || []).filter(v => v.id !== vid) } : x));
  const saveEditVer = () => { if (!editVerFrm.montant || isNaN(+editVerFrm.montant)) return; if (editVer.type === "fixe") { updProjets(p => p.map(x => x.id === prjSel ? { ...x, paiementsAuto: (x.paiementsAuto || []).map(v => v.id === editVer.id ? { ...v, montant: +editVerFrm.montant, jour: editVerFrm.jour } : v) } : x)); } else { updProjets(p => p.map(x => x.id === prjSel ? { ...x, versements: x.versements.map(v => v.id === editVer.id ? { ...v, montant: +editVerFrm.montant, date: editVerFrm.date } : v) } : x)); } setEditVer(null); };
  const navigate = id => { setView(id); setDrawerOpen(false); setEPrjMod(false); setEPrjId(null); setEDetMod(false); setEDetId(null); setETxId(null); setETxFrm(null); setERecMod(false); setERrMod(false); setEditPai(null); setEditVer(null); setShowAddPai(false); setShowAddVer(false); setPaiType(null); setVerType(null); };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp = { width: "100%", background: SF, border: "0.5px solid " + BR2, borderRadius: 10, padding: "10px 12px", color: TX, fontSize: 16, boxSizing: "border-box" };
  const inpSm = { ...inp, padding: "8px 10px" };
  const card = { background: SF, border: "1px solid " + BR, borderRadius: 14, padding: "14px 16px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
  const trow = { display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "0.5px solid " + BR };
  const ico = { width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 };
  const fbtn = a => ({ flex: 1, padding: "8px 4px", background: a ? BT : SF, border: "1px solid " + (a ? BTB : BR), borderRadius: 9, color: a ? BTT : TX2, fontSize: 11, cursor: "pointer", textAlign: "center", fontWeight: a ? 500 : 400 });
  const chip = a => ({ padding: "5px 11px", background: a ? BT : SF, border: "1px solid " + (a ? BTB : BR), borderRadius: 20, color: a ? BTT : TX2, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 });
  const navBtn = a => ({ flex: 1, padding: "8px 2px 6px", background: a ? "#F0FDF4" : "none", border: "none", cursor: "pointer", color: a ? BT : TX3, fontSize: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, borderTop: a ? "2px solid " + BT : "2px solid transparent" });
  const tbtn = (a, tp) => { const r = tp === "depense"; return { flex: 1, padding: "8px", background: a ? (r ? "var(--c-dep)" : BT) : SF, border: "1px solid " + (a ? (r ? "var(--c-dep-b)" : BTB) : BR), borderRadius: 9, color: a ? "#FFFFFF" : TX2, fontSize: 13, cursor: "pointer", fontWeight: a ? 500 : 400 }; };
  const bigBtn = () => ({ width: "100%", padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 6 });
  const CatSel = ({ value, onChange }) => <CatSelect cats={cats} value={value} onChange={onChange} inp={inp} setCatCb={setCatCb} setShowCat={setShowCat} />;

  // ── Derived ───────────────────────────────────────────────────────────────
  const t = today();
  const [curY, curM] = t.split("-").map(Number);
  const mStart = ymd(curY, curM, 1);
  const mEnd = ymd(curY, curM, ld(curY, curM));
  const paies = useMemo(() => getPaies(paie), [paie]);
  const months = useMemo(() => { const curMoStr = curY + "-" + String(curM).padStart(2, "0"); const s = new Set([curMoStr, ...txs.map(x => x.date.slice(0, 7))]); dettes.forEach(d => d.paiements.forEach(p => s.add(p.date.slice(0, 7)))); projets.forEach(p => p.versements.forEach(v => s.add(v.date.slice(0, 7)))); return [...s].sort((a, b) => b.localeCompare(a)); }, [txs, dettes, projets, recs, rrecs, paieM, curY, curM]);
  const histItems = useMemo(() => { const curMoStr = curY + "-" + String(curM).padStart(2, "0"); const moSet = new Set([...months, curMoStr]); const items = [...txs]; moSet.forEach(mo => { const [y, m] = mo.split("-").map(Number); const lastD = ld(y, m); recs.forEach(r => { if (!r.frequence || r.frequence === "mois" || r.frequence === "paie") { const j = r.frequence === "paie" || r.jour === "paie" ? 1 : r.jour === "fin" ? lastD : Math.min(r.jour, lastD); items.push({ id: "rc-" + r.id + "-" + mo, type: "depense", desc: r.desc, amount: r.amount, cat: r.cat, date: ymd(y, m, j), source: "rec" }); } else { getRecOccurrencesInMonth(r, y, m).forEach(date => items.push({ id: "rc-" + r.id + "-" + date, type: "depense", desc: r.desc, amount: r.amount, cat: r.cat, date, source: "rec" })); } }); rrecs.forEach(r => { if (!r.frequence || r.frequence === "mois" || r.frequence === "paie") { const j = r.frequence === "paie" ? 1 : Math.min(r.jour, lastD); items.push({ id: "rr-" + r.id + "-" + mo, type: "revenu", desc: r.desc, amount: r.amount, date: ymd(y, m, j), source: "rr" }); } else { getRecOccurrencesInMonth(r, y, m).forEach(date => items.push({ id: "rr-" + r.id + "-" + date, type: "revenu", desc: r.desc, amount: r.amount, date, source: "rr" })); } }); dettes.forEach(d => { (d.paiementsAuto || []).filter(pa => +pa.montant > 0).forEach(pa => { const j = pa.jour === "paie" ? 1 : pa.jour === "fin" ? lastD : Math.min(+pa.jour || 1, lastD); items.push({ id: "dp-" + pa.id + "-" + mo, type: "depense", desc: d.nom, amount: +pa.montant, date: ymd(y, m, j), source: "dette" }); }); }); projets.forEach(p => { (p.paiementsAuto || []).filter(pa => +pa.montant > 0).forEach(pa => { const j = pa.jour === "paie" ? 1 : pa.jour === "fin" ? lastD : Math.min(+pa.jour || 1, lastD); items.push({ id: "pp-" + pa.id + "-" + mo, type: "depense", desc: p.nom, amount: +pa.montant, date: ymd(y, m, j), source: "projet", icon: p.icon }); }); }); }); dettes.forEach(d => d.paiements.forEach(p => items.push({ id: "dm-" + p.id, type: "depense", desc: d.nom, amount: p.montant, date: p.date, source: "dette" }))); projets.forEach(p => p.versements.forEach(v => items.push({ id: "pm-" + v.id, type: "depense", desc: p.nom, amount: v.montant, date: v.date, source: "projet", icon: p.icon }))); return items.sort((a, b) => b.date.localeCompare(a.date)); }, [txs, recs, rrecs, dettes, projets, months, curY, curM]);
  const filtTx = useMemo(() => histItems.filter(x => (selMo === "tout" || x.date.startsWith(selMo)) && (filCat === "tout" || x.cat === filCat || (filCat === "revenu" && x.type === "revenu") || (filCat === "paie" && x.desc === "Paie") || (filCat === "recurrents" && (x.source === "rec" || x.source === "rr")) || (filCat === "dettes" && x.source === "dette") || (filCat === "projets" && x.source === "projet"))), [histItems, selMo, filCat]);
  const propMois = useMemo(() => calcProportionalMonth(paie, mStart, mEnd, paieM, recs, rrecs, dettes, projets), [paie, mStart, mEnd, paieM, recs, rrecs, dettes, projets]);
  const totPaieMois = propMois.totPaie;
  const totRec = propMois.totRec;
  const totRR = propMois.totRR;
  const totDettesMois = propMois.totDette;
  const totProjetsMois = propMois.totProjet;
  const totArgentRecu = useMemo(() => txs.filter(x => x.type === "revenu" && x.desc !== "Paie" && x.date.startsWith(curY + "-" + String(curM).padStart(2, "0"))).reduce((s, x) => s + x.amount, 0), [txs, curY, curM]);
  const totDep = useMemo(() => txs.filter(x => x.type === "depense" && x.date.startsWith(curY + "-" + String(curM).padStart(2, "0"))).reduce((s, x) => s + x.amount, 0), [txs, curY, curM]);
  const solde = totPaieMois + totArgentRecu + totRR - totDep - totRec - totDettesMois - totProjetsMois;
  const dbc = useMemo(() => { const m = {}; txs.filter(x => x.type === "depense" && x.date.startsWith(curY + "-" + String(curM).padStart(2, "0"))).forEach(x => { m[x.cat] = (m[x.cat] || 0) + x.amount; }); return m; }, [txs, curY, curM]);
  const maxD = Math.max(...Object.values(dbc), 1);
  const periodes = useMemo(() => {
    if (!paies.length) return [];
    return paies.map((deb, i) => {
      const fin = i < paies.length - 1 ? paies[i + 1] : getFinD(paie, paies[paies.length - 1]);
      const mp = paieM[deb] || 0;
      const aRev = txs.filter(x => x.type === "revenu" && x.desc !== "Paie" && x.date >= deb && (fin ? x.date < fin : true)).reduce((s, x) => s + x.amount, 0);
      const [dy, dm] = deb.split("-").map(Number);
      const rrP = rrecs.reduce((s, r) => { for (let mo = 0; mo <= 1; mo++) { let mc = dm - 1 + mo, yc = dy + Math.floor(mc / 12); mc = ((mc % 12) + 12) % 12; const ds = ymd(yc, mc + 1, Math.min(r.jour, ld(yc, mc + 1))); if (ds >= deb && (fin ? ds < fin : true)) return s + r.amount; } return s; }, 0);
      const ch = recs.reduce((s, r) => { if (r.jour === "paie") return s + r.amount; for (let mo = 0; mo <= 1; mo++) { let mc = dm - 1 + mo, yc = dy + Math.floor(mc / 12); mc = ((mc % 12) + 12) % 12; const j = r.jour === "fin" ? ld(yc, mc + 1) : Math.min(r.jour, ld(yc, mc + 1)); const ds = ymd(yc, mc + 1, j); if (ds >= deb && (fin ? ds < fin : true)) return s + r.amount; } return s; }, 0);
      const deps = txs.filter(x => x.type === "depense" && x.date >= deb && (fin ? x.date < fin : true)).reduce((s, x) => s + x.amount, 0);
      const detP = calcAutoInPeriod(dettes, deb, fin) + calcManuelsInPeriod(dettes, deb, fin, "paiements");
      const prjP = calcAutoInPeriod(projets, deb, fin) + calcManuelsInPeriod(projets, deb, fin, "versements");
      const isCur = deb <= t && (fin ? t < fin : true);
      const isPast = fin ? fin <= t : false;
      const tot = mp + aRev + rrP;
      return { deb, fin, mp, aRev, rrP, tot, ch, deps, detP, prjP, reste: tot - ch - deps - detP - prjP, hasPaie: mp > 0, isCur, isPast };
    });
  }, [paies, paieM, txs, recs, rrecs, paie, t, dettes, projets]);

  const styles = { inp, inpSm, card, trow, ico, fbtn, chip, navBtn, tbtn, bigBtn };

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: BG, minHeight: "100vh", color: TX, paddingBottom: 80 }}>
      <style>{NS + `
        :root {
          --c-bg:#FFFFFF; --c-sf:#F1F5F9; --c-sf2:#E2E8F0; --c-br:#E2E8F0; --c-br2:#CBD5E1;
          --c-tx:#1E293B; --c-tx2:#64748B; --c-tx3:#94A3B8;
          --c-bt:#15803D; --c-btb:#166534; --c-btt:#FFFFFF;
          --c-ac:#15803D; --c-rd:#F43F5E; --c-gn:#10B981;
          --c-dep:#F43F5E; --c-dep-b:#E11D48;
          --c-rd-light:#FFE4E6; --c-rd-light-b:#FB7185;
          --c-bt-light:#F0FDF4;
        }
        :root.dark {
          --c-bg:#0F172A; --c-sf:#1E293B; --c-sf2:#334155; --c-br:#334155; --c-br2:#475569;
          --c-tx:#F1F5F9; --c-tx2:#94A3B8; --c-tx3:#64748B;
          --c-bt:#15803D; --c-btb:#166534; --c-btt:#FFFFFF;
          --c-ac:#15803D; --c-rd:#F87171; --c-gn:#34D399;
          --c-dep:#F87171; --c-dep-b:#EF4444;
          --c-rd-light:#3D1520; --c-rd-light-b:#F87171;
          --c-bt-light:#052E16;
        }
      `}</style>

      {/* Global modals */}
      {showTx && (
        <Modal title={txForm.type === "depense" ? "Nouvelle dépense" : "Nouveau revenu"}>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input autoFocus style={inp} placeholder="..." value={txForm.desc} onChange={e => setTxForm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input style={inp} type="number" placeholder="0.00" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} /></div>
          {txForm.type === "depense" && <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label><CatSel value={txForm.cat} onChange={v => setTxForm(f => ({ ...f, cat: v }))} /></div>}
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date</label><input style={inp} type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: txForm.type === "depense" ? "var(--c-dep)" : BT, border: "1px solid " + (txForm.type === "depense" ? "var(--c-dep-b)" : BTB), borderRadius: 12, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { addTx(); setShowTx(false); }}>Ajouter</button>
            <button style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => setShowTx(false)}>Annuler</button>
          </div>
        </Modal>
      )}

      {showCat && (
        <Modal title="Nouvelle catégorie" zIndex={200}>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label><input autoFocus style={inp} value={newCatLbl} onChange={e => setNewCatLbl(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} /></div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Icône</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{ICONS_CAT.map(ic => <button key={ic} type="button" onClick={() => { setNewCatIco(ic); setNewCatCustomIco(""); }} style={{ fontSize: 18, padding: "5px 7px", background: newCatIco === ic && !newCatCustomIco ? BT : SF, border: "1px solid " + (newCatIco === ic && !newCatCustomIco ? BTB : BR), borderRadius: 7, cursor: "pointer" }}>{ic}</button>)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: TX3, whiteSpace: "nowrap" }}>Ou coller un emoji :</span>
              <input style={{ width: 54, padding: "6px", background: SF, border: "1px solid " + (newCatCustomIco ? BTB : BR2), borderRadius: 8, fontSize: 22, textAlign: "center", boxSizing: "border-box" }} value={newCatCustomIco} onChange={e => { setNewCatCustomIco(e.target.value); if (e.target.value) setNewCatIco(e.target.value); }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={addCat}>Créer</button>
            <button style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => { setShowCat(false); setNewCatLbl(""); setNewCatIco("📦"); setNewCatCustomIco(""); setCatCb(null); }}>Annuler</button>
          </div>
        </Modal>
      )}

      {eTxId && eTxFrm && (
        <Modal title="Modifier la transaction">
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>{["depense", "revenu"].map(tp => <button key={tp} style={tbtn(eTxFrm.type === tp, tp)} onClick={() => setETxFrm(f => ({ ...f, type: tp }))}>{tp === "depense" ? "Dépense" : "Revenu"}</button>)}</div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} value={eTxFrm.desc} onChange={e => setETxFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={eTxFrm.amount} onChange={e => setETxFrm(f => ({ ...f, amount: e.target.value }))} /></div>
          {eTxFrm.type === "depense" && <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label><CatSel value={eTxFrm.cat} onChange={v => setETxFrm(f => ({ ...f, cat: v }))} /></div>}
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date</label><input style={inp} type="date" value={eTxFrm.date} onChange={e => setETxFrm(f => ({ ...f, date: e.target.value }))} /></div>
          <SaveCancel onS={saveETx} onC={() => { setETxId(null); setETxFrm(null); }} />
          <DelBtn onClick={() => { delTx(eTxId); setETxId(null); setETxFrm(null); }} />
        </Modal>
      )}

      {/* Header — simplified, no hamburger */}
      <div style={{ background: "var(--c-bg)", borderBottom: "1px solid " + BR, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/budgeti-logo.png" alt="Budgeti" style={{ height: 54, width: "auto", borderRadius: 10, background: "#fff", padding: "3px 10px" }} />
        </div>
        {/* Dark mode toggle in header */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{darkMode ? "🌙" : "☀️"}</span>
          <button onClick={() => setDarkMode(d => !d)} style={{ width: 48, height: 26, borderRadius: 13, background: darkMode ? BT : BR2, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: darkMode ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#FFFFFF", transition: "left 0.2s", display: "block" }} />
          </button>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "var(--c-bg)", borderTop: "1px solid " + BR, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", display: "flex", alignItems: "stretch", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {[
          { id: "dashboard",  icon: "🏠", label: "Tableau" },
          { id: "dettes",     icon: "📊", label: "Dettes" },
          { id: "projets",    icon: "🎯", label: "Projets" },
          { id: "recurrents", icon: "🔄", label: "Récurrents" },
          { id: "analyse",    icon: "📈", label: "Analyse" },
          { id: "parametres", icon: "⚙️",  label: "Réglages" },
        ].map(n => {
          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => navigate(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "8px 2px 10px", background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              {/* Active indicator pill behind icon */}
              {active && (
                <span style={{ position: "absolute", top: 6, width: 36, height: 28, borderRadius: 14, background: "var(--c-ac)", opacity: 0.15 }} />
              )}
              <span style={{ fontSize: 20, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "var(--c-ac)" : TX3, letterSpacing: 0.1, whiteSpace: "nowrap" }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      {/* Page content */}
      <div style={{ padding: "14px 14px 0" }}>
        {view === "dashboard" && (
          <Dashboard
            paie={paie} paieOpen={paieOpen} paieM={paieM} paieIdx={paieIdx}
            txs={txs} cats={cats} periodes={periodes} paies={paies}
            recs={recs} rrecs={rrecs} dettes={dettes} projets={projets}
            totPaieMois={totPaieMois} totArgentRecu={totArgentRecu} totDep={totDep} totRR={totRR} totRec={totRec}
            totDettesMois={totDettesMois} totProjetsMois={totProjetsMois} solde={solde}
            dbc={dbc} maxD={maxD}
            setPaieOpen={setPaieOpen} updPaie={updPaie} updPaieM={updPaieM}
            updTxs={updTxs} setPaieIdx={setPaieIdx}
            setTxForm={setTxForm} setShowTx={setShowTx} navigate={navigate} startETx={startETx}
            {...styles}
          />
        )}
        {view === "dettes" && (
          <Dettes
            dettes={dettes} detSel={detSel} showAddDet={showAddDet} detFrm={detFrm}
            eDetMod={eDetMod} eDetId={eDetId} paiType={paiType} paiFrm={paiFrm}
            editPai={editPai} editPaiFrm={editPaiFrm}
            updDettes={updDettes} setDetSel={setDetSel} setShowAddDet={setShowAddDet} setDetFrm={setDetFrm}
            setEDetMod={setEDetMod} setEDetId={setEDetId} addDette={addDette} delDette={delDette}
            addPai={addPai} delPai={delPai} delPaiFixe={delPaiFixe} saveEditPai={saveEditPai}
            setPaiType={setPaiType} setPaiFrm={setPaiFrm} setEditPai={setEditPai} setEditPaiFrm={setEditPaiFrm}
            {...styles}
          />
        )}
        {view === "projets" && (
          <Projets
            projets={projets} prjSel={prjSel} showAddPrj={showAddPrj} prjFrm={prjFrm}
            ePrjMod={ePrjMod} ePrjId={ePrjId} verType={verType} verFrm={verFrm}
            editVer={editVer} editVerFrm={editVerFrm}
            updProjets={updProjets} setPrjSel={setPrjSel} setShowAddPrj={setShowAddPrj} setPrjFrm={setPrjFrm}
            setEPrjMod={setEPrjMod} setEPrjId={setEPrjId} addProjet={addProjet} delProjet={delProjet}
            addVer={addVer} delVer={delVer} delVerFixe={delVerFixe} saveEditVer={saveEditVer}
            setVerType={setVerType} setVerFrm={setVerFrm} setEditVer={setEditVer} setEditVerFrm={setEditVerFrm}
            {...styles}
          />
        )}
        {view === "recurrents" && (
          <Recurrents
            recs={recs} rrecs={rrecs} recFrm={recFrm} rrFrm={rrFrm}
            eRecId={eRecId} eRecMod={eRecMod} eRrId={eRrId} eRrMod={eRrMod}
            addType={addType} cats={cats} totRec={totRec} totRR={totRR}
            updRecs={updRecs} updRrecs={updRrecs}
            eRecFrm={eRecFrm} setERecFrm={setERecFrm}
            setRecFrm={setRecFrm} setRrFrm={setRrFrm}
            setERecId={setERecId} setERecMod={setERecMod} setERrId={setERrId} setERrMod={setERrMod}
            addRec={addRec} delRec={delRec} openERec={openERec}
            addRr={addRr} delRr={delRr} openERr={openERr} setAddType={setAddType}
            CatSel={CatSel}
            {...styles}
          />
        )}
        {view === "analyse" && (
          <Analyse
            cats={cats} filtTx={filtTx} histItems={histItems} months={months}
            filCat={filCat} selMo={selMo}
            setFilCat={setFilCat} setSelMo={setSelMo}
            startETx={startETx}
            txs={txs} paie={paie} paieM={paieM} recs={recs} rrecs={rrecs} dettes={dettes} projets={projets}
            updRecs={updRecs} updRrecs={updRrecs} delRec={delRec} delRr={delRr}
            {...styles}
          />
        )}
        {view === "parametres" && (
          <Parametres
            user={user} cats={cats}
            updTxs={updTxs} updRecs={updRecs} updRrecs={updRrecs}
            updDettes={updDettes} updProjets={updProjets} updCats={updCats} updPaieM={updPaieM}
            setDetSel={setDetSel} setPrjSel={setPrjSel}
            darkMode={darkMode} setDarkMode={setDarkMode}
            {...styles}
          />
        )}
      </div>

    </div>
  );
}
