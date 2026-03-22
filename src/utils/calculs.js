import { today, addD, ymd, ld } from "./dates.js";

export function getPaies(p){const t=today();const[ty,tm,td]=t.split("-").map(Number);const dates=[];if(p.frequence==="semaine"||p.frequence==="2semaines"){const iv=p.frequence==="semaine"?7:14;let ref;if(p.frequence==="2semaines"&&p.dateRef){ref=p.dateRef;while(ref>t)ref=addD(ref,-iv);while(ref<t)ref=addD(ref,iv);}else{const map={Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5};const c=map[p.jourSemaine]||5;const dow=new Date(ty,tm-1,td).getDay();ref=addD(t,-((dow-c+7)%7)||0);while(ref>t)ref=addD(ref,-iv);while(addD(ref,iv)<=t)ref=addD(ref,iv);}dates.push(addD(ref,-iv));dates.push(ref);dates.push(addD(ref,iv));}else if(p.frequence==="mois"){for(let i=-1;i<=1;i++){let mo=tm-1+i,yr=ty+Math.floor(mo/12);mo=((mo%12)+12)%12;const j=p.jour1==="fin"?ld(yr,mo+1):Math.min(p.jour1,ld(yr,mo+1));dates.push(ymd(yr,mo+1,j));}}else if(p.frequence==="2mois"){const gj=(j,yr,mo)=>j==="fin"?ld(yr,mo):Math.min(j,ld(yr,mo));const all=[];for(let i=-3;i<=3;i++){let mo=tm-1+i,yr=ty+Math.floor(mo/12);mo=((mo%12)+12)%12;all.push(ymd(yr,mo+1,gj(p.jour1,yr,mo+1)));all.push(ymd(yr,mo+1,gj(p.jour2,yr,mo+1)));}all.sort();const idx=all.findIndex(d=>d>t);const s=Math.max(0,(idx===-1?all.length:idx)-2);dates.push(...all.slice(s,s+3));}return dates.slice(0,3);}

export function getFinD(p,last){if(!last)return null;const[y,m]=last.split("-").map(Number);if(p.frequence==="semaine")return addD(last,7);if(p.frequence==="2semaines")return addD(last,14);if(p.frequence==="mois"){const j=p.jour1==="fin"?ld(y,m+1):Math.min(p.jour1,ld(y,m+1));return ymd(y,m+1,j);}if(p.frequence==="2mois"){const gj=(j,yr,mo)=>j==="fin"?ld(yr,mo):Math.min(j,ld(yr,mo));const all=[];for(let i=0;i<=2;i++){let mo=m-1+i,yr=y+Math.floor(mo/12);mo=((mo%12)+12)%12;all.push(ymd(yr,mo+1,gj(p.jour1,yr,mo+1)));all.push(ymd(yr,mo+1,gj(p.jour2,yr,mo+1)));}all.sort();const idx=all.findIndex(d=>d>last);return idx!==-1?all[idx]:null;}return null;}

export function calcAutoInPeriod(items,deb,fin){const[dy,dm]=deb.split("-").map(Number);return items.reduce((total,item)=>total+(item.paiementsAuto||[]).reduce((s,pa)=>{if(!pa.montant||isNaN(+pa.montant))return s;if(pa.jour==="paie")return s+(+pa.montant);for(let mo=0;mo<=1;mo++){let mc=dm-1+mo,yc=dy+Math.floor(mc/12);mc=((mc%12)+12)%12;const j=Math.min(+pa.jour||1,ld(yc,mc+1));const ds=ymd(yc,mc+1,j);if(ds>=deb&&(fin?ds<fin:true))return s+(+pa.montant);}return s;},0),0);}

export function calcManuelsInPeriod(items,deb,fin,key){return items.reduce((total,item)=>total+(item[key]||[]).reduce((s,e)=>(e.date>=deb&&(fin?e.date<fin:true)?s+(+e.montant||0):s),0),0);}

function daysBetween(d1,d2){return Math.round((new Date(d2)-new Date(d1))/86400000);}

// Day-of-week map (JS convention: 0=Sun, 1=Mon, ..., 6=Sat)
const DOW_MAP={Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5,Samedi:6,Dimanche:0};

// Returns all dates (YYYY-MM-DD) when a weekly/biweekly rec occurs in a given month
export function getRecOccurrencesInMonth(r,y,m){
  const iv=r.frequence==="semaine"?7:14;
  const lastD=ld(y,m);
  const moStart=ymd(y,m,1);
  const moEnd=ymd(y,m,lastD);
  const targetDow=DOW_MAP[r.jourSemaine]??1;
  const results=[];
  let cur;
  if(r.frequence==="2semaines"&&r.dateRef){
    // Walk from dateRef anchor to first occurrence in or after moStart
    cur=r.dateRef;
    while(cur>moEnd)cur=addD(cur,-iv);
    while(cur<moStart)cur=addD(cur,iv);
  }else{
    // Find first occurrence of target day on or after moStart
    const[sy,sm,sd]=moStart.split("-").map(Number);
    const startDow=new Date(sy,sm-1,sd).getDay();
    const diff=(targetDow-startDow+7)%7;
    cur=addD(moStart,diff);
  }
  while(cur<=moEnd){results.push(cur);cur=addD(cur,iv);}
  return results;
}

export function getPaieBreakdownForMonth(paie,moStart,moEnd,paieM){
  if(!paie||!paie.frequence)return[];
  const[my,mm]=moStart.split("-").map(Number);
  const moEnd1=addD(moEnd,1);
  const found=[],seen=new Set();
  const tryAdd=deb=>{if(!deb||seen.has(deb))return;seen.add(deb);const fin=getFinD(paie,deb);if(fin&&deb<moEnd1&&fin>moStart)found.push({deb,fin});};
  if(paie.frequence==="semaine"||paie.frequence==="2semaines"){const iv=paie.frequence==="semaine"?7:14;let ref;if(paie.frequence==="2semaines"&&paie.dateRef){ref=paie.dateRef;while(ref>moStart)ref=addD(ref,-iv);}else{const map={Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5};const c=map[paie.jourSemaine]||5;const[y,m,d]=moStart.split("-").map(Number);const dow=new Date(y,m-1,d).getDay();ref=addD(moStart,-((dow-c+7)%7));while(ref>moStart)ref=addD(ref,-iv);}for(let cur=ref;cur<moEnd1;cur=addD(cur,iv))tryAdd(cur);}else if(paie.frequence==="mois"){for(let i=-1;i<=1;i++){let mo=mm-1+i,yr=my+Math.floor(mo/12);mo=((mo%12)+12)%12;const j=paie.jour1==="fin"?ld(yr,mo+1):Math.min(+paie.jour1||1,ld(yr,mo+1));tryAdd(ymd(yr,mo+1,j));}}else if(paie.frequence==="2mois"){const gj=(j,yr,mo)=>j==="fin"?ld(yr,mo):Math.min(+j||1,ld(yr,mo));for(let i=-1;i<=1;i++){let mo=mm-1+i,yr=my+Math.floor(mo/12);mo=((mo%12)+12)%12;tryAdd(ymd(yr,mo+1,gj(paie.jour1,yr,mo+1)));if(paie.jour2!=null)tryAdd(ymd(yr,mo+1,gj(paie.jour2,yr,mo+1)));}}
  found.sort((a,b)=>a.deb.localeCompare(b.deb));
  return found.map(({deb,fin})=>{const totalD=daysBetween(deb,fin);const oStart=deb>moStart?deb:moStart;const oEnd=fin<moEnd1?fin:moEnd1;const oD=daysBetween(oStart,oEnd);if(totalD<=0||oD<=0)return null;const ratio=oD/totalD;const fullAmount=paieM[deb]||0;return{deb,fin,fullAmount,ratio,proportionalAmount:fullAmount*ratio};}).filter(Boolean);
}

export function calcProportionalMonth(paie,moStart,moEnd,paieM,recs,rrecs,dettes,projets){
  if(!paie||!paie.frequence)return{totPaie:0,totRec:0,totRR:0,totDette:0,totProjet:0};
  const[my,mm]=moStart.split("-").map(Number);
  const moEnd1=addD(moEnd,1);
  const found=[],seen=new Set();
  const tryAdd=deb=>{
    if(!deb||seen.has(deb))return;
    seen.add(deb);
    const fin=getFinD(paie,deb);
    if(fin&&deb<moEnd1&&fin>moStart)found.push({deb,fin});
  };
  if(paie.frequence==="semaine"||paie.frequence==="2semaines"){
    const iv=paie.frequence==="semaine"?7:14;
    let ref;
    if(paie.frequence==="2semaines"&&paie.dateRef){
      ref=paie.dateRef;
      while(ref>moStart)ref=addD(ref,-iv);
    }else{
      const map={Lundi:1,Mardi:2,Mercredi:3,Jeudi:4,Vendredi:5};
      const c=map[paie.jourSemaine]||5;
      const[y,m,d]=moStart.split("-").map(Number);
      const dow=new Date(y,m-1,d).getDay();
      ref=addD(moStart,-((dow-c+7)%7));
      while(ref>moStart)ref=addD(ref,-iv);
    }
    for(let cur=ref;cur<moEnd1;cur=addD(cur,iv))tryAdd(cur);
  }else if(paie.frequence==="mois"){
    for(let i=-1;i<=1;i++){let mo=mm-1+i,yr=my+Math.floor(mo/12);mo=((mo%12)+12)%12;const j=paie.jour1==="fin"?ld(yr,mo+1):Math.min(+paie.jour1||1,ld(yr,mo+1));tryAdd(ymd(yr,mo+1,j));}
  }else if(paie.frequence==="2mois"){
    const gj=(j,yr,mo)=>j==="fin"?ld(yr,mo):Math.min(+j||1,ld(yr,mo));
    for(let i=-1;i<=1;i++){let mo=mm-1+i,yr=my+Math.floor(mo/12);mo=((mo%12)+12)%12;tryAdd(ymd(yr,mo+1,gj(paie.jour1,yr,mo+1)));if(paie.jour2!=null)tryAdd(ymd(yr,mo+1,gj(paie.jour2,yr,mo+1)));}
  }
  found.sort((a,b)=>a.deb.localeCompare(b.deb));
  const lastDay=ld(my,mm);
  // "per paie" items: proportional per period | "per day" items: once if day falls in month
  // Monthly recs split by "paie" (proportional) vs fixed day; weekly/biweekly counted by occurrences
  const recPaieSum=recs.filter(r=>r.frequence==="paie"||((!r.frequence||r.frequence==="mois")&&r.jour==="paie")).reduce((s,r)=>s+r.amount,0);
  let recDaySum=recs.filter(r=>(!r.frequence||r.frequence==="mois")&&r.jour!=="paie").reduce((s,r)=>{const j=r.jour==="fin"?lastDay:Math.min(+r.jour||1,lastDay);return ymd(my,mm,j)>=moStart&&ymd(my,mm,j)<=moEnd?s+r.amount:s;},0);
  recs.filter(r=>r.frequence==="semaine"||r.frequence==="2semaines").forEach(r=>{recDaySum+=r.amount*getRecOccurrencesInMonth(r,my,mm).length;});
  let rrDaySum=rrecs.filter(r=>!r.frequence||r.frequence==="mois").reduce((s,r)=>{const j=Math.min(+r.jour||1,lastDay);return ymd(my,mm,j)>=moStart&&ymd(my,mm,j)<=moEnd?s+r.amount:s;},0);
  rrecs.filter(r=>r.frequence==="semaine"||r.frequence==="2semaines").forEach(r=>{rrDaySum+=r.amount*getRecOccurrencesInMonth(r,my,mm).length;});
  let totPaie=0,totRecPaie=0,totDettePaie=0,totProjetPaie=0;
  found.forEach(({deb,fin})=>{
    const totalD=daysBetween(deb,fin);
    const oStart=deb>moStart?deb:moStart;
    const oEnd=fin<moEnd1?fin:moEnd1;
    const oD=daysBetween(oStart,oEnd);
    if(totalD<=0||oD<=0)return;
    const ratio=oD/totalD;
    totPaie+=(paieM[deb]||0)*ratio;
    totRecPaie+=recPaieSum*ratio;
    dettes.forEach(d=>(d.paiementsAuto||[]).filter(pa=>pa.jour==="paie"&&+pa.montant>0).forEach(pa=>{totDettePaie+=(+pa.montant)*ratio;}));
    projets.forEach(p=>(p.paiementsAuto||[]).filter(pa=>pa.jour==="paie"&&+pa.montant>0).forEach(pa=>{totProjetPaie+=(+pa.montant)*ratio;}));
  });
  const detDaySum=dettes.reduce((s,d)=>s+(d.paiementsAuto||[]).filter(pa=>pa.jour!=="paie"&&+pa.montant>0).reduce((ss,pa)=>{const j=pa.jour==="fin"?lastDay:Math.min(+pa.jour||1,lastDay);return ymd(my,mm,j)>=moStart&&ymd(my,mm,j)<=moEnd?ss+(+pa.montant):ss;},0),0);
  const prjDaySum=projets.reduce((s,p)=>s+(p.paiementsAuto||[]).filter(pa=>pa.jour!=="paie"&&+pa.montant>0).reduce((ss,pa)=>{const j=pa.jour==="fin"?lastDay:Math.min(+pa.jour||1,lastDay);return ymd(my,mm,j)>=moStart&&ymd(my,mm,j)<=moEnd?ss+(+pa.montant):ss;},0),0);
  return{
    totPaie,
    totRec:totRecPaie+recDaySum,
    totRR:rrDaySum,
    totDette:totDettePaie+detDaySum+calcManuelsInPeriod(dettes,moStart,moEnd1,"paiements"),
    totProjet:totProjetPaie+prjDaySum+calcManuelsInPeriod(projets,moStart,moEnd1,"versements"),
  };
}
