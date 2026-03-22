import { useState } from "react";
import { JOURS_SEM, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD, GN } from "../constants.js";
import { fmt, addD, today } from "../utils/dates.js";
import Modal from "../components/Modal.jsx";
import DelBtn from "../components/DelBtn.jsx";
import SaveCancel from "../components/SaveCancel.jsx";

// All 7 days for the day-of-week picker
const ALL_JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DOW = { Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5, Samedi: 6, Dimanche: 0 };

// Computes the nearest anchor date for a 2-week rec (today or next occurrence of the given day)
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

const jourLabel = j => j === "paie" ? "Paie" : j === "fin" ? "Fin du mois" : "Le " + j;

// Reusable frequency + day-of-week picker block
function FreqPicker({ frm, setFrm, showJourMoisBtn, onOpenJourPicker, addType }) {
  const isWeekly = frm.frequence === "semaine" || frm.frequence === "2semaines";
  return (
    <>
      {/* Frequency selector */}
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

      {/* Monthly: jour du mois / paie (dépense) or jour number (revenu) */}
      {frm.frequence === "mois" && addType === "depense" && showJourMoisBtn && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button"
              style={{ flex: 1, padding: "7px 4px", background: frm.jour !== "paie" ? BT : SF, border: "1px solid " + (frm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: frm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }}
              onClick={() => { setFrm(f => ({ ...f, jour: typeof f.jour === "number" || f.jour === "fin" ? f.jour : 1 })); onOpenJourPicker(); }}
            >{frm.jour !== "paie" ? jourLabel(frm.jour) : "Jour du mois"}</button>
            <button type="button"
              style={{ flex: 1, padding: "7px 4px", background: frm.jour === "paie" ? BT : SF, border: "1px solid " + (frm.jour === "paie" ? BTB : BR), borderRadius: 8, color: frm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }}
              onClick={() => setFrm(f => ({ ...f, jour: "paie" }))}
            >Paie</button>
          </div>
        </div>
      )}

      {/* Monthly: jour number input (revenu) */}
      {frm.frequence === "mois" && addType === "revenu" && (
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour du mois</label>
          <input style={{ width: "100%", padding: "9px 10px", background: SF, border: "1px solid " + BR, borderRadius: 8, color: TX, fontSize: 13, boxSizing: "border-box" }}
            type="number" min="1" max="31" value={frm.jour}
            onChange={e => setFrm(f => ({ ...f, jour: +e.target.value }))}
          />
        </div>
      )}

      {/* Weekly / biweekly: day-of-week picker */}
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

export default function Recurrents({
  recs, rrecs, recFrm, rrFrm, eRecId, eRecMod, eRrId, eRrMod, addType, cats,
  eRecFrm, setERecFrm,
  updRecs, updRrecs, setRecFrm, setRrFrm, setERecId, setERecMod, setERrId, setERrMod,
  addRec, delRec, openERec, addRr, delRr, openERr, setAddType,
  totRec, totRR,
  inp, card, tbtn, bigBtn, CatSel,
}) {
  const [showJourPicker, setShowJourPicker] = useState(false);
  const [jourPickerTarget, setJourPickerTarget] = useState("add");
  const [addOpen, setAddOpen] = useState(false);

  const handleAddBtn = type => {
    if (addOpen && addType === type) { setAddOpen(false); }
    else { setAddType(type); setAddOpen(true); }
  };

  // Current add form (depense or revenu)
  const curFrm = addType === "depense" ? recFrm : rrFrm;
  const setCurFrm = addType === "depense" ? setRecFrm : setRrFrm;

  return (
    <div>
      {/* Edit modal — recurring expense */}
      {eRecMod && eRecId && (
        <Modal title="Modifier la charge">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} value={eRecFrm.desc} onChange={e => setERecFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={eRecFrm.amount} onChange={e => setERecFrm(f => ({ ...f, amount: e.target.value }))} /></div>
          <FreqPicker frm={eRecFrm} setFrm={setERecFrm} showJourMoisBtn addType="depense"
            onOpenJourPicker={() => { setJourPickerTarget("editRec"); setShowJourPicker(true); }}
          />
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label><CatSel value={eRecFrm.cat} onChange={v => setERecFrm(f => ({ ...f, cat: v }))} /></div>
          <SaveCancel onS={() => { addRec(); setERecMod(false); }} onC={() => { setERecId(null); setERecMod(false); }} />
          <DelBtn onClick={() => delRec(eRecId)} />
        </Modal>
      )}

      {/* Edit modal — other income */}
      {eRrMod && eRrId && (
        <Modal title="Modifier l'autre revenu">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} value={rrFrm.desc} onChange={e => setRrFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={rrFrm.amount} onChange={e => setRrFrm(f => ({ ...f, amount: e.target.value }))} /></div>
          <FreqPicker frm={rrFrm} setFrm={setRrFrm} showJourMoisBtn={false} addType="revenu"
            onOpenJourPicker={() => {}}
          />
          <SaveCancel onS={() => { addRr(); setERrMod(false); }} onC={() => { setERrId(null); setERrMod(false); }} />
          <DelBtn onClick={() => delRr(eRrId)} />
        </Modal>
      )}

      {/* Day-of-month picker modal */}
      {showJourPicker && (() => {
        const isEdit = jourPickerTarget === "editRec";
        const curJour = isEdit ? eRecFrm.jour : recFrm.jour;
        const setJour = j => isEdit ? setERecFrm(f => ({ ...f, jour: j })) : setRecFrm(f => ({ ...f, jour: j }));
        return (
          <Modal title="Choix de la journée">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(j => (
                <button key={j} type="button" onClick={() => { setJour(j); setShowJourPicker(false); }}
                  style={{ width: 46, height: 46, background: curJour === j ? BT : SF, border: "1px solid " + (curJour === j ? BTB : BR), borderRadius: 10, color: curJour === j ? BTT : TX, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{j}</button>
              ))}
              <button type="button" onClick={() => { setJour("fin"); setShowJourPicker(false); }}
                style={{ padding: "0 14px", height: 46, background: curJour === "fin" ? BT : SF, border: "1px solid " + (curJour === "fin" ? BTB : BR), borderRadius: 10, color: curJour === "fin" ? BTT : TX, fontSize: 12, cursor: "pointer" }}>Fin du mois</button>
            </div>
            <button type="button" onClick={() => setShowJourPicker(false)}
              style={{ width: "100%", padding: "11px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </Modal>
        );
      })()}

      {/* Add buttons — small, left-aligned, Dashboard colors */}
      <p style={{ fontSize: 12, fontWeight: 500, color: TX2, margin: "0 0 6px" }}>Ajouter</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button
          style={{ padding: "9px 18px", background: "var(--c-dep)", border: "1px solid var(--c-dep-b)", borderRadius: 10, color: "#FFFFFF", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          onClick={() => handleAddBtn("depense")}
        >Dépense</button>
        <button
          style={{ padding: "9px 18px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          onClick={() => handleAddBtn("revenu")}
        >Revenu</button>
      </div>

      {/* Add form */}
      {addOpen && (
        <div style={{ ...card, marginBottom: 14 }}>
          {/* Description */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label>
            <input autoFocus style={inp}
              placeholder={addType === "depense" ? "Ex: Loyer..." : "Ex: Allocations..."}
              value={curFrm.desc}
              onChange={e => setCurFrm(f => ({ ...f, desc: e.target.value }))}
            />
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label>
            <input style={inp} type="number" placeholder="0.00"
              value={curFrm.amount}
              onChange={e => setCurFrm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>

          {/* Frequency + day picker */}
          <FreqPicker
            frm={curFrm}
            setFrm={setCurFrm}
            showJourMoisBtn={addType === "depense"}
            addType={addType}
            onOpenJourPicker={() => { setJourPickerTarget("add"); setShowJourPicker(true); }}
          />

          {/* Category (depense only) */}
          {addType === "depense" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label>
              <CatSel value={recFrm.cat} onChange={v => setRecFrm(f => ({ ...f, cat: v }))} />
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              onClick={() => { addType === "depense" ? addRec() : addRr(); setAddOpen(false); }}>Ajouter</button>
            <button style={{ padding: "12px 16px", background: SF2, border: "1px solid " + BR, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }}
              onClick={() => setAddOpen(false)}>Annuler</button>
          </div>
        </div>
      )}

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Récurrents</p>

      {/* Summary */}
      <div style={{ background: SF2, border: "1px solid " + BR2, borderRadius: 12, padding: "11px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, textAlign: "center" }}><p style={{ fontSize: 11, color: TX3, margin: "0 0 3px" }}>Paiements fixes</p><p style={{ fontSize: 17, fontWeight: 500, color: RD, margin: 0 }}>-{fmt(totRec)}</p></div>
          <div style={{ width: 1, background: BR2 }} />
          <div style={{ flex: 1, textAlign: "center" }}><p style={{ fontSize: 11, color: TX3, margin: "0 0 3px" }}>Autres revenus</p><p style={{ fontSize: 17, fontWeight: 500, color: GN, margin: 0 }}>+{fmt(totRR)}</p></div>
        </div>
        <div style={{ borderTop: "0.5px solid " + BR2, marginTop: 10, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: TX2 }}>Bilan mensuel</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: (totRR - totRec) >= 0 ? GN : RD }}>{(totRR - totRec) >= 0 ? "+" : ""}{fmt(totRR - totRec)}</span>
        </div>
      </div>

      {/* Recs and rrecs list */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: RD, margin: "0 0 8px" }}>Dépenses</p>
          {recs.length === 0 && <p style={{ fontSize: 12, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucune</p>}
          {[...recs].sort((a, b) => (a.jour === "fin" ? 32 : a.jour) - (b.jour === "fin" ? 32 : b.jour)).map(r => {
            const c = cats.find(x => x.id === r.cat) || { icon: "📦", label: r.cat };
            const freqLabel = r.frequence === "semaine" ? "Chaque " + (r.jourSemaine || "") : r.frequence === "2semaines" ? "/ 2 sem. " + (r.jourSemaine || "") : r.jour === "paie" ? "Paie" : r.jour === "fin" ? "Fin du mois" : "Le " + r.jour;
            return (
              <div key={r.id} style={{ background: SF, border: "1px solid " + BR, borderRadius: 10, padding: "9px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</p>
                  <p style={{ fontSize: 10, color: TX3, margin: 0 }}>{freqLabel}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: RD }}>-{fmt(r.amount)}</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 12, padding: 0 }} onClick={() => openERec(r)}>✎</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: GN, margin: "0 0 8px" }}>Autres revenus</p>
          {rrecs.length === 0 && <p style={{ fontSize: 12, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucun</p>}
          {[...rrecs].sort((a, b) => a.jour - b.jour).map(r => {
            const freqLabel = r.frequence === "semaine" ? "Chaque " + (r.jourSemaine || "") : r.frequence === "2semaines" ? "/ 2 sem. " + (r.jourSemaine || "") : "Le " + r.jour;
            return (
              <div key={r.id} style={{ background: SF, border: "1px solid " + BR, borderRadius: 10, padding: "9px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>💰</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</p>
                  <p style={{ fontSize: 10, color: TX3, margin: 0 }}>{freqLabel}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: GN }}>+{fmt(r.amount)}</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 12, padding: 0 }} onClick={() => openERr(r)}>✎</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
