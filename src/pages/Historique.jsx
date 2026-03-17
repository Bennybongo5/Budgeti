import { SF, BR2, TX, TX3 } from "../constants.js";
import TxRow from "../components/TxRow.jsx";

export default function Historique({
  txs, cats, filtTx, months, filCat, selMo,
  setFilCat, setSelMo,
  startETx,
  trow, ico, chip,
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: TX }}>Historique</p>
        <select style={{ background: SF, border: "0.5px solid " + BR2, borderRadius: 10, padding: "6px 9px", color: TX, fontSize: 12 }} value={selMo} onChange={e => setSelMo(e.target.value)}>
          <option value="tout">Tous les mois</option>
          {months.map(m => { const [y, mo] = m.split("-"); const lb = new Date(+y, +mo - 1, 1).toLocaleDateString("fr-CA", { month: "long", year: "numeric" }); return <option key={m} value={m}>{lb.charAt(0).toUpperCase() + lb.slice(1)}</option>; })}
        </select>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 4 }}>
        {[{ id: "tout", label: "Tout" }, { id: "revenu", label: "Revenus" }, { id: "paie", label: "Paies" }, ...cats].map(c => (
          <button key={c.id} style={chip(filCat === c.id)} onClick={() => setFilCat(c.id)}>{c.icon && c.id !== "paie" ? c.icon + " " : ""}{c.label}</button>
        ))}
      </div>
      {filtTx.length === 0 && <div style={{ textAlign: "center", color: TX3, padding: "30px 20px", fontSize: 13 }}>Aucune transaction.</div>}
      {filtTx.map(x => <TxRow key={x.id} x={x} cats={cats} trow={trow} ico={ico} startETx={startETx} />)}
    </div>
  );
}
