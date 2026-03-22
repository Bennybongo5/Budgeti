import { fmt, TX, TX3, AC, GN, RD } from "../constants.js";

// onEdit: optional callback — when provided, shows an edit button for recurring items
function TxRow({ x, cats, trow, ico, startETx, onEdit }) {
  const cat = cats.find((c) => c.id === x.cat) || { icon: "📦", label: x.cat };
  const icon = x.source === "dette" ? "📊"
    : x.source === "projet" ? (x.icon || "🎯")
    : x.source === "rr" ? "💰"
    : x.type === "revenu" ? "💰"
    : cat.icon;
  const srcLabel = x.source === "dette" ? "Dette"
    : x.source === "projet" ? "Projet"
    : (x.source === "rec" || x.source === "rr") ? "Récurrent"
    : null;
  const subLabel = srcLabel || (x.type === "depense" ? cat.label : null);
  return (
    <div style={trow}>
      <div style={ico}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.desc}</p>
        <p style={{ fontSize: 11, color: TX3, margin: 0 }}>{x.date}{subLabel ? " · " + subLabel : ""}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: x.type === "revenu" ? GN : RD, flexShrink: 0 }}>
        {x.type === "revenu" ? "+" : "-"}{fmt(x.amount)}
      </span>
      {!x.source
        ? <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={() => startETx(x)}>✎</button>
        : onEdit
        ? <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={onEdit}>✎</button>
        : <div style={{ width: 28 }} />}
    </div>
  );
}

export default TxRow;
