import { useState } from "react";
import { SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD, GN } from "../constants.js";
import { fmt } from "../utils/dates.js";
import Modal from "../components/Modal.jsx";
import DelBtn from "../components/DelBtn.jsx";
import SaveCancel from "../components/SaveCancel.jsx";

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
  const jourLabel = j => j === "paie" ? "Paie" : j === "fin" ? "Fin du mois" : "Le " + j;

  // Toggle add form for a given type
  const handleAddBtn = type => {
    if (addOpen && addType === type) {
      setAddOpen(false);
    } else {
      setAddType(type);
      setAddOpen(true);
    }
  };

  return (
    <div>
      {/* Edit modals */}
      {eRecMod && eRecId && (
        <Modal title="Modifier la charge">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} value={eRecFrm.desc} onChange={e => setERecFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={eRecFrm.amount} onChange={e => setERecFrm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" style={{ flex: 1, padding: "7px 4px", background: eRecFrm.jour !== "paie" ? BT : SF, border: "1px solid " + (eRecFrm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: eRecFrm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => { setERecFrm(f => ({ ...f, jour: typeof f.jour === "number" || f.jour === "fin" ? f.jour : 1 })); setJourPickerTarget("edit"); setShowJourPicker(true); }}>{eRecFrm.jour !== "paie" ? jourLabel(eRecFrm.jour) : "Jour du mois"}</button>
              <button type="button" style={{ flex: 1, padding: "7px 4px", background: eRecFrm.jour === "paie" ? BT : SF, border: "1px solid " + (eRecFrm.jour === "paie" ? BTB : BR), borderRadius: 8, color: eRecFrm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => setERecFrm(f => ({ ...f, jour: "paie" }))}>Paie</button>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label><CatSel value={eRecFrm.cat} onChange={v => setERecFrm(f => ({ ...f, cat: v }))} /></div>
          <SaveCancel onS={() => { addRec(); setERecMod(false); }} onC={() => { setERecId(null); setERecMod(false); }} />
          <DelBtn onClick={() => delRec(eRecId)} />
        </Modal>
      )}

      {eRrMod && eRrId && (
        <Modal title="Modifier l'autre revenu">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} value={rrFrm.desc} onChange={e => setRrFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={rrFrm.amount} onChange={e => setRrFrm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour</label><input style={inp} type="number" min="1" max="31" value={rrFrm.jour} onChange={e => setRrFrm(f => ({ ...f, jour: +e.target.value }))} /></div>
          </div>
          <SaveCancel onS={() => { addRr(); setERrMod(false); }} onC={() => { setERrId(null); setERrMod(false); }} />
          <DelBtn onClick={() => delRr(eRrId)} />
        </Modal>
      )}

      {showJourPicker && (() => {
        const curJour = jourPickerTarget === "edit" ? eRecFrm.jour : recFrm.jour;
        const setJour = j => jourPickerTarget === "edit" ? setERecFrm(f => ({ ...f, jour: j })) : setRecFrm(f => ({ ...f, jour: j }));
        return (
          <Modal title="Choix de la journée">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(j => (
                <button key={j} type="button" onClick={() => { setJour(j); setShowJourPicker(false); }} style={{ width: 46, height: 46, background: curJour === j ? BT : SF, border: "1px solid " + (curJour === j ? BTB : BR), borderRadius: 10, color: curJour === j ? BTT : TX, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{j}</button>
              ))}
              <button type="button" onClick={() => { setJour("fin"); setShowJourPicker(false); }} style={{ padding: "0 14px", height: 46, background: curJour === "fin" ? BT : SF, border: "1px solid " + (curJour === "fin" ? BTB : BR), borderRadius: 10, color: curJour === "fin" ? BTT : TX, fontSize: 12, cursor: "pointer" }}>Fin du mois</button>
            </div>
            <button type="button" onClick={() => setShowJourPicker(false)} style={{ width: "100%", padding: "11px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </Modal>
        );
      })()}

      {/* Colored add buttons — always at the top */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          style={{ flex: 1, padding: "14px 8px", background: addOpen && addType === "depense" ? "var(--c-dep)" : "var(--c-rd-light)", border: "1px solid var(--c-dep-b)", borderRadius: 12, color: addOpen && addType === "depense" ? "#FFFFFF" : "var(--c-dep-b)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          onClick={() => handleAddBtn("depense")}
        >+ Dépense</button>
        <button
          style={{ flex: 1, padding: "14px 8px", background: addOpen && addType === "revenu" ? BT : "var(--c-bt-light)", border: "1px solid " + BTB, borderRadius: 12, color: addOpen && addType === "revenu" ? BTT : BT, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          onClick={() => handleAddBtn("revenu")}
        >+ Revenu</button>
      </div>

      {/* Add form — appears right below the buttons when open */}
      {addOpen && (
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input autoFocus style={inp} placeholder={addType === "depense" ? "Ex: Loyer..." : "Ex: Allocations..."} value={addType === "depense" ? recFrm.desc : rrFrm.desc} onChange={e => addType === "depense" ? setRecFrm(f => ({ ...f, desc: e.target.value })) : setRrFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input style={inp} type="number" placeholder="0.00" value={addType === "depense" ? recFrm.amount : rrFrm.amount} onChange={e => addType === "depense" ? setRecFrm(f => ({ ...f, amount: e.target.value })) : setRrFrm(f => ({ ...f, amount: e.target.value }))} /></div>
            {addType === "revenu" && <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour du mois</label><input style={inp} type="number" min="1" max="31" value={rrFrm.jour} onChange={e => setRrFrm(f => ({ ...f, jour: +e.target.value }))} /></div>}
          </div>
          {addType === "depense" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" style={{ flex: 1, padding: "7px 4px", background: recFrm.jour !== "paie" ? BT : SF, border: "1px solid " + (recFrm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: recFrm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => { setRecFrm(f => ({ ...f, jour: typeof f.jour === "number" || f.jour === "fin" ? f.jour : 1 })); setJourPickerTarget("add"); setShowJourPicker(true); }}>{recFrm.jour !== "paie" ? jourLabel(recFrm.jour) : "Jour du mois"}</button>
                <button type="button" style={{ flex: 1, padding: "7px 4px", background: recFrm.jour === "paie" ? BT : SF, border: "1px solid " + (recFrm.jour === "paie" ? BTB : BR), borderRadius: 8, color: recFrm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => setRecFrm(f => ({ ...f, jour: "paie" }))}>Paie</button>
              </div>
            </div>
          )}
          {addType === "depense" && <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Catégorie</label><CatSel value={recFrm.cat} onChange={v => setRecFrm(f => ({ ...f, cat: v }))} /></div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={() => { addType === "depense" ? addRec() : addRr(); setAddOpen(false); }}>Ajouter</button>
            <button style={{ padding: "12px 16px", background: SF2, border: "1px solid " + BR, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => setAddOpen(false)}>Annuler</button>
          </div>
        </div>
      )}

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Récurrents</p>

      {/* Summary card */}
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

      {/* Recs and rrecs grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: RD, margin: "0 0 8px" }}>Dépenses</p>
          {recs.length === 0 && <p style={{ fontSize: 12, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucune</p>}
          {[...recs].sort((a, b) => (a.jour === "fin" ? 32 : a.jour) - (b.jour === "fin" ? 32 : b.jour)).map(r => {
            const c = cats.find(x => x.id === r.cat) || { icon: "📦", label: r.cat };
            return (
              <div key={r.id} style={{ background: SF, border: "1px solid " + BR, borderRadius: 10, padding: "9px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</p>
                  <p style={{ fontSize: 10, color: TX3, margin: 0 }}>{r.jour === "paie" ? "Paie" : r.jour === "fin" ? "Fin du mois" : "Le " + r.jour}</p>
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
          {[...rrecs].sort((a, b) => a.jour - b.jour).map(r => (
            <div key={r.id} style={{ background: SF, border: "1px solid " + BR, borderRadius: 10, padding: "9px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💰</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</p>
                <p style={{ fontSize: 10, color: TX3, margin: 0 }}>Le {r.jour}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: GN }}>+{fmt(r.amount)}</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 12, padding: 0 }} onClick={() => openERr(r)}>✎</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
