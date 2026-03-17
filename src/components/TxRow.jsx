import { fmt, TX, TX3, AC, GN, RD, BT, BTB } from "../constants.js";

// trow and ico are passed as props so the parent's style objects are used
function TxRow({ x, cats, trow, ico, startETx }) {
  const cat = cats.find((c) => c.id === x.cat) || { icon: "📦", label: x.cat };
  return (
    <div style={trow}>
      <div style={ico}>{x.type === "revenu" ? "💰" : cat.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.desc}</p>
        <p style={{ fontSize: 11, color: TX3, margin: 0 }}>{x.date}{x.type === "depense" ? " · " + cat.label : ""}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: x.type === "revenu" ? GN : RD, flexShrink: 0 }}>
        {x.type === "revenu" ? "+" : "-"}{fmt(x.amount)}
      </span>
      <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={() => startETx(x)}>✎</button>
    </div>
  );
}

export default TxRow;
