import { useMemo, useState } from "react";
import { SF, SF2, BR, BR2, TX, TX2, TX3, GN, RD, BT, BTB, BTT } from "../constants.js";
import { fmt } from "../constants.js";
import { ymd, ld, addD, today } from "../utils/dates.js";
import { calcProportionalMonth } from "../utils/calculs.js";
import TxRow from "../components/TxRow.jsx";
import Modal from "../components/Modal.jsx";
import SaveCancel from "../components/SaveCancel.jsx";
import DelBtn from "../components/DelBtn.jsx";

const ALL_JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DOW = { Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5, Samedi: 6, Dimanche: 0 };
function computeDateRef(jourSemaine) {
  const t = today();
  const [ty, tm, td] = t.split("-").map(Number);
  const curDow = new Date(ty, tm - 1, td).getDay();
  const diff = (DOW[jourSemaine] - curDow + 7) % 7;
  return addD(t, diff);
}
const FREQ_OPTIONS = [
  { id: "mois", label: "Mensuel" },
  { id: "semaine", label: "Hebdo" },
  { id: "2semaines", label: "Aux 2 sem." },
];

// Inline frequency picker for edit modals
function FreqPicker({ frm, setFrm, showPaie }) {
  const isWeekly = frm.frequence === "semaine" || frm.frequence === "2semaines";
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Fréquence</label>
        <div style={{ display: "flex", gap: 6 }}>
          {FREQ_OPTIONS.map(f => (
            <button key={f.id} type="button"
              style={{ flex: 1, padding: "7px 4px", background: frm.frequence === f.id ? BT : SF, border: "1px solid " + (frm.frequence === f.id ? BTB : BR), borderRadius: 8, color: frm.frequence === f.id ? BTT : TX2, fontSize: 11, cursor: "pointer" }}
              onClick={() => setFrm(prev => ({
                ...prev, frequence: f.id,
                ...(f.id === "2semaines" ? { dateRef: computeDateRef(prev.jourSemaine || "Lundi") } : {}),
              }))}
            >{f.label}</button>
          ))}
        </div>
      </div>
      {frm.frequence === "mois" && showPaie && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button"
              style={{ flex: 1, padding: "7px 4px", background: frm.jour !== "paie" ? BT : SF, border: "1px solid " + (frm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: frm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }}
              onClick={() => setFrm(f => ({ ...f, jour: typeof f.jour === "number" || f.jour === "fin" ? f.jour : 1 }))}
            >{frm.jour !== "paie" ? (frm.jour === "fin" ? "Fin du mois" : "Le " + frm.jour) : "Jour du mois"}</button>
            <button type="button"
              style={{ flex: 1, padding: "7px 4px", background: frm.jour === "paie" ? BT : SF, border: "1px solid " + (frm.jour === "paie" ? BTB : BR), borderRadius: 8, color: frm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }}
              onClick={() => setFrm(f => ({ ...f, jour: "paie" }))}
            >Paie</button>
          </div>
        </div>
      )}
      {frm.frequence === "mois" && !showPaie && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour du mois</label>
          <input style={{ width: "100%", padding: "9px 10px", background: SF, border: "1px solid " + BR, borderRadius: 8, color: TX, fontSize: 13, boxSizing: "border-box" }}
            type="number" min="1" max="31" value={frm.jour}
            onChange={e => setFrm(f => ({ ...f, jour: +e.target.value }))}
          />
        </div>
      )}
      {frm.frequence === "mois" && showPaie && frm.jour !== "paie" && (
        <div style={{ marginBottom: 10 }}>
          <input style={{ width: "100%", padding: "9px 10px", background: SF, border: "1px solid " + BR, borderRadius: 8, color: TX, fontSize: 13, boxSizing: "border-box" }}
            type="number" min="1" max="31" value={frm.jour === "fin" ? 31 : frm.jour}
            onChange={e => setFrm(f => ({ ...f, jour: +e.target.value }))}
          />
        </div>
      )}
      {isWeekly && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour de la semaine</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {ALL_JOURS.map(j => (
              <button key={j} type="button"
                style={{ padding: "6px 8px", background: frm.jourSemaine === j ? BT : SF, border: "1px solid " + (frm.jourSemaine === j ? BTB : BR), borderRadius: 8, color: frm.jourSemaine === j ? BTT : TX2, fontSize: 11, cursor: "pointer" }}
                onClick={() => setFrm(f => ({
                  ...f, jourSemaine: j,
                  ...(f.frequence === "2semaines" ? { dateRef: computeDateRef(j) } : {}),
                }))}
              >{j.slice(0, 3)}</button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

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
      const totPaie = txs.filter(x => x.type === "revenu" && x.desc === "Paie" && x.date.startsWith(mo)).reduce((s, x) => s + x.amount, 0);
      const totArgentRecu = txs.filter(x => x.type === "revenu" && x.desc !== "Paie" && x.date.startsWith(mo)).reduce((s, x) => s + x.amount, 0);
      const totDep = txs.filter(x => x.type === "depense" && x.date.startsWith(mo)).reduce((s, x) => s + x.amount, 0);
      const rev = totPaie + prop.totRR + totArgentRecu;
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
  updRecs, updRrecs, delRec, delRr,
  trow, ico, chip, card, inp,
}) {
  const [chartMo, setChartMo] = useState(null);
  // Local state for editing a rec directly from Analyse
  const [editRec, setEditRec] = useState(null);
  const [editRr, setEditRr] = useState(null);
  const [editRecForm, setEditRecForm] = useState({ desc: "", amount: "", jour: 1, cat: "", frequence: "mois", jourSemaine: "Lundi", dateRef: null });
  const [editRrForm, setEditRrForm] = useState({ desc: "", amount: "", jour: 1, frequence: "mois", jourSemaine: "Lundi", dateRef: null });

  const openEditRec = r => {
    setEditRec(r);
    setEditRecForm({ desc: r.desc, amount: r.amount, jour: r.jour, cat: r.cat, frequence: r.frequence || "mois", jourSemaine: r.jourSemaine || "Lundi", dateRef: r.dateRef || null });
  };
  const openEditRr = r => {
    setEditRr(r);
    setEditRrForm({ desc: r.desc, amount: r.amount, jour: r.jour, frequence: r.frequence || "mois", jourSemaine: r.jourSemaine || "Lundi", dateRef: r.dateRef || null });
  };
  const saveRec = () => {
    updRecs(prev => prev.map(r => r.id === editRec.id ? { ...r, ...editRecForm, amount: +editRecForm.amount } : r));
    setEditRec(null);
  };
  const saveRr = () => {
    updRrecs(prev => prev.map(r => r.id === editRr.id ? { ...r, ...editRrForm, amount: +editRrForm.amount } : r));
    setEditRr(null);
  };

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 12px", color: TX }}>Analyse</p>

      {/* Edit modal for a recurring expense */}
      {editRec && (
        <Modal title="Modifier la charge">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input autoFocus style={inp} value={editRecForm.desc} onChange={e => setEditRecForm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input style={inp} type="number" value={editRecForm.amount} onChange={e => setEditRecForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label>
            <select style={inp} value={editRecForm.cat} onChange={e => setEditRecForm(f => ({ ...f, cat: e.target.value }))}>
              {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <FreqPicker frm={editRecForm} setFrm={setEditRecForm} showPaie={true} />
          <SaveCancel onS={saveRec} onC={() => setEditRec(null)} />
          <DelBtn onClick={() => { delRec(editRec.id); setEditRec(null); }} />
        </Modal>
      )}

      {/* Edit modal for a recurring income */}
      {editRr && (
        <Modal title="Modifier l'autre revenu">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input autoFocus style={inp} value={editRrForm.desc} onChange={e => setEditRrForm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={editRrForm.amount} onChange={e => setEditRrForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <FreqPicker frm={editRrForm} setFrm={setEditRrForm} showPaie={false} />
          <SaveCancel onS={saveRr} onC={() => setEditRr(null)} />
          <DelBtn onClick={() => { delRr(editRr.id); setEditRr(null); }} />
        </Modal>
      )}

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
        const totPaie = txs.filter(x => x.type === "revenu" && x.desc === "Paie" && x.date.startsWith(chartMo)).reduce((s, x) => s + x.amount, 0);
        const totArgentRecu = txs.filter(x => x.type === "revenu" && x.desc !== "Paie" && x.date.startsWith(chartMo)).reduce((s, x) => s + x.amount, 0);
        const revTotal = totPaie + prop.totRR + totArgentRecu;
        const depTotal = txs.filter(x => x.type === "depense" && x.date.startsWith(chartMo)).reduce((s, x) => s + x.amount, 0) + prop.totRec + prop.totDette + prop.totProjet;
        return (
          <Modal title={"Dépenses — " + moLabel(chartMo)}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <div style={{ flex: 1, padding: "6px 10px", background: "rgba(90,160,60,0.08)", border: "1px solid rgba(90,160,60,0.2)", borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: TX3, margin: "0 0 2px" }}>Revenus</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: GN, margin: 0 }}>{fmt(revTotal)}</p>
              </div>
              <div style={{ flex: 1, padding: "6px 10px", background: "rgba(200,80,80,0.08)", border: "1px solid rgba(200,80,80,0.2)", borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: TX3, margin: "0 0 2px" }}>Dépenses</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: RD, margin: 0 }}>{fmt(depTotal)}</p>
              </div>
            </div>
            <div style={{ padding: "6px 10px", background: SF2, border: "1px solid " + BR, borderRadius: 8, marginBottom: 14 }}>
              <p style={{ fontSize: 10, color: TX3, margin: "0 0 2px" }}>Solde</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: revTotal - depTotal >= 0 ? GN : RD, margin: 0 }}>{revTotal - depTotal >= 0 ? "+" : ""}{fmt(revTotal - depTotal)}</p>
            </div>
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
        {[{ id: "tout", label: "Tout" }, { id: "revenu", label: "Revenus" }, { id: "paie", label: "Paies" }, { id: "recurrents", label: "Récurrents" }, { id: "dettes", label: "Dettes" }, { id: "projets", label: "Projets" }, ...cats].map(c => (
          <button key={c.id} style={chip(filCat === c.id)} onClick={() => setFilCat(c.id)}>{c.icon && !["tout", "revenu", "paie", "recurrents", "dettes", "projets"].includes(c.id) ? c.icon + " " : ""}{c.label}</button>
        ))}
      </div>

      {filtTx.length === 0 && <div style={{ textAlign: "center", color: TX3, padding: "30px 20px", fontSize: 13 }}>Aucune transaction.</div>}
      {filtTx.map(x => {
        // For recurring items, resolve the original rec/rrec to enable inline editing
        let onEdit;
        if (x.source === "rec" || x.source === "rr") {
          const recId = parseInt(x.id.split("-")[1]);
          const original = x.source === "rec"
            ? recs.find(r => r.id === recId)
            : rrecs.find(r => r.id === recId);
          if (original) {
            onEdit = () => x.source === "rec" ? openEditRec(original) : openEditRr(original);
          }
        }
        return <TxRow key={x.id} x={x} cats={cats} trow={trow} ico={ico} startETx={startETx} onEdit={onEdit} />;
      })}
    </div>
  );
}
