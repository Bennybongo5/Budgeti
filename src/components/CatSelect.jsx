import { BT, BTB, BTT } from "../constants.js";

function CatSelect({ cats, value, onChange, inp, setCatCb, setShowCat }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <select style={{ ...inp, flex: 1 }} value={value} onChange={(e) => onChange(e.target.value)}>
        {cats.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        style={{ padding: "0 12px", background: BT, border: "1px solid " + BTB, borderRadius: 10, color: BTT, fontSize: 18, cursor: "pointer", flexShrink: 0 }}
        onClick={() => { setCatCb(() => onChange); setShowCat(true); }}
      >
        +
      </button>
    </div>
  );
}

export default CatSelect;
