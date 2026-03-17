// ── Data constants ────────────────────────────────────────────────────────────
export const DEFAULT_CATS=[{id:"logement",label:"Logement",icon:"🏠"},{id:"alimentation",label:"Alimentation",icon:"🛒"},{id:"transport",label:"Transport",icon:"🚗"},{id:"loisirs",label:"Loisirs",icon:"🎭"},{id:"sante",label:"Sante",icon:"💊"}];
export const FREQS=[{id:"semaine",label:"Hebdomadaire"},{id:"2semaines",label:"Aux 2 semaines"},{id:"mois",label:"Mensuel"},{id:"2mois",label:"Bimensuel"}];
export const JOURS_SEM=["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
export const JOURS_MOIS=[...Array.from({length:28},(_,i)=>i+1),"fin"];
export const ICONS_CAT=["🏠","🛒","🚗","🎭","💊","📦","🐾","👗","🍔","💡","📱","🎓","💰","🏋","✈","🎮","🛁","🌿","🍷","🎵"];
export const ICONS_PRJ=["🎯","🏖","🚗","🏠","💻","✈","🎓","💍","🎁","🏋","🎮","📷","🛋","🐾","🌿"];
export const PAR_PAIE_ROWS=[{l:"Paie",k:"mp",c:"#4a7a4a",b:true},{l:"Autres rev.",k:"aRev",c:"#4a7a4a"},{l:"Autres rev.",k:"rrP",c:"#4a7a4a"},{l:"Paiements fixes",k:"ch",c:"#b85a4a",s:true},{l:"Depenses",k:"deps",c:"#b85a4a",s:true},{l:"Paiements dettes",k:"detP",c:"#b85a4a",s:true},{l:"Versements projets",k:"prjP",c:"#b85a4a",s:true}];

// ── Colors ────────────────────────────────────────────────────────────────────
export const BG="#fdf8e1",SF="#fffde8",SF2="#fef9d0",BR="#e8dfa0",BR2="#d4c87a";
export const TX="#3a3520",TX2="#6b6040",TX3="#9a8e60";
export const BT="#c8e6c0",BTB="#8ab87a",BTT="#2d5a27";
export const AC="#7a8a4a",RD="#b85a4a",GN="#4a7a4a";
export const NS="input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}";

// ── Re-exports for backward compatibility ─────────────────────────────────────
export { storage } from "./utils/storage.js";
export { today, addD, ymd, ld, fmt, fd } from "./utils/dates.js";
export { getPaies, getFinD, calcAutoInPeriod, calcManuelsInPeriod } from "./utils/calculs.js";
