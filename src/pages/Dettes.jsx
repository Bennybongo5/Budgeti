import { useState } from "react";
import { SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD, GN } from "../constants.js";
import { today, fmt } from "../utils/dates.js";
import MonthPicker from "../components/MonthPicker.jsx";
import Modal from "../components/Modal.jsx";
import DelBtn from "../components/DelBtn.jsx";
import SaveCancel from "../components/SaveCancel.jsx";

const emptyD = { nom: "", montantInitial: "", tauxInteret: "", paiementsAuto: [] };

export default function Dettes({
  dettes, detSel, showAddDet, detFrm, eDetMod, eDetId,
  paiType, paiFrm, editPai, editPaiFrm,
  updDettes, setDetSel, setShowAddDet, setDetFrm,
  setEDetMod, setEDetId, addDette, delDette,
  addPai, delPai, delPaiFixe, saveEditPai,
  setPaiType, setPaiFrm, setEditPai, setEditPaiFrm,
  inp, card, trow, ico, bigBtn,
}) {
  const [showJourPicker, setShowJourPicker] = useState(false);
  const [jourPickerTarget, setJourPickerTarget] = useState("add");
  const jourLabel = j => j === "paie" ? "Paie" : j === "fin" ? "Fin du mois" : "Le " + j;
  const gSolde = d => Math.max(0, d.montantInitial - d.paiements.reduce((s, p) => s + p.montant, 0));
  const gPct = d => Math.min(100, Math.round(d.paiements.reduce((s, p) => s + p.montant, 0) / d.montantInitial * 100));
  const dette = dettes.find(d => d.id === detSel);

  return (
    <div>
      {eDetMod && eDetId && (
        <Modal title="Modifier la dette">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label><input style={inp} value={detFrm.nom} onChange={e => setDetFrm(f => ({ ...f, nom: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant initial</label><input style={inp} type="number" value={detFrm.montantInitial} onChange={e => setDetFrm(f => ({ ...f, montantInitial: e.target.value }))} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Taux (%)</label><input style={inp} type="number" value={detFrm.tauxInteret} onChange={e => setDetFrm(f => ({ ...f, tauxInteret: e.target.value }))} /></div>
          </div>
          <SaveCancel onS={() => { updDettes(p => p.map(d => d.id === eDetId ? { ...d, nom: detFrm.nom, montantInitial: +detFrm.montantInitial, tauxInteret: +detFrm.tauxInteret || 0 } : d)); setEDetMod(false); }} onC={() => setEDetMod(false)} />
          <DelBtn onClick={() => delDette(eDetId)} />
        </Modal>
      )}

      {editPai && (
        <Modal title="Modifier le paiement">
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input style={inp} type="number" value={editPaiFrm.montant} onChange={e => setEditPaiFrm(f => ({ ...f, montant: e.target.value }))} /></div>
            {editPai.type === "fixe"
              ? <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label><div style={{ display: "flex", gap: 6 }}><button type="button" style={{ flex: 1, padding: "7px 4px", background: editPaiFrm.jour !== "paie" ? BT : SF, border: "1px solid " + (editPaiFrm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: editPaiFrm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => { setEditPaiFrm(f => ({ ...f, jour: f.jour === "paie" ? 1 : f.jour })); setJourPickerTarget("edit"); setShowJourPicker(true); }}>{editPaiFrm.jour !== "paie" ? jourLabel(editPaiFrm.jour) : "Jour du mois"}</button><button type="button" style={{ flex: 1, padding: "7px 4px", background: editPaiFrm.jour === "paie" ? BT : SF, border: "1px solid " + (editPaiFrm.jour === "paie" ? BTB : BR), borderRadius: 8, color: editPaiFrm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => setEditPaiFrm(f => ({ ...f, jour: "paie" }))}>Paie</button></div></div>
              : <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date</label><input style={inp} type="date" value={editPaiFrm.date} onChange={e => setEditPaiFrm(f => ({ ...f, date: e.target.value }))} /></div>}
          </div>
          {editPai.type === "fixe" && (
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date de début</label><MonthPicker value={editPaiFrm.dateDebut || ""} onChange={v => setEditPaiFrm(f => ({ ...f, dateDebut: v }))} /></div>
          )}
          <SaveCancel onS={saveEditPai} onC={() => setEditPai(null)} />
          {editPai.type === "fixe"
            ? <DelBtn onClick={() => { delPaiFixe(detSel, editPai.id); setEditPai(null); }} />
            : <DelBtn onClick={() => { delPai(detSel, editPai.id); setEditPai(null); }} />}
        </Modal>
      )}

      {showJourPicker && (() => {
        const curJour = jourPickerTarget === "edit" ? editPaiFrm.jour : paiFrm.jour;
        const setJour = j => jourPickerTarget === "edit" ? setEditPaiFrm(f => ({ ...f, jour: j })) : setPaiFrm(f => ({ ...f, jour: j }));
        return (
          <Modal title="Choix de la journée" zIndex={200}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(j => (
                <button key={j} type="button" onClick={() => { setJour(j); setShowJourPicker(false); }} style={{ width: 46, height: 46, background: +curJour === j ? BT : SF, border: "1px solid " + (+curJour === j ? BTB : BR), borderRadius: 10, color: +curJour === j ? BTT : TX, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{j}</button>
              ))}
              <button type="button" onClick={() => { setJour("fin"); setShowJourPicker(false); }} style={{ padding: "0 14px", height: 46, background: curJour === "fin" ? BT : SF, border: "1px solid " + (curJour === "fin" ? BTB : BR), borderRadius: 10, color: curJour === "fin" ? BTT : TX, fontSize: 12, cursor: "pointer" }}>Fin du mois</button>
            </div>
            <button type="button" onClick={() => setShowJourPicker(false)} style={{ width: "100%", padding: "11px", background: SF2, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }}>Annuler</button>
          </Modal>
        );
      })()}

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Dettes</p>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
        {dettes.map(d => (
          <div key={d.id} onClick={() => setDetSel(d.id)} style={{ flexShrink: 0, background: detSel === d.id ? BT : SF, border: "1px solid " + (detSel === d.id ? BTB : BR), borderRadius: 12, padding: "10px 14px", cursor: "pointer", minWidth: 120 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: detSel === d.id ? BTT : TX, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{d.nom}</p>
            <p style={{ fontSize: 11, color: detSel === d.id ? BTT : RD, margin: 0 }}>{fmt(gSolde(d))}</p>
            <div style={{ marginTop: 5, height: 4, background: detSel === d.id ? "#8ab87a55" : BR, borderRadius: 2 }}><div style={{ height: "100%", width: gPct(d) + "%", background: detSel === d.id ? BTT : AC, borderRadius: 2 }} /></div>
            <p style={{ fontSize: 10, color: detSel === d.id ? BTT : TX3, margin: "3px 0 0" }}>{gPct(d)}% remboursé</p>
          </div>
        ))}
        <div onClick={() => setShowAddDet(true)} style={{ flexShrink: 0, background: SF2, border: "1px dashed " + BR2, borderRadius: 12, padding: "10px 14px", cursor: "pointer", minWidth: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <span style={{ fontSize: 22, color: TX3, lineHeight: 1 }}>+</span>
          <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Nouvelle dette</p>
        </div>
      </div>

      {showAddDet && (
        <div style={{ ...card, border: "1px solid " + BTB }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: TX2, marginBottom: 10, marginTop: 0 }}>Nouvelle dette</p>
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Nom</label><input style={inp} placeholder="Ex: Voiture..." value={detFrm.nom} onChange={e => setDetFrm(f => ({ ...f, nom: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant total (CAD)</label><input style={inp} type="number" placeholder="0.00" value={detFrm.montantInitial} onChange={e => setDetFrm(f => ({ ...f, montantInitial: e.target.value }))} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Taux (%)</label><input style={inp} type="number" placeholder="0" value={detFrm.tauxInteret} onChange={e => setDetFrm(f => ({ ...f, tauxInteret: e.target.value }))} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }} onClick={addDette}>Créer</button>
            <button style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }} onClick={() => { setShowAddDet(false); setDetFrm(emptyD); }}>Annuler</button>
          </div>
        </div>
      )}

      {dette && (
        <div>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: TX, margin: 0 }}>{dette.nom}</p>
              <button onClick={() => { setEDetId(dette.id); setDetFrm({ nom: dette.nom, montantInitial: dette.montantInitial, tauxInteret: dette.tauxInteret }); setEDetMod(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: 4 }}>✎</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, background: SF2, borderRadius: 10, padding: "8px 10px" }}><p style={{ fontSize: 11, color: TX3, margin: 0 }}>Solde restant</p><p style={{ fontSize: 15, fontWeight: 500, color: RD, margin: "2px 0 0" }}>{fmt(gSolde(dette))}</p></div>
              <div style={{ flex: 1, background: SF2, borderRadius: 10, padding: "8px 10px" }}><p style={{ fontSize: 11, color: TX3, margin: 0 }}>Total payé</p><p style={{ fontSize: 15, fontWeight: 500, color: GN, margin: "2px 0 0" }}>{fmt(dette.paiements.reduce((s, p) => s + p.montant, 0))}</p></div>
              <div style={{ flex: 1, background: SF2, borderRadius: 10, padding: "8px 10px" }}><p style={{ fontSize: 11, color: TX3, margin: 0 }}>Progression</p><p style={{ fontSize: 15, fontWeight: 500, color: AC, margin: "2px 0 0" }}>{gPct(dette)}%</p></div>
            </div>
            <div style={{ height: 8, background: BR, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: gPct(dette) + "%", background: AC, borderRadius: 4 }} /></div>
            {dette.tauxInteret > 0 && <p style={{ fontSize: 11, color: TX3, margin: "6px 0 0" }}>Taux : {dette.tauxInteret}%</p>}
          </div>

          {paiType && (
            <Modal title={paiType === "fixe" ? "Paiement mensuel" : "Paiement unique"}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input autoFocus style={inp} type="number" placeholder="0.00" value={paiFrm.montant} onChange={e => setPaiFrm(f => ({ ...f, montant: e.target.value }))} /></div>
                {paiType === "fixe"
                  ? <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Quand</label><div style={{ display: "flex", gap: 6 }}><button type="button" style={{ flex: 1, padding: "7px 4px", background: paiFrm.jour !== "paie" ? BT : SF, border: "1px solid " + (paiFrm.jour !== "paie" ? BTB : BR), borderRadius: 8, color: paiFrm.jour !== "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => { setPaiFrm(f => ({ ...f, jour: f.jour === "paie" ? 1 : f.jour })); setJourPickerTarget("add"); setShowJourPicker(true); }}>{paiFrm.jour !== "paie" ? jourLabel(paiFrm.jour) : "Jour du mois"}</button><button type="button" style={{ flex: 1, padding: "7px 4px", background: paiFrm.jour === "paie" ? BT : SF, border: "1px solid " + (paiFrm.jour === "paie" ? BTB : BR), borderRadius: 8, color: paiFrm.jour === "paie" ? BTT : TX2, fontSize: 11, cursor: "pointer" }} onClick={() => setPaiFrm(f => ({ ...f, jour: "paie" }))}>Paie</button></div></div>
                  : <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date</label><input style={inp} type="date" value={paiFrm.date} onChange={e => setPaiFrm(f => ({ ...f, date: e.target.value }))} /></div>}
              </div>
              {paiType === "fixe" && (
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date de début</label><MonthPicker value={paiFrm.dateDebut || ""} onChange={v => setPaiFrm(f => ({ ...f, dateDebut: v }))} /></div>
              )}
              <SaveCancel onS={addPai} onC={() => { setPaiType(null); setPaiFrm({ montant: "", date: today(), jour: "1", dateDebut: "" }); }} />
            </Modal>
          )}

          <div style={card}>
            <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 10px" }}>Paiements</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button style={{ flex: 1, padding: "10px", background: SF, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => setPaiType("fixe")}>Mensuel</button>
              <button style={{ flex: 1, padding: "10px", background: SF, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => setPaiType("manuel")}>Unique</button>
            </div>
            {dette.paiements.length === 0 && (dette.paiementsAuto || []).filter(x => +x.montant > 0).length === 0 && <p style={{ textAlign: "center", color: TX3, fontSize: 13, padding: "10px 0" }}>Aucun paiement.</p>}
            {(dette.paiementsAuto || []).filter(x => +x.montant > 0 && !x.dateFin).length > 0 && <p style={{ fontSize: 11, color: TX3, margin: "4px 0 2px", fontWeight: 500 }}>Mensuels</p>}
            {(dette.paiementsAuto || []).filter(x => +x.montant > 0 && !x.dateFin).map((x, i) => (
              <div key={"auto" + i} style={trow}>
                <div style={ico}>🔁</div>
                <div style={{ flex: 1 }}><p style={{ fontSize: 13, color: TX, margin: 0, fontWeight: 500 }}>{fmt(+x.montant)}</p><p style={{ fontSize: 11, color: TX3, margin: 0 }}>{x.jour === "paie" ? "Paie" : x.jour === "fin" ? "Fin du mois" : "Le " + x.jour}</p></div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={() => { setEditPai({ id: x.id, type: "fixe" }); setEditPaiFrm({ montant: x.montant, jour: x.jour, date: today(), dateDebut: x.dateDebut || today().slice(0,7) }); }}>✎</button>
              </div>
            ))}
            {dette.paiements.length > 0 && <p style={{ fontSize: 11, color: TX3, margin: "4px 0 2px", fontWeight: 500 }}>Paiements uniques</p>}
            {[...dette.paiements].sort((a, b) => b.date.localeCompare(a.date)).map(p => (
              <div key={p.id} style={trow}>
                <div style={ico}>💸</div>
                <div style={{ flex: 1 }}><p style={{ fontSize: 13, color: TX, margin: 0, fontWeight: 500 }}>{fmt(p.montant)}</p><p style={{ fontSize: 11, color: TX3, margin: 0 }}>{p.date}</p></div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={() => { setEditPai({ id: p.id, type: "manuel" }); setEditPaiFrm({ montant: p.montant, date: p.date, jour: "1" }); }}>✎</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {dettes.length === 0 && !showAddDet && (
        <div style={{ textAlign: "center", color: TX3, padding: "40px 20px", fontSize: 13 }}>
          <p style={{ margin: "0 0 12px" }}>Aucune dette.</p>
          <button style={bigBtn()} onClick={() => setShowAddDet(true)}>Ajouter une dette</button>
        </div>
      )}
    </div>
  );
}
