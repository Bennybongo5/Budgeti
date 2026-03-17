import { SF, SF2, BR, BR2, TX, TX2, TX3, BT, BTB, BTT, AC, RD, GN } from "../constants.js";
import { fmt } from "../utils/dates.js";
import Modal from "../components/Modal.jsx";
import DelBtn from "../components/DelBtn.jsx";
import SaveCancel from "../components/SaveCancel.jsx";

export default function Recurrents({
  recs, rrecs, recFrm, rrFrm, eRecId, eRecMod, eRrId, eRrMod, addType, cats,
  updRecs, updRrecs, setRecFrm, setRrFrm, setERecId, setERecMod, setERrId, setERrMod,
  addRec, delRec, openERec, addRr, delRr, openERr, setAddType,
  totRec, totRR,
  inp, card, tbtn, bigBtn, CatSel,
}) {
  return (
    <div>
      {eRecMod && eRecId && (
        <Modal title="Modifier la charge">
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} value={recFrm.desc} onChange={e => setRecFrm(f => ({ ...f, desc: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant</label><input style={inp} type="number" value={recFrm.amount} onChange={e => setRecFrm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour</label><input style={inp} type="number" min="1" max="31" value={recFrm.jour} onChange={e => setRecFrm(f => ({ ...f, jour: +e.target.value }))} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Categorie</label><CatSel value={recFrm.cat} onChange={v => setRecFrm(f => ({ ...f, cat: v }))} /></div>
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

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: TX }}>Recurrent</p>

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: RD, margin: "0 0 8px" }}>Depenses</p>
          {recs.length === 0 && <p style={{ fontSize: 12, color: TX3, textAlign: "center", padding: "10px 0" }}>Aucune</p>}
          {[...recs].sort((a, b) => (a.jour === "fin" ? 32 : a.jour) - (b.jour === "fin" ? 32 : b.jour)).map(r => {
            const c = cats.find(x => x.id === r.cat) || { icon: "📦", label: r.cat };
            return (
              <div key={r.id} style={{ background: SF, border: "1px solid " + BR, borderRadius: 10, padding: "9px 10px", marginBottom: 6, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: TX, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</p>
                  <p style={{ fontSize: 10, color: TX3, margin: 0 }}>{r.jour === "fin" ? "Fin du mois" : "Le " + r.jour}</p>
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

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, marginBottom: 10, marginTop: 0 }}>Ajouter</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button style={tbtn(addType === "depense", "depense")} onClick={() => setAddType("depense")}>Depense</button>
          <button style={tbtn(addType === "revenu", "revenu")} onClick={() => setAddType("revenu")}>Revenu</button>
        </div>
        <div style={{ marginBottom: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Description</label><input style={inp} placeholder={addType === "depense" ? "Ex: Loyer..." : "Ex: Allocations..."} value={addType === "depense" ? recFrm.desc : rrFrm.desc} onChange={e => addType === "depense" ? setRecFrm(f => ({ ...f, desc: e.target.value })) : setRrFrm(f => ({ ...f, desc: e.target.value }))} /></div>
        <div style={{ display: "flex", gap: 10, marginBottom: addType === "depense" ? 10 : 0 }}>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label><input style={inp} type="number" placeholder="0.00" value={addType === "depense" ? recFrm.amount : rrFrm.amount} onChange={e => addType === "depense" ? setRecFrm(f => ({ ...f, amount: e.target.value })) : setRrFrm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div style={{ flex: 1 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour du mois</label><input style={inp} type="number" min="1" max="31" value={addType === "depense" ? recFrm.jour : rrFrm.jour} onChange={e => addType === "depense" ? setRecFrm(f => ({ ...f, jour: +e.target.value })) : setRrFrm(f => ({ ...f, jour: +e.target.value }))} /></div>
        </div>
        {addType === "depense" && <div style={{ marginTop: 10 }}><label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Categorie</label><CatSel value={recFrm.cat} onChange={v => setRecFrm(f => ({ ...f, cat: v }))} /></div>}
        <button style={bigBtn()} onClick={() => addType === "depense" ? addRec() : addRr()}>Ajouter</button>
      </div>
    </div>
  );
}
