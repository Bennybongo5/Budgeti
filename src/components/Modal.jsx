import { SF, BR2, TX } from "../constants.js";

const Modal = ({ title, children, zIndex = 100 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(58,53,32,0.45)", zIndex, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: SF, border: "1px solid " + BR2, borderRadius: 16, padding: 20, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}>
      <p style={{ fontSize: 15, fontWeight: 500, color: TX, margin: "0 0 14px" }}>{title}</p>
      {children}
    </div>
  </div>
);

export default Modal;
