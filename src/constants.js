// ── Data constants ────────────────────────────────────────────────────────────
export const DEFAULT_CATS=[{id:"logement",label:"Logement",icon:"🏠"},{id:"alimentation",label:"Alimentation",icon:"🛒"},{id:"transport",label:"Transport",icon:"🚗"},{id:"loisirs",label:"Loisirs",icon:"🎭"},{id:"sante",label:"Santé",icon:"💊"}];
export const FREQS=[{id:"semaine",label:"Hebdomadaire"},{id:"2semaines",label:"Aux 2 semaines"},{id:"mois",label:"Mensuel"},{id:"2mois",label:"Bimensuel"}];
export const JOURS_SEM=["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
export const JOURS_MOIS=[...Array.from({length:28},(_,i)=>i+1),"fin"];
export const ICONS_CAT=["🏠","🛒","🚗","🎭","💊","📦","🐾","👗","🍔","💡","📱","🎓","💰","🏋","✈","🎮","🛁","🌿","🍷","🎵"];
export const ICONS_PRJ=["🎯","🏖","🚗","🏠","💻","✈","🎓","💍","🎁","🏋","🎮","📷","🛋","🐾","🌿"];
export const PAR_PAIE_ROWS=[{l:"Paie",k:"mp",c:"var(--c-gn)",b:true},{l:"Argent reçu",k:"aRev",c:"var(--c-gn)"},{l:"Autres rev.",k:"rrP",c:"var(--c-gn)"},{l:"Paiements fixes",k:"ch",c:"var(--c-rd)",s:true},{l:"Dépenses",k:"deps",c:"var(--c-rd)",s:true},{l:"Paiements dettes",k:"detP",c:"var(--c-rd)",s:true},{l:"Versements projets",k:"prjP",c:"var(--c-rd)",s:true}];

// ── Colors — CSS variables (light/dark switched by App.jsx) ──────────────────
export const BG="var(--c-bg)",SF="var(--c-sf)",SF2="var(--c-sf2)",BR="var(--c-br)",BR2="var(--c-br2)";
export const TX="var(--c-tx)",TX2="var(--c-tx2)",TX3="var(--c-tx3)";
export const BT="var(--c-bt)",BTB="var(--c-btb)",BTT="var(--c-btt)";
export const AC="var(--c-ac)",RD="var(--c-rd)",GN="var(--c-gn)";
export const NS="input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}";

// ── Re-exports for backward compatibility ─────────────────────────────────────
export { storage } from "./utils/storage.js";
export { today, addD, ymd, ld, fmt, fd } from "./utils/dates.js";
export { getPaies, getFinD, calcAutoInPeriod, calcManuelsInPeriod } from "./utils/calculs.js";
