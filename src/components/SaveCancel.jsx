import { BT, BTB, BTT, SF2, TX2 } from "../constants.js";

const SaveCancel = ({ onS, onC }) => (
  <div style={{ display: "flex", gap: 8 }}>
    <button
      style={{ flex: 1, padding: "12px", background: BT, border: "1px solid " + BTB, borderRadius: 12, color: BTT, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
      onClick={onS}
    >
      Enregistrer
    </button>
    <button
      style={{ width: 90, padding: "12px", background: SF2, border: "1px solid " + BTB, borderRadius: 12, color: TX2, fontSize: 14, cursor: "pointer" }}
      onClick={onC}
    >
      Annuler
    </button>
  </div>
);

export default SaveCancel;
