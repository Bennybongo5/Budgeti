import { useState, useRef, useEffect } from "react";
import { SF, SF2, BR, BR2, TX, TX2, BT, BTB, BTT } from "../constants.js";

const MO_FR = ["Jan.", "Fév.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

export default function MonthPicker({ value, onChange }) {
  const parsed = value ? value.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  const selY = parsed[0], selM = parsed[1];

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("month");
  const [viewYear, setViewYear] = useState(selY);
  const [yearPage, setYearPage] = useState(Math.floor(selY / 12) * 12);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const openPicker = () => {
    setViewYear(selY);
    setYearPage(Math.floor(selY / 12) * 12);
    setMode("month");
    setOpen(o => !o);
  };

  const select = (yr, mo) => {
    onChange(`${yr}-${String(mo).padStart(2, "0")}`);
    setOpen(false);
  };

  const displayVal = value ? `${MO_FR[selM - 1]} ${selY}` : "Choisir...";

  const navBtn = { background: "none", border: "none", cursor: "pointer", fontSize: 20, color: TX2, padding: "0 8px", lineHeight: 1 };

  const Cell = ({ selected, onClick, label }) => (
    <button type="button" onClick={onClick}
      style={{ padding: "7px 2px", background: selected ? BT : "none", border: "1px solid " + (selected ? BTB : "transparent"), borderRadius: 8, color: selected ? BTT : TX, fontSize: 12, cursor: "pointer" }}>
      {label}
    </button>
  );

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={openPicker}
        style={{ background: SF, border: "0.5px solid " + BR2, borderRadius: 10, padding: "8px 12px", color: TX, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
        <span>{displayVal}</span>
        <span style={{ fontSize: 10, color: TX2 }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 300, background: SF, border: "1px solid " + BR2, borderRadius: 14, padding: "10px 10px 12px", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", width: 210, boxSizing: "border-box" }}>
          {/* Header: prev / title / next */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button type="button" style={navBtn}
              onClick={() => mode === "year" ? setYearPage(p => p - 12) : setViewYear(v => v - 1)}>‹</button>
            <button type="button"
              onClick={() => setMode(m => m === "month" ? "year" : "month")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: TX, padding: "2px 6px" }}>
              {mode === "month" ? viewYear : `${yearPage} – ${yearPage + 11}`}
            </button>
            <button type="button" style={navBtn}
              onClick={() => mode === "year" ? setYearPage(p => p + 12) : setViewYear(v => v + 1)}>›</button>
          </div>

          {mode === "month" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              {MO_FR.map((mn, i) => (
                <Cell key={i} selected={value && selY === viewYear && selM === i + 1}
                  onClick={() => select(viewYear, i + 1)} label={mn} />
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
              {Array.from({ length: 12 }, (_, i) => yearPage + i).map(yr => (
                <Cell key={yr} selected={value && selY === yr}
                  onClick={() => { setViewYear(yr); setMode("month"); }} label={yr} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
