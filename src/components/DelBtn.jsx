import { RD } from "../constants.js";

const DelBtn = ({ onClick }) => (
  <button
    style={{ width: "100%", marginTop: 8, padding: "10px", background: "none", border: "1px solid " + RD, borderRadius: 12, color: RD, fontSize: 13, cursor: "pointer" }}
    onClick={onClick}
  >
    Supprimer
  </button>
);

export default DelBtn;
