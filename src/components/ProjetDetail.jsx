import { fmt, today, TX, TX2, TX3, AC, GN, RD, BT, BTB, BTT, SF, SF2, BR } from "../constants.js";
import Modal from "./Modal.jsx";
import SaveCancel from "./SaveCancel.jsx";

function ProjetDetail({
  projet, gSoldeP, gPctP,
  setEPrjId, setPrjFrm, setEPrjMod,
  verFrm, setVerFrm,
  verType, setVerType,
  addVer,
  setEditVer, setEditVerFrm,
  inp, card, trow, ico,
}) {
  const sp = gSoldeP(projet);
  const pp = gPctP(projet);
  const rest = Math.max(0, projet.objectif - sp);

  let de = null;
  if (rest > 0 && projet.versements.length >= 2) {
    const tr = [...projet.versements].sort((a, b) => a.date.localeCompare(b.date));
    const jo = (new Date(tr[tr.length - 1].date) - new Date(tr[0].date)) / (1000 * 60 * 60 * 24) || 1;
    const mo = sp / jo;
    if (mo > 0) {
      const jr = Math.ceil(rest / mo);
      const dd = new Date();
      dd.setDate(dd.getDate() + jr);
      de = dd.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
    }
  }

  return (
    <div>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>{projet.icon}</span>
            <p style={{ fontSize: 15, fontWeight: 500, color: TX, margin: 0 }}>{projet.nom}</p>
          </div>
          <button
            onClick={() => { setEPrjId(projet.id); setPrjFrm({ nom: projet.nom, objectif: projet.objectif, icon: projet.icon }); setEPrjMod(true); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: 4 }}
          >✎</button>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: TX2 }}>Epargne accumulee</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: AC }}>{pp}%</span>
          </div>
          <div style={{ height: 12, background: BR, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pp + "%", background: pp >= 100 ? GN : AC, borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, background: SF2, borderRadius: 10, padding: "8px 10px" }}>
            <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Accumule</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: GN, margin: "2px 0 0" }}>{fmt(sp)}</p>
          </div>
          {pp < 100 && (
            <div style={{ flex: 1, background: SF2, borderRadius: 10, padding: "8px 10px" }}>
              <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Reste</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: RD, margin: "2px 0 0" }}>{fmt(rest)}</p>
            </div>
          )}
          <div style={{ flex: 1, background: SF2, borderRadius: 10, padding: "8px 10px" }}>
            <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Objectif</p>
            <p style={{ fontSize: 15, fontWeight: 500, color: TX, margin: "2px 0 0" }}>{fmt(projet.objectif)}</p>
          </div>
        </div>
        {pp >= 100 && (
          <div style={{ background: BT, border: "1px solid " + BTB, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: BTT, margin: 0 }}>Objectif atteint !</p>
          </div>
        )}
        {de && pp < 100 && (
          <div style={{ background: SF2, border: "1px solid " + BR, borderRadius: 10, padding: "8px 12px", marginTop: 8 }}>
            <p style={{ fontSize: 11, color: TX3, margin: "0 0 2px" }}>Date estimee de completion</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: TX, margin: 0 }}>{de}</p>
          </div>
        )}
      </div>

      {verType && (
        <Modal title={verType === "fixe" ? "Versement mensuel" : "Versement unique"}>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Montant (CAD)</label>
              <input autoFocus style={inp} type="number" placeholder="0.00" value={verFrm.montant} onChange={(e) => setVerFrm((f) => ({ ...f, montant: e.target.value }))} />
            </div>
            {verType === "fixe" ? (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Jour du mois</label>
                <input style={inp} type="number" min="1" max="31" placeholder="1" value={verFrm.jour} onChange={(e) => setVerFrm((f) => ({ ...f, jour: e.target.value }))} />
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: TX2, marginBottom: 4, display: "block" }}>Date</label>
                <input style={inp} type="date" value={verFrm.date} onChange={(e) => setVerFrm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            )}
          </div>
          <SaveCancel onS={addVer} onC={() => { setVerType(null); setVerFrm({ montant: "", date: today(), jour: "1" }); }} />
        </Modal>
      )}

      <div style={card}>
        <p style={{ fontSize: 13, fontWeight: 500, color: TX2, margin: "0 0 10px" }}>Versements</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button style={{ flex: 1, padding: "10px", background: SF, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => setVerType("fixe")}>Mensuel</button>
          <button style={{ flex: 1, padding: "10px", background: SF, border: "1px solid " + BR, borderRadius: 10, color: TX2, fontSize: 13, cursor: "pointer" }} onClick={() => setVerType("manuel")}>Unique</button>
        </div>

        {projet.versements.length === 0 && (projet.paiementsAuto || []).filter((x) => +x.montant > 0).length === 0 && (
          <p style={{ textAlign: "center", color: TX3, fontSize: 13, padding: "10px 0" }}>Aucun versement.</p>
        )}

        {(projet.paiementsAuto || []).filter((x) => +x.montant > 0).length > 0 && (
          <p style={{ fontSize: 11, color: TX3, margin: "4px 0 2px", fontWeight: 500 }}>Mensuels</p>
        )}
        {(projet.paiementsAuto || []).filter((x) => +x.montant > 0).map((x, i) => (
          <div key={"auto" + i} style={trow}>
            <div style={{ ...ico, background: BT }}>🔁</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: TX, margin: 0, fontWeight: 500 }}>{fmt(+x.montant)}</p>
              <p style={{ fontSize: 11, color: TX3, margin: 0 }}>Le {x.jour} du mois</p>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={() => { setEditVer({ id: x.id, type: "fixe" }); setEditVerFrm({ montant: x.montant, jour: x.jour, date: "" }); }}>✎</button>
          </div>
        ))}

        {projet.versements.length > 0 && (
          <p style={{ fontSize: 11, color: TX3, margin: "4px 0 2px", fontWeight: 500 }}>Versements uniques</p>
        )}
        {[...projet.versements].sort((a, b) => b.date.localeCompare(a.date)).map((v) => (
          <div key={v.id} style={trow}>
            <div style={{ ...ico, background: BT }}>💵</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: TX, margin: 0, fontWeight: 500 }}>{fmt(v.montant)}</p>
              <p style={{ fontSize: 11, color: TX3, margin: 0 }}>{v.date}</p>
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: AC, fontSize: 14, padding: "2px 4px" }} onClick={() => { setEditVer({ id: v.id, type: "manuel" }); setEditVerFrm({ montant: v.montant, date: v.date, jour: "" }); }}>✎</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjetDetail;
