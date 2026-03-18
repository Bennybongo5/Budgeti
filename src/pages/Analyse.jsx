import { useMemo } from "react";
import { SF, SF2, BR, BR2, TX, TX2, TX3, GN, RD } from "../constants.js";
import { fmt } from "../constants.js";
import TxRow from "../components/TxRow.jsx";

const shortFmt = v => {
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(v).toString();
};

const moLabel = mo => {
  const [y, m] = mo.split("-");
  return new Date(+y, +m - 1, 1).toLocaleDateString("fr-CA", { month: "short" });
};

function BarChart({ histItems, months }) {
  const data = useMemo(() => {
    return [...months].reverse().slice(0, 12).reverse().map(mo => {
      const items = histItems.filter(x => x.date.startsWith(mo));
      const rev = items.filter(x => x.type === "revenu").reduce((s, x) => s + x.amount, 0);
      const dep = items.filter(x => x.type === "depense").reduce((s, x) => s + x.amount, 0);
      return { mo, rev, dep, solde: rev - dep };
    });
  }, [histItems, months]);

  if (data.length === 0) return (
    <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "20px 0" }}>Aucune donnée disponible.</p>
  );

  const maxVal = Math.max(...data.flatMap(d => [d.rev, d.dep]), 1);
  const barH = 110;
  const baseY = barH + 10;
  const barW = 16;
  const gap = 4;
  const groupW = barW * 2 + gap + 18;
  const padL = 36;
  const svgW = padL + data.length * groupW + 10;
  const svgH = baseY + 42;

  const ticks = [0, 0.5, 1].map(t => ({
    val: t * maxVal,
    y: baseY - t * barH,
  }));

  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <svg width={svgW} height={svgH} style={{ display: "block", minWidth: "100%" }}>
        {/* Grid lines + Y labels */}
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={padL} y1={tk.y} x2={svgW - 4} y2={tk.y} stroke={BR} strokeWidth={0.7} strokeDasharray={i === 0 ? "none" : "3 3"} />
            <text x={padL - 4} y={tk.y + 3} textAnchor="end" fontSize={8} fill={TX3}>{shortFmt(tk.val)}</text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + i * groupW;
          const revH = Math.max((d.rev / maxVal) * barH, d.rev > 0 ? 2 : 0);
          const depH = Math.max((d.dep / maxVal) * barH, d.dep > 0 ? 2 : 0);
          const soldeClr = d.solde >= 0 ? GN : RD;
          return (
            <g key={d.mo}>
              {/* Revenus bar */}
              <rect x={x} y={baseY - revH} width={barW} height={revH} fill={GN} rx={3} opacity={0.8} />
              {/* Dépenses bar */}
              <rect x={x + barW + gap} y={baseY - depH} width={barW} height={depH} fill={RD} rx={3} opacity={0.8} />
              {/* Month label */}
              <text x={x + barW + gap / 2} y={baseY + 12} textAnchor="middle" fontSize={9} fill={TX3}>{moLabel(d.mo)}</text>
              {/* Solde */}
              <text x={x + barW + gap / 2} y={baseY + 26} textAnchor="middle" fontSize={8} fontWeight="700" fill={soldeClr}>
                {d.solde >= 0 ? "+" : ""}{shortFmt(d.solde)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 8, paddingLeft: padL }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, background: GN, borderRadius: 2, opacity: 0.8 }} />
          <span style={{ fontSize: 11, color: TX3 }}>Revenus</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, background: RD, borderRadius: 2, opacity: 0.8 }} />
          <span style={{ fontSize: 11, color: TX3 }}>Dépenses</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 11, color: TX3, fontWeight: 700 }}>± Solde</span>
        </div>
      </div>
    </div>
  );
}

export default function Analyse({
  cats, filtTx, histItems, months, filCat, selMo,
  setFilCat, setSelMo, startETx,
  trow, ico, chip, card,
}) {
  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px", color: TX }}>Analyse</p>

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 14px" }}>Revenus vs Dépenses par mois</p>
        <BarChart histItems={histItems} months={months} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 8px" }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: TX }}>Transactions</p>
        <select style={{ background: SF, border: "0.5px solid " + BR2, borderRadius: 10, padding: "6px 9px", color: TX, fontSize: 12 }} value={selMo} onChange={e => setSelMo(e.target.value)}>
          <option value="tout">Tous les mois</option>
          {months.map(m => { const [y, mo] = m.split("-"); const lb = new Date(+y, +mo - 1, 1).toLocaleDateString("fr-CA", { month: "long", year: "numeric" }); return <option key={m} value={m}>{lb.charAt(0).toUpperCase() + lb.slice(1)}</option>; })}
        </select>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 4 }}>
        {[{ id: "tout", label: "Tout" }, { id: "revenu", label: "Revenus" }, { id: "paie", label: "Paies" }, { id: "recurrents", label: "Recurrents" }, { id: "dettes", label: "Dettes" }, { id: "projets", label: "Projets" }, ...cats].map(c => (
          <button key={c.id} style={chip(filCat === c.id)} onClick={() => setFilCat(c.id)}>{c.icon && !["tout", "revenu", "paie", "recurrents", "dettes", "projets"].includes(c.id) ? c.icon + " " : ""}{c.label}</button>
        ))}
      </div>

      {filtTx.length === 0 && <div style={{ textAlign: "center", color: TX3, padding: "30px 20px", fontSize: 13 }}>Aucune transaction.</div>}
      {filtTx.map(x => <TxRow key={x.id} x={x} cats={cats} trow={trow} ico={ico} startETx={startETx} />)}
    </div>
  );
}
