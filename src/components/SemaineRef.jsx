import { JOURS_SEM, BT, BTB, BTT, SF, BR, TX2, TX3, addD } from "../constants.js";

function SemaineRef({ t, paie, updPaie, fbtn }) {
  const map = { Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5 };
  const jourCible = map[paie.jourSemaine] || 5;
  const parts = t.split("-").map(Number);
  const dow = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
  const diffPasse = ((dow - jourCible + 7) % 7) || 7;
  const dL = addD(t, -diffPasse);
  const dProchain = addD(dL, 7);
  const opts = [dL, dProchain];
  const lbls = ["Dernier ", "Prochain "];
  const btnStyle = (k) => ({
    flex: 1,
    background: paie.dateRef === k ? BT : SF,
    border: "1px solid " + (paie.dateRef === k ? BTB : BR),
    borderRadius: 9,
    padding: "7px 8px",
    cursor: "pointer",
    textAlign: "center",
    color: paie.dateRef === k ? BTT : TX2,
    fontSize: 12,
    fontWeight: paie.dateRef === k ? 500 : 400,
  });

  return (
    <div>
      <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour de paie</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {JOURS_SEM.map((j) => (
          <button key={j} style={{ ...fbtn(paie.jourSemaine === j), flex: "none", padding: "7px 10px" }} onClick={() => updPaie((p) => ({ ...p, jourSemaine: j, dateRef: "" }))}>
            {j.slice(0, 3)}
          </button>
        ))}
      </div>
      <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Semaine de référence</label>
      <div style={{ display: "flex", gap: 8 }}>
        {opts.map((k, i) => {
          const p2 = k.split("-").map(Number);
          const lb = new Date(p2[0], p2[1] - 1, p2[2]).toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
          return (
            <button key={k} onClick={() => updPaie((p) => ({ ...p, dateRef: k }))} style={btnStyle(k)}>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: paie.dateRef === k ? BTT : TX3 }}>{lbls[i] + paie.jourSemaine}</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{lb}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SemaineRef;
