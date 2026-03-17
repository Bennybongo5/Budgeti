import { SF, BR, TX3 } from "../constants.js";

const StatBox = ({ label, value, color, onClick }) => (
  <div onClick={onClick} style={{ flex: 1, background: SF, border: "1px solid " + BR, borderRadius: 12, padding: "10px 12px", cursor: onClick ? "pointer" : "inherit" }}>
    <p style={{ fontSize: 11, color: TX3, margin: 0 }}>{label}</p>
    <p style={{ fontSize: 17, fontWeight: 500, color: color, margin: "3px 0 0" }}>{value}</p>
  </div>
);

export default StatBox;
