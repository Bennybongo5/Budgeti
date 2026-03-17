export const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
export const addD=(s,n)=>{const[y,m,d]=s.split("-").map(Number);const dt=new Date(y,m-1,d+n);return dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");};
export const ymd=(y,m,d)=>y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");
export const ld=(y,m)=>new Date(y,m,0).getDate();
export const fmt=n=>new Intl.NumberFormat("fr-CA",{style:"currency",currency:"CAD",maximumFractionDigits:2}).format(n);
export const fd=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("fr-CA",{day:"numeric",month:"short"});};
