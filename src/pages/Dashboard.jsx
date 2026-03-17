import { useState } from "react";
import { FREQS, JOURS_SEM, JOURS_MOIS, PAR_PAIE_ROWS, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD, GN } from "../constants.js";
import { today, fmt, fd, ymd, ld } from "../utils/dates.js";
import Modal from "../components/Modal.jsx";
import SaveCancel from "../components/SaveCancel.jsx";
import StatBox from "../components/StatBox.jsx";
import TxRow from "../components/TxRow.jsx";
import SemaineRef from "../components/SemaineRef.jsx";

export default function Dashboard({
  paie, paieOpen, paieM, paieIdx, txs, cats, periodes, paies,
  totRev, totDep, totRR, totRec, totDettesMois, totProjetsMois, solde, dbc, maxD,
  setPaieOpen, updPaie, updPaieM, updTxs, setPaieIdx, setTxForm, setShowTx, navigate, startETx,
  inp, inpSm, card, trow, ico, fbtn,
}) {
  const t = today();
  const [paieInput, setPaieInput] = useState("");

  const buildPaieGrid = () => {
    const cols = "100px " + periodes.map(() => "minmax(80px, 1fr)").join(" ");
    const hdr = [<div key="h0" />, ...periodes.map((p, i) => (
      <div key={"h" + i} style={{ textAlign: "center", background: p.isCur ? BT : p.isPast ? SF2 : BR, border: "1px solid " + (p.isCur ? BTB : BR2), borderRadius: 8, padding: "4px 3px" }}>
        <p style={{ fontSize: 9, fontWeight: 500, color: p.isCur ? BTT : TX3, margin: "0 0 1px" }}>{p.isPast ? "Passee" : p.isCur ? "En cours" : "Prochaine"}</p>
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
    const rl = <span key="rl" style={{ fontSize: 11, fontWeight: 500, color: TX, whiteSpace: "nowrap" }}>Reste libre</span>;
    const rv = periodes.map((p, i) => (
      <div key={"rv" + i} style={{ textAlign: "center", background: !p.hasPaie ? SF : p.reste >= 0 ? BT : "#ffd5d0", border: "1px solid " + (!p.hasPaie ? BR : p.reste >= 0 ? BTB : "#e08070"), borderRadius: 8, padding: "4px 3px" }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: !p.hasPaie ? TX3 : p.reste >= 0 ? BTT : RD, margin: 0 }}>{p.hasPaie ? fmt(p.reste) : "—"}</p>
      </div>
    ));
    return <div style={{ display: "grid", gridTemplateColumns: cols, gap: "5px 6px", alignItems: "center", minWidth: 320 }}>{hdr}{rows}{sep}{rl}{rv}</div>;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button style={{ flex: 1, padding: "14px 8px", background: "#f5d5d0", border: "1px solid #d4877a", borderRadius: 12, color: "#7a2a1a", fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { setTxForm(f => ({ ...f, type: "depense", desc: "", amount: "", date: today() })); setShowTx(true); }}>+ Depense</button>
        <button style={{ flex: 1, padding: "14px 8px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { setTxForm(f => ({ ...f, type: "revenu", desc: "", amount: "", date: today() })); setShowTx(true); }}>+ Revenu</button>
      </div>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: TX2 }}>Frequence :</span>
          <div style={{ background: BT, border: "1px solid " + BTB, borderRadius: 20, padding: "4px 12px" }}><span style={{ fontSize: 12, fontWeight: 500, color: BTT }}>{FREQS.find(f => f.id === paie.frequence)?.label}</span></div>
          <button onClick={() => setPaieOpen(o => !o)} style={{ marginLeft: "auto", background: paieOpen ? SF2 : "none", border: "1px solid " + (paieOpen ? BR2 : BR), borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: TX2 }}>{paieOpen ? "Fermer" : "Modifier"}</button>
        </div>
        {paieOpen && (
          <div style={{ background: SF2, border: "1px solid " + BR, borderRadius: 10, padding: "12px", marginTop: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Frequence</label>
              <div style={{ display: "flex", gap: 6 }}>{FREQS.map(f => <button key={f.id} style={fbtn(paie.frequence === f.id)} onClick={() => updPaie(p => ({ ...p, frequence: f.id }))}>{f.label}</button>)}</div>
            </div>
            {paie.frequence === "semaine" && <div><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour de paie</label><div style={{ display: "flex", gap: 6 }}>{JOURS_SEM.map(j => <button key={j} style={{ ...fbtn(paie.jourSemaine === j), flex: "none", padding: "7px 10px" }} onClick={() => updPaie(p => ({ ...p, jourSemaine: j }))}>{j.slice(0, 3)}</button>)}</div></div>}
            {paie.frequence === "2semaines" && <SemaineRef t={t} paie={paie} updPaie={updPaie} fbtn={fbtn} />}
            {paie.frequence === "mois" && <div><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour du mois</label><select style={inpSm} value={paie.jour1} onChange={e => updPaie(p => ({ ...p, jour1: e.target.value === "fin" ? "fin" : +e.target.value }))}>{JOURS_MOIS.map(j => <option key={j} value={j}>{j === "fin" ? "Dernier jour" : "Le " + j}</option>)}</select></div>}
            {paie.frequence === "2mois" && <div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>1re paie</label><select style={inpSm} value={paie.jour1} onChange={e => updPaie(p => ({ ...p, jour1: e.target.value === "fin" ? "fin" : +e.target.value }))}>{JOURS_MOIS.map(j => <option key={j} value={j}>{j === "fin" ? "Dernier jour" : "Le " + j}</option>)}</select></div><div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>2e paie</label><select style={inpSm} value={paie.jour2} onChange={e => updPaie(p => ({ ...p, jour2: e.target.value === "fin" ? "fin" : +e.target.value }))}>{JOURS_MOIS.map(j => <option key={j} value={j}>{j === "fin" ? "Dernier jour" : "Le " + j}</option>)}</select></div></div>}
          </div>
        )}
        {paies.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: TX2, margin: "12px 0 7px" }}>Paies</p>
            {paieIdx !== null && (
              <Modal title={"Paie du " + fd(paies[paieIdx])}>
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
                      <p style={{ fontSize: 9, color: p?.isCur ? BTT : TX3, margin: "0 0 1px", fontWeight: 500 }}>{p?.isPast ? "Passee" : p?.isCur ? "En cours" : "Prochaine"}</p>
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

      <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 8px" }}>Vue mensuelle</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}><StatBox label="Revenus" value={fmt(totRev)} color={GN} /><StatBox label="Depenses" value={fmt(totDep)} color={RD} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}><StatBox label="Rev. recurrents" value={"+" + fmt(totRR)} color={GN} /><StatBox label="Paiements fixes" value={"-" + fmt(totRec)} color={RD} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}><StatBox label="Paiements dettes" value={"-" + fmt(totDettesMois)} color={RD} /><StatBox label="Versements projets" value={"-" + fmt(totProjetsMois)} color={RD} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}><StatBox label="Solde" value={fmt(solde)} color={solde >= 0 ? "#5a7a3a" : RD} /></div>
      {periodes.length > 0 && <div style={{ background: SF2, border: "1px solid " + BR2, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}><p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 10px" }}>Par paie</p><div style={{ overflowX: "auto" }}>{buildPaieGrid()}</div></div>}

      <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "4px 0 8px" }}>Depenses par categorie</p>
      {cats.map(c => { const a = dbc[c.id] || 0; if (!a) return null; return <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}><span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{c.icon}</span><span style={{ fontSize: 12, color: TX2, width: 88, flexShrink: 0 }}>{c.label}</span><div style={{ flex: 1, height: 6, background: BR, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: (a / maxD * 100) + "%", background: AC, borderRadius: 3 }} /></div><span style={{ fontSize: 12, color: TX, width: 68, textAlign: "right", flexShrink: 0 }}>{fmt(a)}</span></div>; })}

      <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "12px 0 8px" }}>Dernieres transactions</p>
      <div style={{ marginBottom: 8 }}>
        {txs.length === 0 && <p style={{ fontSize: 13, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucune transaction.</p>}
        {[...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(x => <TxRow key={x.id} x={x} cats={cats} trow={trow} ico={ico} startETx={startETx} />)}
        {txs.length > 5 && <button onClick={() => navigate("historique")} style={{ width: "100%", marginTop: 8, padding: "9px", background: "none", border: "1px solid " + BR2, borderRadius: 10, color: TX3, fontSize: 12, cursor: "pointer" }}>Voir tout l historique</button>}
      </div>
    </div>
  );
}
