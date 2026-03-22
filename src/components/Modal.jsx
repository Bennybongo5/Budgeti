import { SF, BR2, TX } from "../constants.js";

const Modal = ({ title, children, zIndex = 100, onClose }) => (
  <div
    style={{ position: "fixed", inset: 0, background: "rgba(58,53,32,0.45)", zIndex, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    onClick={onClose}
  >
    <div
      style={{ background: SF, border: "1px solid " + BR2, borderRadius: 16, padding: 20, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}
      onClick={e => e.stopPropagation()}
    >
      <p style={{ fontSize: 15, fontWeight: 500, color: TX, margin: "0 0 14px" }}>{title}</p>
      {children}
    </div>
  </div>
);

export default Modal;
