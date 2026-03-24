import { useState } from "react";
import { FREQS, JOURS_SEM, JOURS_MOIS, PAR_PAIE_ROWS, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD, GN } from "../constants.js";
import { today, fmt, fd, ymd, ld } from "../utils/dates.js";
import { getPaieBreakdownForMonth, getWeeklyOccurrencesInPeriod } from "../utils/calculs.js";
import Modal from "../components/Modal.jsx";
import SaveCancel from "../components/SaveCancel.jsx";
import StatBox from "../components/StatBox.jsx";
import TxRow from "../components/TxRow.jsx";
import SemaineRef from "../components/SemaineRef.jsx";

function StatModal({ title, items, emptyMsg, onClose, trow, cats }) {
  const [filCat, setFilCat] = useState("tout");
  const visibleCats = cats ? cats.filter(c => items.some(i => i.catId === c.id)) : [];
  const shown = filCat === "tout" ? items : items.filter(i => i.catId === filCat);
  const total = shown.reduce((s, i) => s + i.montant, 0);
  const clr = items[0]?.clr || TX;
  const pfx = items[0]?.pfx || "";
  const chipSt = active => ({ padding: "4px 10px", background: active ? BT : SF, border: "1px solid " + (active ? BTB : BR), borderRadius: 20, color: active ? BTT : TX2, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" });
  return (
    <Modal title={title} onClose={onClose}>
      {visibleCats.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          <button style={chipSt(filCat === "tout")} onClick={() => setFilCat("tout")}>Tout</button>
          {visibleCats.map(c => (
            <button key={c.id} style={chipSt(filCat === c.id)} onClick={() => setFilCat(c.id)}>{c.icon} {c.label}</button>
          ))}
        </div>
      )}
      <p style={{ fontSize: 12, color: TX3, margin: "0 0 12px" }}>{shown.length} element{shown.length !== 1 ? "s" : ""}</p>
      {shown.length === 0 && <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "10px 0" }}>{emptyMsg}</p>}
      {shown.map(it => (
        <div key={it.key} style={trow}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: TX, margin: 0, fontWeight: 500 }}>{it.label}</p>
            {it.sub && <p style={{ fontSize: 11, color: TX3, margin: 0 }}>{it.sub}</p>}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: it.clr, flexShrink: 0 }}>{it.pfx}{fmt(it.montant)}</span>
        </div>
      ))}
      {shown.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid " + BR, marginTop: 8, paddingTop: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: TX2 }}>Total</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: clr }}>{pfx}{fmt(total)}</span>
        </div>
      )}
      <button onClick={onClose} style={{ width: "100%", marginTop: 14, padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Fermer</button>
    </Modal>
  );
}

export default function Dashboard({
  paie, paieOpen, paieM, paieIdx, txs, cats, periodes, paies,
  recs, rrecs, dettes, projets,
  totPaieMois, totArgentRecu, totDep, totRR, totRec, totDettesMois, totProjetsMois, solde, dbc, maxD,
  setPaieOpen, updPaie, updPaieM, updTxs, setPaieIdx, setTxForm, setShowTx, navigate, startETx,
  inp, inpSm, card, trow, ico, fbtn,
}) {
  const t = today();
  const [curY, curM] = t.split("-").map(Number);
  const curMo = curY + "-" + String(curM).padStart(2, "0");
  const [paieInput, setPaieInput] = useState("");
  const [catModal, setCatModal] = useState(null);
  const [statModal, setStatModal] = useState(null);
  // Toggle between current pay period view and monthly view (default: pay period)
  const [viewMode, setViewMode] = useState("paie");

  // Current pay period (the one marked isCur in periodes)
  const curPeriode = periodes.find(p => p.isCur) || null;

  // Helper: check if a transaction/payment falls within the current pay period
  const inPeriod = x => curPeriode && x.date >= curPeriode.deb && (curPeriode.fin ? x.date < curPeriode.fin : true);

  // Helper: check if a recurring item (rec/rrec) has an occurrence in the current pay period
  const recInPeriod = r => {
    if (!curPeriode) return false;
    const { deb, fin } = curPeriode;
    const debMo = deb.slice(0, 7);
    if (r.dateFin && debMo >= r.dateFin) return false;
    if ((r.exclusions || []).includes(debMo)) return false;
    if (r.frequence === "paie" || r.jour === "paie") return true;
    if (r.frequence === "semaine" || r.frequence === "2semaines") return true; // weekly always present
    // Monthly: check if the payment day falls between deb and fin
    const checkM = (y, m) => {
      const lastD = ld(y, m);
      const j = r.jour === "fin" ? lastD : Math.min(+r.jour || 1, lastD);
      const d = ymd(y, m, j);
      return d >= deb && (!fin || d < fin);
    };
    const [dy, dm] = deb.split("-").map(Number);
    const [fy, fm] = (fin || deb).split("-").map(Number);
    return checkM(dy, dm) || ((fy !== dy || fm !== dm) && checkM(fy, fm));
  };

  // Helper: check if an auto-payment (dette/projet) falls in the current pay period
  const autoPayInPeriod = pa => {
    if (!curPeriode) return false;
    const { deb, fin } = curPeriode;
    const debMo = deb.slice(0, 7);
    if (pa.dateFin && debMo >= pa.dateFin) return false;
    if ((pa.exclusions || []).includes(debMo)) return false;
    if (pa.jour === "paie") return true;
    const checkM = (y, m) => {
      const lastD = ld(y, m);
      const j = pa.jour === "fin" ? lastD : Math.min(+pa.jour || 1, lastD);
      const d = ymd(y, m, j);
      return d >= deb && (!fin || d < fin);
    };
    const [dy, dm] = deb.split("-").map(Number);
    const [fy, fm] = (fin || deb).split("-").map(Number);
    return checkM(dy, dm) || ((fy !== dy || fm !== dm) && checkM(fy, fm));
  };

  // Frequency label for a rec/rrec
  const recFreqLabel = r =>
    r.frequence === "paie" || r.jour === "paie" ? "À ma paie"
    : r.frequence === "semaine" ? "Chaque " + (r.jourSemaine || "")
    : r.frequence === "2semaines" ? "/ 2 sem. " + (r.jourSemaine || "")
    : r.jour === "fin" ? "Dernier du mois"
    : "Le " + r.jour;

  // Category expense totals for the current pay period
  const dbcPaie = (() => {
    if (!curPeriode) return {};
    const m = {};
    txs
      .filter(x => x.type === "depense" && inPeriod(x))
      .forEach(x => { m[x.cat] = (m[x.cat] || 0) + x.amount; });
    return m;
  })();
  const maxDPaie = Math.max(...Object.values(dbcPaie), 1);

  // Active category data adapts to the current view mode
  const activeDb = viewMode === "paie" ? dbcPaie : dbc;
  const activeMaxD = viewMode === "paie" ? maxDPaie : maxD;

  const buildPaieGrid = () => {
    const cols = "100px " + periodes.map(() => "minmax(80px, 1fr)").join(" ");
    const hdr = [<div key="hlbl" />, ...periodes.map((p, i) => (
      <div key={"h" + i} style={{ textAlign: "center", background: p.isCur ? BT : p.isPast ? SF2 : BR, border: "1px solid " + (p.isCur ? BTB : BR2), borderRadius: 8, padding: "4px 3px" }}>
        <p style={{ fontSize: 9, fontWeight: 500, color: p.isCur ? BTT : TX3, margin: "0 0 1px" }}>{p.isPast ? "Passée" : p.isCur ? "En cours" : "Prochaine"}</p>
        <p style={{ fontSize: 10, color: p.isCur ? BTT : TX3, margin: 0 }}>{fd(p.deb)}</p>
        <p style={{ fontSize: 9, color: p.isCur ? BTT : TX3, margin: "1px 0 0", opacity: 0.7 }}>au {p.fin ? fd(p.fin) : "?"}</p>
      </div>
    ))];
    const rows = PAR_PAIE_ROWS.flatMap((row, ri) => {
      const lbl = <span key={"l" + ri} style={{ fontSize: 11, color: ri < 3 ? GN : TX2, fontWeight: row.b ? 500 : 400, whiteSpace: "nowrap" }}>{row.l}</span>;
      const vals = periodes.map((p, ci) => {
        const prefix = row.s ? "- " : (ri < 3 && p[row.k] > 0 ? "+" : "");
        const val = p[row.k] === 0 ? "—" : fmt(p[row.k]);
        return <div key={"v" + ri + "-" + ci} style={{ textAlign: "center" }}><span style={{ fontSize: 11, fontWeight: row.b ? 500 : 400, color: p[row.k] === 0 ? TX3 : row.c }}>{prefix}{val}</span></div>;
      });
      return [lbl, ...vals];
    });
    const sep = [<div key="sep" style={{ gridColumn: "1 / " + (periodes.length + 2), borderTop: "0.5px solid " + BR2, margin: "3px 0" }} />];
    const rl = <span key="rl" style={{ fontSize: 11, fontWeight: 500, color: TX, whiteSpace: "nowrap" }}>Solde</span>;
    const rv = periodes.map((p, i) => (
      <div key={"rv" + i} style={{ textAlign: "center", background: !p.hasPaie ? SF : p.reste >= 0 ? BT : "var(--c-rd-light)", border: "1px solid " + (!p.hasPaie ? BR : p.reste >= 0 ? BTB : "var(--c-rd-light-b)"), borderRadius: 8, padding: "4px 3px" }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: !p.hasPaie ? TX3 : p.reste >= 0 ? BTT : RD, margin: 0 }}>{p.hasPaie ? fmt(p.reste) : "—"}</p>
      </div>
    ));
    return <div style={{ display: "grid", gridTemplateColumns: cols, gap: "5px 6px", alignItems: "center", minWidth: 320 }}>{hdr}{rows}{sep}{rl}{rv}</div>;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button style={{ flex: 1, padding: "14px 8px", background: "var(--c-dep)", border: "1px solid var(--c-dep-b)", borderRadius: 12, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { setTxForm(f => ({ ...f, type: "depense", desc: "", amount: "", date: today() })); setShowTx(true); }}>Dépense</button>
        <button style={{ flex: 1, padding: "14px 8px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { setTxForm(f => ({ ...f, type: "revenu", desc: "", amount: "", date: today() })); setShowTx(true); }}>Argent reçu</button>
      </div>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: TX2 }}>Fréquence :</span>
          <div style={{ background: BT, border: "1px solid " + BTB, borderRadius: 20, padding: "4px 12px" }}><span style={{ fontSize: 12, fontWeight: 500, color: BTT }}>{FREQS.find(f => f.id === paie.frequence)?.label}</span></div>
          <button onClick={() => setPaieOpen(true)} style={{ marginLeft: "auto", background: "none", border: "1px solid " + BR, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: TX2 }}>Modifier</button>
        </div>
        {paieOpen && (
          <Modal title="Fréquence de paie" onClose={() => setPaieOpen(false)}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Fréquence</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{FREQS.map(f => <button key={f.id} style={fbtn(paie.frequence === f.id)} onClick={() => updPaie(p => ({ ...p, frequence: f.id }))}>{f.label}</button>)}</div>
            </div>
            {paie.frequence === "semaine" && <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Jour de paie</label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{JOURS_SEM.map(j => <button key={j} style={{ ...fbtn(paie.jourSemaine === j), flex: "none", padding: "7px 10px" }} onClick={() => updPaie(p => ({ ...p, jourSemaine: j }))}>{j.slice(0, 3)}</button>)}</div></div>}
            {paie.frequence === "2semaines" && <div style={{ marginBottom: 14 }}><SemaineRef t={t} paie={paie} updPaie={updPaie} fbtn={fbtn} /></div>}
            {paie.frequence === "mois" && <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Jour du mois</label><select style={inpSm} value={paie.jour1} onChange={e => updPaie(p => ({ ...p, jour1: e.target.value === "fin" ? "fin" : +e.target.value }))}>{JOURS_MOIS.map(j => <option key={j} value={j}>{j === "fin" ? "Dernier jour" : "Le " + j}</option>)}</select></div>}
            {paie.frequence === "2mois" && <div style={{ display: "flex", gap: 10, marginBottom: 14 }}><div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>1re paie</label><select style={inpSm} value={paie.jour1} onChange={e => updPaie(p => ({ ...p, jour1: e.target.value === "fin" ? "fin" : +e.target.value }))}>{JOURS_MOIS.map(j => <option key={j} value={j}>{j === "fin" ? "Dernier jour" : "Le " + j}</option>)}</select></div><div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>2e paie</label><select style={inpSm} value={paie.jour2} onChange={e => updPaie(p => ({ ...p, jour2: e.target.value === "fin" ? "fin" : +e.target.value }))}>{JOURS_MOIS.map(j => <option key={j} value={j}>{j === "fin" ? "Dernier jour" : "Le " + j}</option>)}</select></div></div>}
            <button style={{ width: "100%", padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => setPaieOpen(false)}>Fermer</button>
          </Modal>
        )}
        {paies.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: TX2, margin: "12px 0 7px" }}>Paies</p>
            {paieIdx !== null && (
              <Modal title={"Paie du " + fd(paies[paieIdx])} onClose={() => { setPaieIdx(null); setPaieInput(""); }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label>
                  <input autoFocus style={inp} type="number" placeholder="0.00" value={paieInput} onChange={e => setPaieInput(e.target.value)} />
                </div>
                <SaveCancel
                  onS={() => {
                    const v = +paieInput;
                    if (v > 0) {
                      const deb = paies[paieIdx];
                      updPaieM(p => ({ ...p, [deb]: v }));
                      updTxs(p => [...p.filter(x => !(x.type === "revenu" && x.desc === "Paie" && x.date === deb)), { id: Date.now(), type: "revenu", desc: "Paie", amount: v, cat: "autres", date: deb }]);
                    }
                    setPaieIdx(null);
                    setPaieInput("");
                  }}
                  onC={() => { setPaieIdx(null); setPaieInput(""); }}
                />
              </Modal>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              {paies.map((deb, i) => {
                const m = paieM[deb];
                const p = periodes[i];
                return (
                  <div key={i} style={{ flex: 1 }} onClick={() => { setPaieIdx(i); setPaieInput(m || ""); }}>
                    <div style={{ background: m ? BT : p?.isCur ? SF2 : SF, border: "2px solid " + (p?.isCur ? BTB : BR), borderRadius: 10, padding: "8px 6px", cursor: "pointer", textAlign: "center" }}>
                      <p style={{ fontSize: 9, color: p?.isCur ? BTT : TX3, margin: "0 0 1px", fontWeight: 500 }}>{p?.isPast ? "Passée" : p?.isCur ? "En cours" : "Prochaine"}</p>
                      <p style={{ fontSize: 11, color: m ? BTT : TX2, margin: 0 }}>{fd(deb)}</p>
                      <p style={{ fontSize: 12, fontWeight: 500, color: m ? BTT : TX3, margin: "2px 0 0" }}>{m ? fmt(m) : "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* View mode toggle — left-aligned, no title */}
      <div style={{ margin: "4px 0 10px" }}>
        <div style={{ display: "inline-flex", background: SF, border: "1px solid " + BR, borderRadius: 22, padding: 4 }}>
          <button
            onClick={() => setViewMode("paie")}
            style={{ padding: "6px 18px", borderRadius: 18, background: viewMode === "paie" ? BT : "transparent", border: "none", color: viewMode === "paie" ? BTT : TX2, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
          >
            Paie actuelle
          </button>
          <button
            onClick={() => setViewMode("mois")}
            style={{ padding: "6px 18px", borderRadius: 18, background: viewMode === "mois" ? BT : "transparent", border: "none", color: viewMode === "mois" ? BTT : TX2, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
          >
            Vue mensuelle
          </button>
        </div>
      </div>

      {/* Current pay period stats */}
      {viewMode === "paie" && (
        curPeriode ? (
          <div>
            {/* Pay period date range badge — left-aligned with "En cours" right next to the dates */}
            <div style={{ background: SF2, border: "1px solid " + BR2, borderRadius: 10, padding: "8px 12px", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: TX2 }}>{fd(curPeriode.deb)} → {curPeriode.fin ? fd(curPeriode.fin) : "?"}</span>
              <span style={{ fontSize: 11, background: BT, border: "1px solid " + BTB, borderRadius: 20, padding: "2px 8px", color: BTT, fontWeight: 500 }}>En cours</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("paie")}><StatBox label="Paie" value={"+" + fmt(curPeriode.mp)} color={GN} /></div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("depenses")}><StatBox label="Dépenses" value={"-" + fmt(curPeriode.deps)} color={RD} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("rrecs")}><StatBox label="Autres revenus" value={"+" + fmt(curPeriode.rrP)} color={GN} /></div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("recs")}><StatBox label="Paiements fixes" value={"-" + fmt(curPeriode.ch)} color={RD} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("argentRecu")}><StatBox label="Argent reçu" value={"+" + fmt(curPeriode.aRev)} color={GN} /></div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("dettes")}><StatBox label="Paiements dettes" value={"-" + fmt(curPeriode.detP)} color={RD} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, background: SF, border: "1px solid " + BR, borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Solde</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 3 }}>
                  <p style={{ fontSize: 17, fontWeight: 500, color: curPeriode.reste >= 0 ? GN : RD, margin: 0 }}>{fmt(curPeriode.reste)}</p>
                  <div style={{ paddingBottom: 1 }}>
                    <p style={{ fontSize: 10, color: GN, margin: 0 }}>▲ {fmt(curPeriode.tot)}</p>
                    <p style={{ fontSize: 10, color: RD, margin: 0 }}>▼ {fmt(curPeriode.tot - curPeriode.reste)}</p>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("projets")}><StatBox label="Vers. projets" value={"-" + fmt(curPeriode.prjP)} color={RD} /></div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "16px 0" }}>Aucune période de paie en cours.</p>
        )
      )}

      {/* Monthly stats */}
      {viewMode === "mois" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("paie")}><StatBox label="Paies" value={"+" + fmt(totPaieMois)} color={GN} /></div>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("depenses")}><StatBox label="Dépenses" value={"-" + fmt(totDep)} color={RD} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("rrecs")}><StatBox label="Autres revenus" value={"+" + fmt(totRR)} color={GN} /></div>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("recs")}><StatBox label="Paiements fixes" value={"-" + fmt(totRec)} color={RD} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("argentRecu")}><StatBox label="Argent reçu" value={"+" + fmt(totArgentRecu)} color={GN} /></div>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("dettes")}><StatBox label="Paiements dettes" value={"-" + fmt(totDettesMois)} color={RD} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, background: SF, border: "1px solid " + BR, borderRadius: 12, padding: "10px 12px" }}>
              <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Solde</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 3 }}>
                <p style={{ fontSize: 17, fontWeight: 500, color: solde >= 0 ? GN : RD, margin: 0 }}>{fmt(solde)}</p>
                <div style={{ paddingBottom: 1 }}>
                  <p style={{ fontSize: 10, color: GN, margin: 0 }}>▲ {fmt(totPaieMois + totArgentRecu + totRR)}</p>
                  <p style={{ fontSize: 10, color: RD, margin: 0 }}>▼ {fmt(totDep + totRec + totDettesMois + totProjetsMois)}</p>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setStatModal("projets")}><StatBox label="Versements projets" value={"-" + fmt(totProjetsMois)} color={RD} /></div>
          </div>
        </div>
      )}

      {/* Pay periods grid — always visible regardless of view mode */}
      {periodes.length > 0 && <div style={{ background: SF2, border: "1px solid " + BR2, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}><p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 10px" }}>Par paie</p><div style={{ overflowX: "auto" }}>{buildPaieGrid()}</div></div>}

      {/* Category expense bar chart — adapts to active view mode */}
      <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "4px 0 8px" }}>Dépenses par catégorie</p>
      {[...cats].sort((a, b) => (activeDb[b.id] || 0) - (activeDb[a.id] || 0)).map(c => { const a = activeDb[c.id] || 0; if (!a) return null; return <div key={c.id} onClick={() => setCatModal(c)} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, cursor: "pointer", borderRadius: 8, padding: "3px 4px", margin: "0 -4px 7px" }}><span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{c.icon}</span><span style={{ fontSize: 12, color: TX2, width: 88, flexShrink: 0 }}>{c.label}</span><div style={{ flex: 1, height: 6, background: BR, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: (a / activeMaxD * 100) + "%", background: AC, borderRadius: 3 }} /></div><span style={{ fontSize: 12, color: TX, width: 68, textAlign: "right", flexShrink: 0 }}>{fmt(a)}</span></div>; })}

      {catModal && (() => {
        // Filter transactions by pay period or by month depending on view mode
        const txsCat = [...txs].filter(x =>
          x.type === "depense" &&
          x.cat === catModal.id &&
          (viewMode === "paie" && curPeriode ? inPeriod(x) : x.date.startsWith(curMo))
        ).sort((a, b) => b.date.localeCompare(a.date));
        const total = txsCat.reduce((s, x) => s + x.amount, 0);
        const periodLabel = viewMode === "paie" ? "cette période" : "ce mois";
        return (
          <Modal title={catModal.icon + " " + catModal.label} onClose={() => setCatModal(null)}>
            <p style={{ fontSize: 12, color: TX3, margin: "0 0 12px" }}>{txsCat.length} transaction{txsCat.length !== 1 ? "s" : ""} {periodLabel}</p>
            {txsCat.length === 0 && <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucune dépense {periodLabel}.</p>}
            {txsCat.map(x => (
              <div key={x.id} style={trow}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: TX, margin: 0, fontWeight: 500 }}>{x.desc}</p>
                  <p style={{ fontSize: 11, color: TX3, margin: 0 }}>{fd(x.date)}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: RD, flexShrink: 0 }}>-{fmt(x.amount)}</span>
              </div>
            ))}
            {txsCat.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid " + BR, marginTop: 8, paddingTop: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: TX2 }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: RD }}>-{fmt(total)}</span>
              </div>
            )}
            <button onClick={() => setCatModal(null)} style={{ width: "100%", marginTop: 14, padding: "11px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Fermer</button>
          </Modal>
        );
      })()}

      {/* Stat modals — content filters adapt to view mode */}
      {statModal === "paie" && (
        viewMode === "paie" ? (() => {
          // Show current pay amount as a single item
          const items = curPeriode && curPeriode.mp > 0 ? [{
            key: curPeriode.deb,
            label: `Paie du ${fd(curPeriode.deb)}`,
            sub: `${fd(curPeriode.deb)} – ${curPeriode.fin ? fd(curPeriode.fin) : "?"}`,
            montant: curPeriode.mp,
            clr: GN,
            pfx: "+",
          }] : [];
          return <StatModal title="Paie actuelle" items={items} emptyMsg="Aucune paie saisie pour cette période." onClose={() => setStatModal(null)} trow={trow} />;
        })() : (() => {
          // Show proportional breakdown for the whole month
          const mStart = ymd(curY, curM, 1);
          const mEnd = ymd(curY, curM, ld(curY, curM));
          const breakdown = getPaieBreakdownForMonth(paie, mStart, mEnd, paieM);
          const items = breakdown.map(b => ({
            key: b.deb,
            label: b.ratio < 0.999 ? `Paie du ${fd(b.deb)} (${Math.round(b.ratio * 100)}%)` : `Paie du ${fd(b.deb)}`,
            sub: b.ratio < 0.999 ? `${fd(b.deb)} – ${fd(b.fin)} · Montant complet : ${fmt(b.fullAmount)}` : `${fd(b.deb)} – ${fd(b.fin)}`,
            montant: b.proportionalAmount,
            clr: GN,
            pfx: "+",
          }));
          return <StatModal title="Paies ce mois" items={items} emptyMsg="Aucune paie ce mois." onClose={() => setStatModal(null)} trow={trow} />;
        })()
      )}

      {statModal === "argentRecu" && <StatModal
        title={viewMode === "paie" ? "Argent reçu cette période" : "Argent reçu ce mois"}
        items={txs
          .filter(x => x.type === "revenu" && x.desc !== "Paie" && (viewMode === "paie" && curPeriode ? inPeriod(x) : x.date.startsWith(curMo)))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(x => ({ key: x.id, label: x.desc, sub: fd(x.date), montant: x.amount, clr: GN, pfx: "+" }))}
        emptyMsg={viewMode === "paie" ? "Aucun argent reçu cette période." : "Aucun argent reçu ce mois."}
        onClose={() => setStatModal(null)} trow={trow}
      />}

      {statModal === "depenses" && <StatModal
        title={viewMode === "paie" ? "Dépenses cette période" : "Dépenses ce mois"}
        items={txs
          .filter(x => x.type === "depense" && (viewMode === "paie" && curPeriode ? inPeriod(x) : x.date.startsWith(curMo)))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(x => ({ key: x.id, label: x.desc, sub: fd(x.date), montant: x.amount, clr: RD, pfx: "-", catId: x.cat }))}
        emptyMsg={viewMode === "paie" ? "Aucune dépense cette période." : "Aucune dépense ce mois."}
        onClose={() => setStatModal(null)} trow={trow} cats={cats}
      />}

      {statModal === "rrecs" && <StatModal
        title={viewMode === "paie" ? "Autres revenus cette période" : "Autres revenus"}
        items={(viewMode === "paie" && curPeriode ? rrecs.filter(recInPeriod) : rrecs.filter(r => (!r.dateFin || curMo < r.dateFin) && !(r.exclusions||[]).includes(curMo)))
          .flatMap(r => {
            // Weekly/biweekly: one row per occurrence in the period
            if ((r.frequence === "semaine" || r.frequence === "2semaines") && viewMode === "paie" && curPeriode) {
              const occs = getWeeklyOccurrencesInPeriod(r.frequence, r.jourSemaine, r.dateRef, curPeriode.deb, curPeriode.fin);
              return occs
                .filter(d => !(r.exclusions||[]).includes(d.slice(0,7)))
                .map((d, i) => ({ key: r.id + "_" + i, label: r.desc, sub: fd(d), montant: r.amount, clr: GN, pfx: "+" }));
            }
            return [{ key: r.id, label: r.desc, sub: recFreqLabel(r), montant: r.amount, clr: GN, pfx: "+" }];
          })}
        emptyMsg="Aucun autre revenu cette période." onClose={() => setStatModal(null)} trow={trow}
      />}
      {statModal === "recs" && <StatModal
        title={viewMode === "paie" ? "Paiements fixes cette période" : "Paiements fixes"}
        items={(viewMode === "paie" && curPeriode ? recs.filter(recInPeriod) : recs.filter(r => (!r.dateFin || curMo < r.dateFin) && !(r.exclusions||[]).includes(curMo)))
          .flatMap(r => {
            // Weekly/biweekly: one row per occurrence in the period
            if ((r.frequence === "semaine" || r.frequence === "2semaines") && viewMode === "paie" && curPeriode) {
              const occs = getWeeklyOccurrencesInPeriod(r.frequence, r.jourSemaine, r.dateRef, curPeriode.deb, curPeriode.fin);
              return occs
                .filter(d => !(r.exclusions||[]).includes(d.slice(0,7)))
                .map((d, i) => ({ key: r.id + "_" + i, label: r.desc, sub: fd(d), montant: r.amount, clr: RD, pfx: "-", catId: r.cat }));
            }
            return [{ key: r.id, label: r.desc, sub: recFreqLabel(r), montant: r.amount, clr: RD, pfx: "-", catId: r.cat }];
          })}
        emptyMsg="Aucun paiement fixe cette période." onClose={() => setStatModal(null)} trow={trow} cats={cats}
      />}

      {statModal === "dettes" && <StatModal
        title={viewMode === "paie" ? "Paiements dettes cette période" : "Paiements dettes ce mois"}
        items={dettes.flatMap(d => [
          ...(d.paiementsAuto || [])
            .filter(p => (!p.dateFin || curMo < p.dateFin) && !(p.exclusions||[]).includes(curMo) && (viewMode === "mois" || !curPeriode || autoPayInPeriod(p)))
            .flatMap(p => {
              // Weekly/biweekly: one row per occurrence in the period
              if ((p.frequence === "semaine" || p.frequence === "2semaines") && viewMode === "paie" && curPeriode) {
                const occs = getWeeklyOccurrencesInPeriod(p.frequence, p.jourSemaine, p.dateRef, curPeriode.deb, curPeriode.fin);
                return occs
                  .filter(o => !(p.exclusions||[]).includes(o.slice(0,7)))
                  .map((o, i) => ({ key: p.id + "_" + i, label: d.nom, sub: fd(o), montant: p.montant, clr: RD, pfx: "-" }));
              }
              return [{ key: p.id, label: d.nom, sub: p.jour === "paie" ? "À ma paie" : "Le " + p.jour + " (fixe)", montant: p.montant, clr: RD, pfx: "-" }];
            }),
          ...(d.paiements || [])
            .filter(p => viewMode === "paie" && curPeriode ? inPeriod(p) : p.date.startsWith(curMo))
            .map(p => ({ key: p.id, label: d.nom, sub: fd(p.date), montant: p.montant, clr: RD, pfx: "-" })),
        ])}
        emptyMsg="Aucun paiement cette période."
        onClose={() => setStatModal(null)} trow={trow}
      />}

      {statModal === "projets" && <StatModal
        title={viewMode === "paie" ? "Versements projets cette période" : "Versements projets ce mois"}
        items={projets.flatMap(p => [
          ...(p.paiementsAuto || [])
            .filter(v => (!v.dateFin || curMo <= v.dateFin) && !(v.exclusions||[]).includes(curMo) && (viewMode === "mois" || !curPeriode || autoPayInPeriod(v)))
            .flatMap(v => {
              // Weekly/biweekly: one row per occurrence in the period
              if ((v.frequence === "semaine" || v.frequence === "2semaines") && viewMode === "paie" && curPeriode) {
                const occs = getWeeklyOccurrencesInPeriod(v.frequence, v.jourSemaine, v.dateRef, curPeriode.deb, curPeriode.fin);
                return occs
                  .filter(o => !(v.exclusions||[]).includes(o.slice(0,7)))
                  .map((o, i) => ({ key: v.id + "_" + i, label: p.nom, sub: fd(o), montant: v.montant, clr: RD, pfx: "-" }));
              }
              return [{ key: v.id, label: p.nom, sub: v.jour === "paie" ? "À ma paie" : "Le " + v.jour + " (fixe)", montant: v.montant, clr: RD, pfx: "-" }];
            }),
          ...(p.versements || [])
            .filter(v => viewMode === "paie" && curPeriode ? inPeriod(v) : v.date.startsWith(curMo))
            .map(v => ({ key: v.id, label: p.nom, sub: fd(v.date), montant: v.montant, clr: RD, pfx: "-" })),
        ])}
        emptyMsg="Aucun versement cette période."
        onClose={() => setStatModal(null)} trow={trow}
      />}

      <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "12px 0 8px" }}>Dernieres transactions</p>
      <div style={{ marginBottom: 8 }}>
        {txs.length === 0 && <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucune transaction.</p>}
        {[...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(x => <TxRow key={x.id} x={x} cats={cats} trow={trow} ico={ico} startETx={startETx} />)}

      </div>
    </div>
  );
}
