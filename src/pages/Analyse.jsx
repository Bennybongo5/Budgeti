import { useMemo, useState } from "react";
import { SF, SF2, BR, BR2, TX, TX2, TX3, GN, RD, BT, BTB, BTT } from "../constants.js";
import { fmt } from "../constants.js";
import { ymd, ld } from "../utils/dates.js";
import { calcProportionalMonth } from "../utils/calculs.js";
import TxRow from "../components/TxRow.jsx";
import Modal from "../components/Modal.jsx";

const shortFmt = v => {
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(v).toString();
};

const moLabel = mo => {
  const [y, m] = mo.split("-");
  return new Date(+y, +m - 1, 1).toLocaleDateString("fr-CA", { month: "short" }) + " " + y;
};

const PIE_COLORS = ["#8ab87a","#e07878","#70a8d8","#d4a060","#a878d0","#50c8a8","#d8c840","#d06888","#60b8d8","#c89858"];

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx, cy, r, start, end) {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function PieChart({ histItems, mo, cats }) {
  const slices = useMemo(() => {
    const items = histItems.filter(x => x.type === "depense" && x.date.startsWith(mo));
    const totals = {};
    items.forEach(x => { totals[x.cat] = (totals[x.cat] || 0) + x.amount; });
    const total = Object.values(totals).reduce((s, v) => s + v, 0);
    if (total === 0) return [];
    return Object.entries(totals)
      .map(([catId, amount]) => ({ catId, amount, pct: amount / total, cat: cats.find(c => c.id === catId) || { label: catId, icon: "📦" } }))
      .sort((a, b) => b.amount - a.amount);
  }, [histItems, mo, cats]);

  if (slices.length === 0) return (
    <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "20px 0" }}>Aucune dépense ce mois.</p>
  );

  const cx = 80, cy = 80, r = 70;
  let angle = 0;

  return (
    <div>
      <svg width="100%" viewBox="0 0 160 160" style={{ display: "block", maxWidth: 200, margin: "0 auto 14px" }}>
        {slices.map((s, i) => {
          const start = angle;
          const end = angle + s.pct * 360;
          angle = end;
          return <path key={s.catId} d={slicePath(cx, cy, r, start, end)} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={1.5} />;
        })}
      </svg>
      <div>
        {slices.map((s, i) => (
          <div key={s.catId} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "4px 0", borderBottom: "0.5px solid " + BR }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>{s.cat.icon}</span>
            <span style={{ fontSize: 12, color: TX, flex: 1 }}>{s.cat.label}</span>
            <span style={{ fontSize: 11, color: TX3 }}>{Math.round(s.pct * 100)}%</span>
            <span style={{ fontSize: 12, color: RD, fontWeight: 500 }}>{fmt(s.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ histItems, months, onClickMo, txs, paie, paieM, recs, rrecs, dettes, projets }) {
  const data = useMemo(() => {
    return [...months].reverse().slice(0, 12).reverse().map(mo => {
      const [my, mm] = mo.split("-").map(Number);
      const moStart = ymd(my, mm, 1);
      const moEnd = ymd(my, mm, ld(my, mm));
      const prop = calcProportionalMonth(paie, moStart, moEnd, paieM, recs, rrecs, dettes, projets);
      const totArgentRecu = txs.filter(x => x.type === "revenu" && x.desc !== "Paie" && x.date.startsWith(mo)).reduce((s, x) => s + x.amount, 0);
      const totDep = txs.filter(x => x.type === "depense" && x.date.startsWith(mo)).reduce((s, x) => s + x.amount, 0);
      const rev = prop.totPaie + prop.totRR + totArgentRecu;
      const dep = totDep + prop.totRec + prop.totDette + prop.totProjet;
      return { mo, rev, dep, solde: rev - dep };
    });
  }, [months, txs, paie, paieM, recs, rrecs, dettes, projets]);

  if (data.length === 0) return (
    <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "20px 0" }}>Aucune donnée disponible.</p>
  );

  const maxVal = Math.max(...data.flatMap(d => [d.rev, d.dep]), 1);
  const barH = 110, baseY = barH + 10, barW = 16, gap = 4;
  const groupW = barW * 2 + gap + 34;
  const padL = 36;
  const svgW = padL + data.length * groupW + 10;
  const ticks = [0, 0.5, 1].map(t => ({ val: t * maxVal, y: baseY - t * barH }));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={baseY + 42} style={{ display: "block", minWidth: "100%" }}>
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={padL} y1={tk.y} x2={svgW - 4} y2={tk.y} stroke={BR} strokeWidth={0.7} strokeDasharray={i === 0 ? "none" : "3 3"} />
            <text x={padL - 4} y={tk.y + 3} textAnchor="end" fontSize={8} fill={TX3}>{shortFmt(tk.val)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * groupW;
          const revH = Math.max((d.rev / maxVal) * barH, d.rev > 0 ? 2 : 0);
          const depH = Math.max((d.dep / maxVal) * barH, d.dep > 0 ? 2 : 0);
          return (
            <g key={d.mo} onClick={() => onClickMo(d.mo)} style={{ cursor: "pointer" }}>
              <rect x={x - 2} y={0} width={groupW - 2} height={baseY + 28} fill="transparent" />
              <rect x={x} y={baseY - revH} width={barW} height={revH} fill={GN} rx={3} opacity={0.8} />
              <rect x={x + barW + gap} y={baseY - depH} width={barW} height={depH} fill={RD} rx={3} opacity={0.8} />
              <text x={x + barW + gap / 2} y={baseY + 12} textAnchor="middle" fontSize={9} fill={TX3}>{moLabel(d.mo)}</text>
              <text x={x + barW + gap / 2} y={baseY + 26} textAnchor="middle" fontSize={8} fontWeight="700" fill={d.solde >= 0 ? GN : RD}>
                {d.solde >= 0 ? "+" : ""}{shortFmt(d.solde)}
              </text>
            </g>
          );
        })}
      </svg>
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
  txs, paie, paieM, recs, rrecs, dettes, projets,
  trow, ico, chip, card,
}) {
  const [chartMo, setChartMo] = useState(null);

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px", color: TX }}>Analyse</p>

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 6px" }}>Revenus vs Dépenses par mois</p>
        <p style={{ fontSize: 11, color: TX3, margin: "0 0 12px" }}>Appuie sur un mois pour voir le détail des dépenses.</p>
        <BarChart histItems={histItems} months={months} onClickMo={mo => setChartMo(mo)} txs={txs} paie={paie} paieM={paieM} recs={recs} rrecs={rrecs} dettes={dettes} projets={projets} />
      </div>

      {chartMo && (() => {
        const [cmy, cmm] = chartMo.split("-").map(Number);
        const moStart = ymd(cmy, cmm, 1);
        const moEnd = ymd(cmy, cmm, ld(cmy, cmm));
        const prop = calcProportionalMonth(paie, moStart, moEnd, paieM, recs, rrecs, dettes, projets);
        const totArgentRecu = txs.filter(x => x.type === "revenu" && x.desc !== "Paie" && x.date.startsWith(chartMo)).reduce((s, x) => s + x.amount, 0);
        const revTotal = prop.totPaie + prop.totRR + totArgentRecu;
        const depTotal = txs.filter(x => x.type === "depense" && x.date.startsWith(chartMo)).reduce((s, x) => s + x.amount, 0) + prop.totRec + prop.totDette + prop.totProjet;
        return (
          <Modal title={"Dépenses — " + moLabel(chartMo)}>
            <p style={{ fontSize: 13, color: TX2, margin: "0 0 14px", padding: "8px 12px", background: "rgba(90,160,60,0.08)", border: "1px solid rgba(90,160,60,0.2)", borderRadius: 8 }}>
              Revenu total : <strong style={{ color: GN }}>{fmt(revTotal)}</strong>
            </p>
            <p style={{ fontSize: 13, color: TX2, margin: "0 0 14px", padding: "8px 12px", background: "rgba(200,80,80,0.08)", border: "1px solid rgba(200,80,80,0.2)", borderRadius: 8 }}>
              Dépense totale : <strong style={{ color: RD }}>{fmt(depTotal)}</strong>
            </p>
            <PieChart histItems={histItems} mo={chartMo} cats={cats} />
            <button style={{ width: "100%", marginTop: 16, padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => setChartMo(null)}>Fermer</button>
          </Modal>
        );
      })()}

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
