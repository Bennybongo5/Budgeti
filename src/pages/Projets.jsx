import { useState } from "react";
import { ICONS_PRJ, SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC } from "../constants.js";
import Modal from "../components/Modal.jsx";
import DelBtn from "../components/DelBtn.jsx";
import SaveCancel from "../components/SaveCancel.jsx";
import ProjetDetail from "../components/ProjetDetail.jsx";

const emptyP = { nom: "", objectif: "", icon: "🎯", paiementsAuto: [] };

export default function Projets({
  projets, prjSel, showAddPrj, prjFrm, ePrjMod, ePrjId,
  verType, verFrm, editVer, editVerFrm,
  updProjets, setPrjSel, setShowAddPrj, setPrjFrm,
  setEPrjMod, setEPrjId, addProjet, delProjet,
  addVer, delVer, delVerFixe, saveEditVer,
  setVerType, setVerFrm, setEditVer, setEditVerFrm,
  inp, card, trow, ico, bigBtn,
}) {
  const [showJourPicker, setShowJourPicker] = useState(false);
  const jourLabel = j => j === "paie" ? "Paie" : j === "fin" ? "Fin du mois" : "Le " + j;
  const gSoldeP = p => p.versements.reduce((s, v) => s + v.montant, 0);
  const gPctP = p => Math.min(100, Math.round(gSoldeP(p) / p.objectif * 100));
  const projet = projets.find(p => p.id === prjSel);

  return (
    <div>
      {ePrjMod && ePrjId && (
        <Modal title="Modifier le projet">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label><input style={inp} value={prjFrm.nom} onChange={e => setPrjFrm(f => ({ ...f, nom: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Icône</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{ICONS_PRJ.map(ic => <button key={ic} type="button" onClick={() => setPrjFrm(f => ({ ...f, icon: ic }))} style={{ fontSize: 18, padding: "5px 7px", background: prjFrm.icon === ic ? BT : SF, border: "1px solid " + (prjFrm.icon === ic ? BTB : BR), borderRadius: 7, cursor: "pointer" }}>{ic}</button>)}</div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Objectif (CAD)</label><input style={inp} type="number" value={prjFrm.objectif} onChange={e => setPrjFrm(f => ({ ...f, objectif: e.target.value }))} /></div>
          <SaveCancel onS={() => { updProjets(p => p.map(x => x.id === ePrjId ? { ...x, nom: prjFrm.nom, objectif: +prjFrm.objectif, icon: prjFrm.icon } : x)); setEPrjMod(false); setEPrjId(null); }} onC={() => { setEPrjMod(false); setEPrjId(null); }} />
          <DelBtn onClick={() => delProjet(ePrjId)} />
        </Modal>
      )}

      {editVer && (
        <Modal title="Modifier le versement">
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input style={inp} type="number" value={editVerFrm.montant} onChange={e => setEditVerFrm(f => ({ ...f, montant: e.target.value }))} /></div>
            {editVer.type === "fixe"
              ? <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label><div style={{ display: "flex", gap: 6 }}><button type="button" style={{ flex: 1, padding: "7px 4px", background: editVerFrm.jour !== "paie" ? BT : SF, border: "1px solid " + (editVerFrm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: editVerFrm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => { setEditVerFrm(f => ({ ...f, jour: f.jour === "paie" ? 1 : f.jour })); setShowJourPicker(true); }}>{editVerFrm.jour !== "paie" ? jourLabel(editVerFrm.jour) : "Jour du mois"}</button><button type="button" style={{ flex: 1, padding: "7px 4px", background: editVerFrm.jour === "paie" ? BT : SF, border: "1px solid " + (editVerFrm.jour === "paie" ? BTB : BR), borderRadius: 8, color: editVerFrm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => setEditVerFrm(f => ({ ...f, jour: "paie" }))}>Paie</button></div></div>
              : <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date</label><input style={inp} type="date" value={editVerFrm.date} onChange={e => setEditVerFrm(f => ({ ...f, date: e.target.value }))} /></div>}
          </div>
          {editVer.type === "fixe" && (
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date de début</label><input style={{ ...inp, width: "auto" }} type="month" value={editVerFrm.dateDebut || ""} onChange={e => setEditVerFrm(f => ({ ...f, dateDebut: e.target.value }))} /></div>
          )}
          <SaveCancel onS={saveEditVer} onC={() => setEditVer(null)} />
          {editVer.type === "fixe"
            ? <DelBtn onClick={() => { delVerFixe(prjSel, editVer.id); setEditVer(null); }} />
            : <DelBtn onClick={() => { delVer(prjSel, editVer.id); setEditVer(null); }} />}
        </Modal>
      )}

      {showJourPicker && (
        <Modal title="Choix de la journée">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map(j => (
              <button key={j} type="button" onClick={() => { setEditVerFrm(f => ({ ...f, jour: j })); setShowJourPicker(false); }} style={{ width: 46, height: 46, background: +editVerFrm.jour === j ? BT : SF, border: "1px solid " + (+editVerFrm.jour === j ? BTB : BR), borderRadius: 10, color: +editVerFrm.jour === j ? BTT : TX, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{j}</button>
            ))}
            <button type="button" onClick={() => { setEditVerFrm(f => ({ ...f, jour: "fin" })); setShowJourPicker(false); }} style={{ padding: "0 14px", height: 46, background: editVerFrm.jour === "fin" ? BT : SF, border: "1px solid " + (editVerFrm.jour === "fin" ? BTB : BR), borderRadius: 10, color: editVerFrm.jour === "fin" ? BTT : TX, fontSize: 12, cursor: "pointer" }}>Fin du mois</button>
          </div>
          <button type="button" onClick={() => setShowJourPicker(false)} style={{ width: "100%", padding: "11px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }}>Annuler</button>
        </Modal>
      )}

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Projets d'épargne</p>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
        {projets.map(p => {
          const pct = gPctP(p);
          const sel = prjSel === p.id;
          return (
            <div key={p.id} onClick={() => setPrjSel(p.id)} style={{ flexShrink: 0, background: sel ? BT : SF, border: "1px solid " + (sel ? BTB : BR), borderRadius: 12, padding: "10px 14px", cursor: "pointer", minWidth: 130 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 18 }}>{p.icon}</span><p style={{ fontSize: 12, fontWeight: 500, color: sel ? BTT : TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 85 }}>{p.nom}</p></div>
              <p style={{ fontSize: 11, color: sel ? BTT : "#4a7a4a", margin: "0 0 2px", fontWeight: 500 }}>{gSoldeP(p).toLocaleString("fr-CA", { style: "currency", currency: "CAD" })} / {p.objectif.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}</p>
              <div style={{ height: 4, background: sel ? "#8ab87a55" : BR, borderRadius: 2 }}><div style={{ height: "100%", width: pct + "%", background: sel ? BTT : AC, borderRadius: 2 }} /></div>
              <p style={{ fontSize: 10, color: sel ? BTT : TX3, margin: "3px 0 0" }}>{pct}% atteint</p>
            </div>
          );
        })}
        <div onClick={() => setShowAddPrj(true)} style={{ flexShrink: 0, background: SF2, border: "1px dashed " + BR2, borderRadius: 12, padding: "10px 14px", cursor: "pointer", minWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ fontSize: 22, color: TX3, lineHeight: 1 }}>+</span>
          <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Nouveau projet</p>
        </div>
      </div>

      {showAddPrj && (
        <div style={{ ...card, border: "1px solid " + BTB }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: TX2, marginBottom: 10, marginTop: 0 }}>Nouveau projet</p>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label><input style={inp} placeholder="Ex: Vacances..." value={prjFrm.nom} onChange={e => setPrjFrm(f => ({ ...f, nom: e.target.value }))} /></div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: TX2, marginBottom: 6, display: "block" }}>Icône</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{ICONS_PRJ.map(ic => <button key={ic} type="button" onClick={() => setPrjFrm(f => ({ ...f, icon: ic }))} style={{ fontSize: 18, padding: "5px 7px", background: prjFrm.icon === ic ? BT : SF, border: "1px solid " + (prjFrm.icon === ic ? BTB : BR), borderRadius: 7, cursor: "pointer" }}>{ic}</button>)}</div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Objectif (CAD)</label><input style={inp} type="number" placeholder="0.00" value={prjFrm.objectif} onChange={e => setPrjFrm(f => ({ ...f, objectif: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={addProjet}>Créer</button>
            <button style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => { setShowAddPrj(false); setPrjFrm(emptyP); }}>Annuler</button>
          </div>
        </div>
      )}

      {projet && (
        <ProjetDetail
          projet={projet} gSoldeP={gSoldeP} gPctP={gPctP}
          setEPrjId={setEPrjId} setPrjFrm={setPrjFrm} setEPrjMod={setEPrjMod}
          verFrm={verFrm} setVerFrm={setVerFrm} verType={verType} setVerType={setVerType}
          addVer={addVer} setEditVer={setEditVer} setEditVerFrm={setEditVerFrm}
          inp={inp} card={card} trow={trow} ico={ico}
        />
      )}

      {projets.length === 0 && !showAddPrj && (
        <div style={{ textAlign: "center", color: TX3, padding: "40px 20px", fontSize: 13 }}>
          <p style={{ margin: "0 0 12px" }}>Aucun projet créé.</p>
          <button style={bigBtn()} onClick={() => setShowAddPrj(true)}>Créer un projet</button>
        </div>
      )}
    </div>
  );
}
