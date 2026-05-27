// ============================================================
// SABORES DEL DESIERTO - INVENTARIO
// Versión con Supabase + Login
// ============================================================
const SUPABASE_URL = "https://zbxoskebjsoronileppj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inimport { useState, useEffect, useCallback, useRef } from "react";
// ─── SUPABASE CLIENT ──────────────────────────────────────────
const sb = {
 headers: { "Content-Type":"application/json", "apikey":SUPABASE_KEY, "Authorization":`Beare url: (table, qs="") => `${SUPABASE_URL}/rest/v1/${table}${qs}`,
 async get(table, qs="") {
 const r = await fetch(this.url(table, qs), { headers:{...this.headers,"Prefer":"return=re if (!r.ok) throw new Error(await r.text());
 return r.json();
 },
 async post(table, body) {
 const r = await fetch(this.url(table), { method:"POST", headers:{...this.headers,"Prefer" if (!r.ok) throw new Error(await r.text());
 return r.json();
 },
 async patch(table, id, body) {
 const r = await fetch(this.url(table, `?id=eq.${id}`), { method:"PATCH", headers:{...this if (!r.ok) throw new Error(await r.text());
 return r.json();
 },
 async delete(table, id) {
 const r = await fetch(this.url(table, `?id=eq.${id}`), { method:"DELETE", headers:this.he if (!r.ok) throw new Error(await r.text());
 },
 async login(email, password) {
 const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
 method:"POST",
 headers:{ "Content-Type":"application/json", "apikey":SUPABASE_KEY },
 body:JSON.stringify({ email, password })
 });
 const data = await r.json();
 if (!r.ok) throw new Error(data.error_description || data.msg || "Error al iniciar sesión return data;
 },
 async logout(token) {
 await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
 method:"POST",
 headers:{ "Content-Type":"application/json", "apikey":SUPABASE_KEY, "Authorization":`Be });
 }
};
// ─── CONSTANTES ───────────────────────────────────────────────
const CATEGORIAS = [
 "Maquinaria de Cocina","Maquinaria de Frío","Utensilios Críticos",
 "Tecnología/Oficina","Utilidades/Servicios","Logística/Manejo","Seguridad","Operativos"
];
const ESTADOS = ["Bueno","Regular","Crítico","En Mantenimiento"];
const TIPOS = [
 { id:"compra_directa", label:"Compra Directa", desc:"Va directo a la sucursal",  { id:"compra_tes", label:"Compra a Almacén", desc:"Entra al Almacén Principal", { id:"traslado_directo", label:"Traslado Directo", desc:"De sucursal A a sucursal B", { id:"traslado_tes", label:"Traslado por Almacén", desc:"Pasa por el Almacén Principa];
// ─── ICONS ────────────────────────────────────────────────────
const I = ({ n, s=20 }) => {
 const m = {
 home: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" transfer: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" box: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" history: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" search: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" settings: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" plus: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" trash: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" edit: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" check: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" close: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" refresh: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" logout: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" print: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" };
 return m[n] || null;
};
const Badge = ({ e }) => {
 const c = { "Bueno":"#22c55e","Regular":"#f59e0b","Crítico":"#ef4444","En Mantenimiento":"# return <span style={{ background:c+"22",color:c,border:`1px solid ${c}40`,borderRadius:6,pa};
const Toast = ({ msg, type, onClose }) => {
 const bg = { success:"#14532d", error:"#7f1d1d", warning:"#78350f", info:"#1e3a5f" }[type]| const ic = { success:"✓", error:"✕", warning:"⚠", info:" " }[type]||"✓";
 return (
 <div style={{ position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",backgrou <span>{ic}</span><span style={{ flex:1 }}>{msg}</span>
 <button onClick={onClose} style={{ background:"none",border:"none",color:"#fff9",cursor </div>
 );
};
const Modal = ({ title, onClose, children }) => (
 <div style={{ position:"fixed",inset:0,background:"#000b",zIndex:500,display:"flex",alignIt <div style={{ background:"#0f1623",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:540 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginB <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color <button onClick={onClose} style={{ background:"#1a2235",border:"none",color:"#94a3b8" </div>
 {children}
 </div>
 </div>
);
const Spin = ({ size=24 }) => (
 <div style={{ width:size,height:size,border:`3px solid #1a2235`,borderTopColor:"#f59e0b",bo);
// ─── LOGIN SCREEN ─────────────────────────────────────────────
function LoginScreen({ onLogin }) {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const handleLogin = async () => {
 if (!email || !password) { setError("Completa todos los campos"); return; }
 setLoading(true);
 setError("");
 try {
 const data = await sb.login(email, password);
 onLogin(data);
 } catch(err) {
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };
 return (
 <div style={{ minHeight:"100vh",background:"#080d1a",display:"flex",flexDirection:"column <style>{`
 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9.. *{box-sizing:border-box;margin:0;padding:0}
 @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:tr @keyframes spin{to{transform:rotate(360deg)}}
 `}</style>
 <div style={{ width:"100%",maxWidth:400,animation:"fadeIn 0.4s ease" }}>
 <div style={{ textAlign:"center",marginBottom:36 }}>
 <div style={{ fontSize:48,marginBottom:12 }}> </div>
 <p style={{ fontSize:11,color:"#6b7280",letterSpacing:"0.14em",textTransform:"upper <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:700,col </div>
 <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:20,padding <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
 <label style={{ fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.07em" <input
 type="email"
 placeholder="tu@correo.com"
 value={email}
 onChange={e=>{ setEmail(e.target.value); setError(""); }}
 onKeyDown={e=>e.key==="Enter"&&handleLogin()}
 style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,colo onFocus={e=>e.target.style.borderColor="#f59e0b"}
 onBlur={e=>e.target.style.borderColor="#252f42"}
 />
 </div>
 <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
 <label style={{ fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.07em" <input
 type="password"
 placeholder="••••••••"
 value={password}
 onChange={e=>{ setPassword(e.target.value); setError(""); }}
 onKeyDown={e=>e.key==="Enter"&&handleLogin()}
 style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,colo onFocus={e=>e.target.style.borderColor="#f59e0b"}
 onBlur={e=>e.target.style.borderColor="#252f42"}
 />
 </div>
 {error && (
 <div style={{ background:"#7f1d1d22",border:"1px solid #7f1d1d44",borderRadius:8, {error}
 </div>
 )}
 <button
 onClick={handleLogin}
 disabled={loading}
 style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#0a0e1a",bor >
 {loading ? <><Spin size={18}/> Entrando...</> : "Iniciar Sesión"}
 </button>
 </div>
 </div>
 </div>
 );
}
// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
 const [session, setSession] = useState(null);
 const [tab, setTab] = useState("home");
 const [sucursales, setSucursales] = useState([]);
 const [inventario, setInventario] = useState({});
 const [sucMap, setSucMap] = useState({});
 const [sucByName, setSucByName] = useState({});
 const [movimientos, setMovimientos] = useState([]);
 const [loading, setLoading] = useState(true);
 const [toast, setToast] = useState(null);
 const showToast = useCallback((msg, type="success") => {
 setToast({ msg, type });
 setTimeout(()=>setToast(null), 4000);
 }, []);
 const handleLogin = (data) => {
 setSession(data);
 localStorage.setItem("sb_session", JSON.stringify(data));
 };
 const handleLogout = async () => {
 if (session?.access_token) await sb.logout(session.access_token);
 setSession(null);
 localStorage.removeItem("sb_session");
 };
 // Restore session on load
 useEffect(() => {
 const saved = localStorage.getItem("sb_session");
 if (saved) {
 try { setSession(JSON.parse(saved)); } catch {}
 }
 }, []);
 const loadAll = useCallback(async () => {
 setLoading(true);
 try {
 const [sucs, inv, movs] = await Promise.all([
 sb.get("sucursales", "?activa=eq.true&order=nombre"),
 sb.get("inventario", "?order=articulo"),
 sb.get("movimientos", "?order=created_at.desc&limit=200"),
 ]);
 const map = {}; const byName = {};
 sucs.forEach(s=>{ map[s.id]=s.nombre; byName[s.nombre]=s.id; });
 setSucursales(sucs); setSucMap(map); setSucByName(byName);
 const grouped = {};
 sucs.forEach(s=>{ grouped[s.id]=[]; });
 inv.forEach(i=>{ if (grouped[i.sucursal_id]) grouped[i.sucursal_id].push(i); });
 setInventario(grouped);
 setMovimientos(movs);
 } catch(err) {
 showToast("Error conectando a la base de datos: "+err.message, "error");
 } finally {
 setLoading(false);
 }
 }, [showToast]);
 useEffect(()=>{ if (session) loadAll(); }, [session, loadAll]);
 if (!session) return <LoginScreen onLogin={handleLogin} />;
 const addMovimiento = async (form) => {
 try {
 const almacenId = sucByName["Almacén Principal"];
 const origenId = form.origen ? sucByName[form.origen] : null;
 const destinoId = form.destino ? sucByName[form.destino] : null;
 const qty = Number(form.cantidad)||0;
 await sb.post("movimientos", {
 tipo:form.tipo, fase:form.fase||null, articulo:form.articulo,
 cantidad:qty, categoria:form.categoria, codigo:form.codigo||"",
 marca:form.marca||"S/N", estado:form.estado||"Bueno",
 origen_id:origenId, destino_id:destinoId,
 origen_nombre:form.origen||null, destino_nombre:form.destino||null,
 observaciones:form.observaciones||""
 });
 const upsertItem = async (sucId, delta) => {
 if (!sucId) return;
 const existing = (inventario[sucId]||[]).find(i=>i.articulo.toLowerCase().trim()===fo if (existing) {
 const newQty = Math.max(0, (existing.cantidad||0) + delta);
 await sb.patch("inventario", existing.id, { cantidad:newQty, updated_at:new Date(). } else if (delta > 0) {
 await sb.post("inventario", { sucursal_id:sucId, articulo:form.articulo, codigo:for }
 };
 if (form.tipo==="compra_directa") { await upsertItem(destinoId, qty); }
 else if (form.tipo==="compra_tes") { await upsertItem(almacenId, qty); }
 else if (form.tipo==="traslado_directo") { await upsertItem(origenId, -qty); await upse else if (form.tipo==="traslado_tes") {
 if (form.fase==="entrada") { await upsertItem(origenId, -qty); await upsertItem(almac else { await upsertItem(almacenId, -qty); await upsertItem(destinoId, qty); }
 }
 await loadAll();
 showToast("Movimiento registrado correctamente");
 return true;
 } catch(err) { showToast("Error al registrar: "+err.message, "error"); return false; }
 };
 const saveArticulo = async (sucId, item) => {
 try {
 if (item.id) {
 await sb.patch("inventario", item.id, { articulo:item.articulo, codigo:item.codigo||" showToast("Artículo actualizado");
 } else {
 const existing = (inventario[sucId]||[]).find(i=>i.articulo.toLowerCase().trim()===it if (existing) {
 await sb.patch("inventario", existing.id, { cantidad:Number(item.cantidad)||0, esta showToast("Artículo actualizado");
 } else {
 await sb.post("inventario", { sucursal_id:sucId, articulo:item.articulo, codigo:ite showToast("Artículo agregado");
 }
 }
 await loadAll();
 } catch(err) { showToast("Error: "+err.message,"error"); }
 };
 const deleteArticulo = async (id) => {
 try { await sb.delete("inventario", id); await loadAll(); showToast("Artículo eliminado") catch(err) { showToast("Error: "+err.message,"error"); }
 };
 const addSucursal = async (nombre) => {
 const trimmed = nombre.trim();
 if (!trimmed) return;
 if (sucursales.find(s=>s.nombre===trimmed)) { showToast("Esa sucursal ya existe","warning try {
 await sb.post("sucursales", { nombre:trimmed });
 await loadAll();
 showToast(`Sucursal "${trimmed}" creada`);
 } catch(err) { showToast("Error: "+err.message,"error"); }
 };
 const exportarExcel = () => {
 // Get current tab data
 const allItems = Object.values(inventario).flat();
 const fecha = new Date().toLocaleDateString("es-DO");
 // Build CSV content (Excel-compatible)
 let rows = [];
 if (tab === "inventario") {
 // Will be handled in InvTab via event
 window.dispatchEvent(new CustomEvent("exportar-inventario"));
 return;
 }
 if (tab === "historial") {
 rows.push(["Fecha","Tipo","Fase","Artículo","Cantidad","Origen","Destino","Observacione movimientos.forEach(m => {
 const tipoL = { compra_directa:"Compra Directa",compra_tes:"Compra → Almacén",traslad const faseL = { entrada:"Entrada a Almacén",salida:"Salida de Almacén" };
 rows.push([
 new Date(m.created_at).toLocaleString("es-DO"),
 tipoL[m.tipo]||m.tipo,
 faseL[m.fase]||"",
 m.articulo, m.cantidad,
 m.origen_nombre||"", m.destino_nombre||"",
 m.observaciones||""
 ]);
 });
 } else {
 // Home / default: all inventory
 rows.push(["Sucursal","Artículo","Código","Categoría","Marca","Cantidad","Estado"]);
 sucursales.forEach(s => {
 (inventario[s.id]||[]).forEach(i => {
 rows.push([s.nombre, i.articulo, i.codigo||"", i.categoria, i.marca||"S/N", i.canti });
 });
 }
 const bom = "";
 const csv = bom + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")");
 const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `inventario-sabores-${fecha.replace(/\//g,"-")}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 };
 const tabs = [
 { id:"home", label:"Inicio", n:"home" },
 { id:"nuevo", label:"Registro", n:"transfer" },
 { id:"inventario",label:"Inventario",n:"box" },
 { id:"historial", label:"Historial", n:"history" },
 { id:"buscar", label:"Buscar", n:"search" },
 ];
 const userEmail = session?.user?.email || "";
 return (
 <div style={{ minHeight:"100vh",background:"#080d1a",color:"#e2e8f0",fontFamily:"'DM Sans <style>{`
 @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9.. *{box-sizing:border-box;margin:0;padding:0}
 ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#080d1a}::-webkit- input,select,textarea{outline:none}
 @keyframes slideUp{from{transform:translateX(-50%) translateY(16px);opacity:0}to{tran @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:tra @keyframes spin{to{transform:rotate(360deg)}}
 .card{background:#0f1623;border:1px solid #1a2235;border-radius:16px;padding:18px;ani .field{display:flex;flex-direction:column;gap:6px}
 .field label{font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.07em;text- .field input,.field select,.field textarea{background:#1a2235;border:1.5px solid #252 .field input:focus,.field select:focus,.field textarea:focus{border-color:#f59e0b}
 .field select option{background:#1a2235}
 .btn{border:none;border-radius:12px;padding:13px 18px;font-weight:700;font-size:14px; .btn:disabled{opacity:0.4;cursor:not-allowed}
 .gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#0a0e1a}
 .gold:hover:not(:disabled){opacity:0.88}
 .ghost{background:#1a2235;color:#94a3b8;border:1.5px solid #252f42}
 .ghost:hover{background:#252f42;color:#e2e8f0}
 .danger{background:#7f1d1d22;color:#f87171;border:1.5px solid #7f1d1d44}
 .danger:hover{background:#7f1d1d44}
 .tag{background:#1a2235;border:1px solid #252f42;border-radius:7px;padding:3px 9px;fo .row{display:flex;justify-content:space-between;align-items:center;background:#131d2e .st{font-size:12px;color:#94a3b8;font-weight:700;letter-spacing:0.08em;text-transform .empty{text-align:center;padding:40px 20px;color:#4b5563}
 .div{height:1px;background:#1a2235;margin:12px 0}
 `}</style>
 <div style={{ padding:"18px 16px 0",background:"linear-gradient(180deg,#0d1626,transpar <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
 <div>
 <p style={{ fontSize:10,color:"#94a3b8",letterSpacing:"0.12em",textTransform:"upp <h1 style={{ fontSize:20,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",c </div>
 <div style={{ display:"flex",gap:8 }}>
 <button onClick={loadAll} style={{ background:"#1a2235",border:"1.5px solid #252f {loading ? <Spin size={18}/> : <I n="refresh" s={18}/>}
 </button>
 <button onClick={()=>setTab("config")} style={{ background:"#1a2235",border:"1.5p <I n="settings" s={18}/>
 </button>
 <button onClick={exportarExcel} title="Exportar Excel" style={{ background:"#1a22 <button onClick={handleLogout} title="Cerrar sesión" style={{ background:"#1a2235 <I n="logout" s={18}/>
 </button>
 </div>
 </div>
 <div style={{ marginTop:6,marginBottom:2,display:"flex",alignItems:"center",gap:6 }}>
 <div style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e" }}/>
 <span style={{ fontSize:11,color:"#64748b",fontWeight:500 }}>{userEmail}</span>
 </div>
 </div>
 <div style={{ padding:"12px 14px 0" }}>
 {tab==="home" && <HomeTab inventario={inventario} movimientos={movimientos} suc {tab==="nuevo" && <NuevoTab sucursales={sucursales.map(s=>s.nombre)} onSubmit={a {tab==="inventario" && <InvTab inventario={inventario} sucursales={sucursales} sucMap {tab==="historial" && <HistTab movimientos={movimientos} loading={loading}/>}
 {tab==="buscar" && <BuscarTab inventario={inventario} sucMap={sucMap}/>}
 {tab==="config" && <ConfigTab sucursales={sucursales} inventario={inventario} onA </div>
 <div style={{ position:"fixed",bottom:0,left:0,right:0,background:"#0d1220",borderTop:" {tabs.map(t=>(
 <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",flexDirection <I n={t.n} s={22}/>
 <span style={{ fontSize:9.5,fontWeight:tab===t.id?700:500,letterSpacing:"0.04em"
 </button>
 ))}
 </div>
 {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
 </div>
 );
}
// ─── HOME ─────────────────────────────────────────────────────
function HomeTab({ inventario, movimientos, sucMap, sucursales, setTab, loading }) {
 const allItems = Object.values(inventario).flat();
 const totalUnids = allItems.reduce((s,i)=>s+(i.cantidad||0),0);
 const criticos = allItems.filter(i=>i.estado==="Crítico").map(i=>({...i,sucursal:sucMap[i const regulares = allItems.filter(i=>i.estado==="Regular").length;
 const movHoy = movimientos.filter(m=>new Date(m.created_at).toDateString()===new Date() const movSemana = movimientos.filter(m=>{ const d=new Date(m.created_at); const now=new Da const tipoL = { compra_directa:"Compra Directa",compra_tes:"Compra → Almacén",traslado const fecha = new Date().toLocaleDateString("es-DO",{weekday:"long",day:"numeric",mont return (
 <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
 {/* Fecha */}
 <p style={{ fontSize:12,color:"#64748b",textTransform:"capitalize",fontWeight:500 }}>{f {/* KPIs principales */}
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
 <div style={{ background:"linear-gradient(135deg,#1c2d1c,#0f1623)",border:"1px solid  {loading?<Spin size={20}/>:<div style={{ fontSize:32,fontWeight:800,color:"#22c55e" <div style={{ fontSize:12,color:"#86efac",fontWeight:600,marginTop:4 }}>Total Artíc <div style={{ fontSize:11,color:"#4b5563",marginTop:2 }}>{sucursales.length} sucurs </div>
 <div style={{ background:"linear-gradient(135deg,#1c2235,#0f1623)",border:"1px solid  {loading?<Spin size={20}/>:<div style={{ fontSize:32,fontWeight:800,color:"#60a5fa" <div style={{ fontSize:12,color:"#93c5fd",fontWeight:600,marginTop:4 }}>Unidades To <div style={{ fontSize:11,color:"#4b5563",marginTop:2 }}>en inventario</div>
 </div>
 </div>
 {/* Estado del inventario */}
 <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:16,padding:" <p style={{ fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:14 }}>Estado del  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
 {[
 { l:"Bueno", v:allItems.filter(i=>i.estado==="Bueno").length, c:"#22c55e", bg:"#1 { l:"Regular", v:regulares, c:"#f59e0b", bg:"#78350f22" },
 { l:"Crítico", v:criticos.length, c:"#ef4444", bg:"#7f1d1d22" },
 ].map(s=>(
 <div key={s.l} style={{ background:s.bg,borderRadius:12,padding:"10px 8px",textAl {loading?<Spin size={16}/>:<div style={{ fontSize:22,fontWeight:800,color:s.c,f <div style={{ fontSize:10,color:s.c,fontWeight:600,marginTop:3,opacity:0.8 }}>{ </div>
 ))}
 </div>
 </div>
 {/* Movimientos */}
 <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:16,padding:" <p style={{ fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:14 }}>Actividad</ <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
 <div style={{ background:"#131d2e",borderRadius:12,padding:"12px 10px",textAlign:"c {loading?<Spin size={16}/>:<div style={{ fontSize:26,fontWeight:800,color:"#34d39 <div style={{ fontSize:11,color:"#6ee7b7",fontWeight:600,marginTop:3 }}>Hoy</div>
 </div>
 <div style={{ background:"#131d2e",borderRadius:12,padding:"12px 10px",textAlign:"c {loading?<Spin size={16}/>:<div style={{ fontSize:26,fontWeight:800,color:"#a78bf <div style={{ fontSize:11,color:"#c4b5fd",fontWeight:600,marginTop:3 }}>Esta sema </div>
 </div>
 </div>
 {/* Acciones rápidas */}
 <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:16,padding:" <p style={{ fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:14 }}>Acciones Rá <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
 {TIPOS.map(t=>(
 <button key={t.id} onClick={()=>setTab("nuevo")} style={{ background:"#131d2e",bo onMouseEnter={e=>{ e.currentTarget.style.borderColor="#f59e0b"; e.currentTarget onMouseLeave={e=>{ e.currentTarget.style.borderColor="#252f42"; e.currentTarget <span style={{ fontSize:24 }}>{t.icon}</span>
 <span style={{ fontSize:11,fontWeight:600,textAlign:"center",lineHeight:1.3 }}> <span style={{ fontSize:10,color:"#4b5563",textAlign:"center",lineHeight:1.3 }} </button>
 ))}
 </div>
 </div>
 {/* Alertas críticas */}
 {criticos.length>0&&(
 <div style={{ background:"#0f1623",border:"1.5px solid #7f1d1d55",borderRadius:16,pad <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",mar <p style={{ fontSize:13,fontWeight:700,color:"#fca5a5" }}>⚠ Artículos Críticos</p <span style={{ background:"#7f1d1d44",color:"#f87171",border:"1px solid #7f1d1d",
 </div>
 {criticos.slice(0,5).map((i,idx)=>(
 <div key={idx} style={{ display:"flex",justifyContent:"space-between",alignItems: <div>
 <div style={{ fontSize:13,fontWeight:600,color:"#fca5a5" }}>{i.articulo}</div <div style={{ fontSize:11,color:"#6b7280",marginTop:2 }}>{i.sucursal}</div>
 </div>
 <Badge e={i.estado}/>
 </div>
 ))}
 {criticos.length>5&&<p style={{ fontSize:11,color:"#6b7280",textAlign:"center",marg </div>
 )}
 {/* Sucursales */}
 <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:16,padding:" <p style={{ fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:14 }}>Sucursales< {sucursales.map(s=>{
 const items=inventario[s.id]||[];
 const total=items.reduce((ss,i)=>ss+(i.cantidad||0),0);
 const pct = allItems.length ? Math.round((items.length/allItems.length)*100) : 0;
 return (
 <div key={s.id} style={{ marginBottom:12 }}>
 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" <div style={{ display:"flex",alignItems:"center",gap:8 }}>
 <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",flex <span style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{s.nombre}</sp </div>
 <div style={{ display:"flex",gap:12,alignItems:"center" }}>
 <span style={{ fontSize:11,color:"#64748b" }}>{items.length} art.</span>
 <span style={{ fontSize:13,fontWeight:700,color:"#f59e0b" }}>{total}</span>
 </div>
 </div>
 <div style={{ height:4,background:"#1a2235",borderRadius:4,overflow:"hidden" }} <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg </div>
 </div>
 );
 })}
 </div>
 {/* Últimos movimientos */}
 {movimientos.length>0&&(
 <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:16,padding <p style={{ fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:14 }}>Últimos M {movimientos.slice(0,5).map((m,i)=>{
 const tipo=TIPOS.find(t=>t.id===m.tipo);
 const hora=new Date(m.created_at).toLocaleTimeString("es-DO",{hour:"2-digit",minu const dia=new Date(m.created_at).toDateString()===new Date().toDateString()?"Hoy" return (
 <div key={i} style={{ display:"flex",gap:12,alignItems:"center",padding:"10px 0 <div style={{ width:40,height:40,background:"#1a2235",borderRadius:10,display <div style={{ flex:1,minWidth:0 }}>
 <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0",overflow:"hidden", <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{tipoL[m.tipo]} ·  </div>
 <div style={{ textAlign:"right",flexShrink:0 }}>
 <div style={{ fontSize:11,color:"#94a3b8",fontWeight:600 }}>{hora}</div>
 <div style={{ fontSize:10,color:"#4b5563",marginTop:1 }}>{dia}</div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
// ─── NUEVO MOVIMIENTO ─────────────────────────────────────────
function ArticuloBuscador({ sucursalNombre, inventario, sucByName, value, onChange, onSelect, const [q, setQ] = useState(value||"");
 const [open, setOpen] = useState(false);
 const [confirmar, setConfirmar] = useState(null); // { articulo, enOtra: [{sucursal,item}]  const ref = useRef();
 const sucId = sucByName[sucursalNombre];
 const itemsLocal = sucId ? (inventario[sucId]||[]) : [];
 const todosItems = Object.entries(inventario).flatMap(([sid, items]) =>
 items.map(i => ({ ...i, _sucId: sid }))
 );
 const query = q.toLowerCase().trim();
 const sugerencias = !query ? itemsLocal.slice(0, 8) :
 itemsLocal.filter(i =>
 i.articulo?.toLowerCase().includes(query) ||
 i.codigo?.toLowerCase().includes(query)
 ).slice(0, 10);
 const enOtras = !query ? [] :
 todosItems.filter(i =>
 i._sucId !== sucId &&
 (i.articulo?.toLowerCase().includes(query) || i.codigo?.toLowerCase().includes(query))  !sugerencias.find(s => s.articulo?.toLowerCase() === i.articulo?.toLowerCase())
 ).slice(0, 5);
 const seleccionar = (item, forzar=false) => {
 if (!forzar && item._sucId !== sucId && item._sucId !== undefined) {
 // está en otra sucursal, no en la seleccionada
 const otherSucs = todosItems.filter(i => i.articulo?.toLowerCase() === item.articulo?.t if (otherSucs.length > 0) {
 setConfirmar({ articulo: item.articulo, item });
 setOpen(false);
 return;
 }
 }
 setQ(item.articulo);
 onSelect(item);
 setOpen(false);
 setConfirmar(null);
 };
 const crearNuevo = () => {
 onChange(q);
 onSelect({ articulo: q, codigo:"", categoria:"Maquinaria de Cocina", marca:"S/N", estado: setOpen(false);
 setConfirmar(null);
 };
 useEffect(() => {
 setQ(value||"");
 }, [value]);
 return (
 <div style={{ position:"relative" }} ref={ref}>
 <div style={{ position:"relative" }}>
 <input
 type="text"
 placeholder={sucursalNombre ? "Buscar artículo..." : "Selecciona sucursal primero"}
 value={q}
 disabled={!sucursalNombre}
 onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); set onFocus={() => setOpen(true)}
 onBlur={() => setTimeout(()=>setOpen(false), 200)}
 style={{ background:"#1a2235", border:`1.5px solid ${error?"#ef4444":"#252f42"}`, b onFocus2={e=>e.target.style.borderColor="#f59e0b"}
 />
 {q && <button onClick={()=>{ setQ(""); onChange(""); onSelect({}); }} style={{ positi </div>
 {open && sucursalNombre && (sugerencias.length > 0 || enOtras.length > 0 || q.trim()) &
 <div style={{ position:"absolute",top:"100%",left:0,right:0,background:"#0f1623",bord {sugerencias.length > 0 && (
 <>
 <div style={{ fontSize:10,color:"#4b5563",fontWeight:700,letterSpacing:"0.08em" {sugerencias.map((item,i) => (
 <div key={i} onMouseDown={()=>seleccionar(item)} style={{ padding:"10px 14px" onMouseEnter={e=>e.currentTarget.style.background="#1a2235"} onMouseLeave={ <div>
 <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{item.articul <div style={{ fontSize:11,color:"#6b7280" }}>{item.categoria}{item.codigo </div>
 <span style={{ fontSize:13,fontWeight:700,color:"#f59e0b" }}>{item.cantidad </div>
 ))}
 </>
 )}
 {enOtras.length > 0 && (
 <>
 <div style={{ fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em" {enOtras.map((item,i) => (
 <div key={i} onMouseDown={()=>seleccionar(item)} style={{ padding:"10px 14px" onMouseEnter={e=>e.currentTarget.style.background="#1a2235"} onMouseLeave={ <div>
 <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{item.articul <div style={{ fontSize:11,color:"#f59e0b" }}>⚠ No está en {sucursalNombre </div>
 <span style={{ fontSize:13,fontWeight:700,color:"#f59e0b" }}>{item.cantidad </div>
 ))}
 </>
 )}
 {q.trim() && sugerencias.length === 0 && (
 <div onMouseDown={crearNuevo} style={{ padding:"12px 14px",cursor:"pointer",displ onMouseEnter={e=>e.currentTarget.style.background="#1a2235"} onMouseLeave={e=>e <div style={{ width:28,height:28,background:"#f59e0b22",borderRadius:8,display: <div>
 <div style={{ fontSize:13,fontWeight:600,color:"#f59e0b" }}>Crear "{q}"</div>
 <div style={{ fontSize:11,color:"#6b7280" }}>Artículo nuevo</div>
 </div>
 </div>
 )}
 </div>
 )}
 {confirmar && (
 <div style={{ background:"#1c1708",border:"1.5px solid #f59e0b44",borderRadius:12,pad <p style={{ fontSize:13,color:"#f59e0b",fontWeight:600,marginBottom:10 }}>⚠ "{confi
 <p style={{ fontSize:12,color:"#94a3b8",marginBottom:12 }}>¿Confirmas usar este art <div style={{ display:"flex",gap:8 }}>
 <button className="btn ghost" style={{ flex:1,padding:"8px",fontSize:12 }} onClic <button className="btn gold" style={{ flex:1,padding:"8px",fontSize:12 }} onClick </div>
 </div>
 )}
 </div>
 );
}
function NuevoTab({ sucursales, onSubmit, showToast, inventario, sucByName }) {
 const init = { tipo:"compra_directa",origen:"",destino:"",articulo:"",cantidad:"1",categori const [form, setForm] = useState(init);
 const [errs, setErrs] = useState({});
 const [saving, setSaving] = useState(false);
 const [done, setDone] = useState(false);
 const set = (k,v)=>{ setForm(p=>({...p,[k]:v})); setErrs(e=>({...e,[k]:undefined})); };
 const validate = ()=>{
 const e={};
 if (!form.articulo.trim()) e.articulo="Requerido";
 if (!form.cantidad||Number(form.cantidad)<1) e.cantidad="Mín 1";
 if (form.tipo==="compra_directa"&&!form.destino) e.destino="Requerido";
 if (form.tipo==="traslado_directo"){ if (!form.origen) e.origen="Requerido"; if (!form.de if (form.tipo==="traslado_tes"&&form.fase==="entrada"&&!form.origen) e.origen="Requerido" if (form.tipo==="traslado_tes"&&form.fase==="salida"&&!form.destino) e.destino="Requerido return e;
 };
 const submit = async()=>{
 const e=validate(); if (Object.keys(e).length){ setErrs(e); showToast("Completa los campo setSaving(true); const ok=await onSubmit(form); setSaving(false);
 if (ok){ setDone(true); setTimeout(()=>{ setDone(false); setForm(init); setErrs({}); },22 };
 if (done) return (
 <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"c <div style={{ width:70,height:70,background:"#14532d",borderRadius:"50%",display:"flex" <p style={{ fontSize:20,fontWeight:700,color:"#22c55e",fontFamily:"'Space Grotesk',sans </div>
 );
 const needsOrigen=form.tipo==="traslado_directo"||(form.tipo==="traslado_tes"&&form.fase=== const needsDestino=form.tipo==="compra_directa"||form.tipo==="traslado_directo"||(form.tipo return (
 <div style={{ display:"flex",flexDirection:"column",gap:14,maxWidth:560,margin:"0 auto" } <div className="card">
 <p className="st">Tipo de Movimiento</p>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
 {TIPOS.map(t=>(
 <button key={t.id} onClick={()=>set("tipo",t.id)} style={{ background:form.tipo== <span style={{ fontSize:22 }}>{t.icon}</span>
 <span style={{ fontSize:11,fontWeight:600,textAlign:"center",lineHeight:1.3 }}> <span style={{ fontSize:10,color:form.tipo===t.id?"#d97706":"#4b5563",textAlign </button>
 ))}
 </div>
 </div>
 {form.tipo==="traslado_tes"&&(
 <div className="card">
 <p className="st">Fase</p>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
 {[{v:"entrada",l:"Entrada al Almacén",ic:" ",d:"Viene de sucursal"},{v:"salida", <button key={f.v} onClick={()=>set("fase",f.v)} style={{ background:form.fase== <span style={{ fontSize:22 }}>{f.ic}</span><span style={{ fontSize:11,fontWei </button>
 ))}
 </div>
 </div>
 )}
 <div className="card" style={{ display:"flex",flexDirection:"column",gap:14 }}>
 <p className="st">Detalles</p>
 {needsOrigen&&(<div className="field"><label>Origen {errs.origen&&<span style={{ colo {needsDestino&&(<div className="field"><label>Destino {errs.destino&&<span style={{ c <div className="field">
 <label>Artículo {errs.articulo&&<span style={{ color:"#ef4444" }}>— {errs.articulo} <ArticuloBuscador
 sucursalNombre={form.tipo==="compra_directa"||(form.tipo==="traslado_tes"&&form.f inventario={inventario}
 sucByName={sucByName}
 value={form.articulo}
 error={!!errs.articulo}
 onChange={v=>set("articulo",v)}
 onSelect={item=>{ if(item.articulo){ set("articulo",item.articulo); if(item.codig />
 </div>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
 <div className="field"><label>Cantidad {errs.cantidad&&<span style={{ color:"#ef444 <div className="field"><label>Estado</label><select value={form.estado} onChange={e </div>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
 <div className="field"><label>Categoría</label><select value={form.categoria} onCha <div className="field"><label>Marca / Modelo</label><input type="text" placeholder= </div>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
 <div className="field"><label>Código Activo</label><input type="text" placeholder="
 <div className="field"><label>Observaciones</label><input type="text" placeholder=" </div>
 <button className="btn gold" style={{ width:"100%",marginTop:4 }} onClick={submit} di {saving?<><Spin size={18}/> Guardando...</>:"Registrar Movimiento"}
 </button>
 </div>
 </div>
 );
}
// ─── INVENTARIO ───────────────────────────────────────────────
function InvTab({ inventario, sucursales, sucMap, onSave, onDelete, loading }) {
 const [sucId, setSucId] = useState(sucursales[0]?.id||"");
 const [filtCateg, setFiltCateg] = useState("");
 const [filtEstado, setFiltEstado] = useState("");
 const [modal, setModal] = useState(null);
 const suc = sucursales.find(s=>s.id===sucId);
 const items = (inventario[sucId]||[]).filter(i=>{ if (filtCateg&&i.categoria!==filtCateg) r const totalUnids = (inventario[sucId]||[]).reduce((s,i)=>s+(i.cantidad||0),0);
 useEffect(()=>{ if (sucursales.length&&!sucId) setSucId(sucursales[0].id); },[sucursales,su return (
 <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
 <div className="card" style={{ padding:14 }}>
 <div className="field"><label>Sucursal</label><select value={sucId} onChange={e=>setS <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12 }}>
 <div className="field"><label>Categoría</label><select value={filtCateg} onChange={ <div className="field"><label>Estado</label><select value={filtEstado} onChange={e= </div>
 </div>
 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
 <div style={{ fontSize:12,color:"#6b7280" }}><span style={{ color:"#f59e0b",fontWeigh <button className="btn gold" style={{ padding:"8px 14px",fontSize:13 }} onClick={()=> </div>
 {loading?<div style={{ display:"flex",justifyContent:"center",padding:40 }}><Spin size= :items.length===0?<div className="card empty"><div style={{ fontSize:36,marginBottom:10 :items.map(item=>(
 <div key={item.id} className="card" style={{ padding:14 }}>
 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" <div style={{ flex:1,minWidth:0 }}>
 <div style={{ fontSize:14,fontWeight:600,marginBottom:5 }}>{item.articulo}</div <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
 {item.codigo&&<span className="tag">{item.codigo}</span>}
 <span className="tag">{item.categoria}</span>
 {item.marca&&item.marca!=="S/N"&&<span className="tag">{item.marca}</span>}
 </div>
 </div>
 <div style={{ textAlign:"right",flexShrink:0 }}>
 <div style={{ fontSize:26,fontWeight:800,color:"#f59e0b",fontFamily:"'Space Gro <div style={{ fontSize:10,color:"#6b7280",marginBottom:5 }}>und.</div>
 <Badge e={item.estado}/>
 </div>
 </div>
 <div className="div"/>
 <div style={{ display:"flex",gap:8 }}>
 <button className="btn ghost" style={{ flex:1,padding:"8px",fontSize:12 }} onClic <button className="btn danger" style={{ flex:1,padding:"8px",fontSize:12 }} onCli </div>
 </div>
 ))}
 {modal&&<ArticuloModal sucNombre={suc?.nombre||""} item={modal.item} onSave={item=>{ on </div>
 );
}
function ArticuloModal({ sucNombre, item, onSave, onClose }) {
 const [form, setForm] = useState(item||{articulo:"",cantidad:"1",categoria:"Maquinaria de C const [err, setErr] = useState({});
 const set=(k,v)=>{ setForm(p=>({...p,[k]:v})); setErr(e=>({...e,[k]:undefined})); };
 const save=()=>{ if (!form.articulo.trim()){ setErr({articulo:"Requerido"}); return; } onSa return (
 <Modal title={item?`Editar: ${item.articulo}`:`Agregar a ${sucNombre}`} onClose={onClose} <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
 <div className="field"><label>Artículo {err.articulo&&<span style={{ color:"#ef4444"  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
 <div className="field"><label>Cantidad</label><input type="number" min="0" value={f <div className="field"><label>Estado</label><select value={form.estado} onChange={e </div>
 <div className="field"><label>Categoría</label><select value={form.categoria} onChang <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
 <div className="field"><label>Código</label><input type="text" placeholder="G00XXX" <div className="field"><label>Marca</label><input type="text" placeholder="S/N" val </div>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4 }}>
 <button className="btn ghost" onClick={onClose}>Cancelar</button>
 <button className="btn gold" onClick={save}>{item?"Guardar":"Agregar"}</button>
 </div>
 </div>
 </Modal>
 );
}
// ─── HISTORIAL ────────────────────────────────────────────────
function HistTab({ movimientos, loading }) {
 const [filtTipo, setFiltTipo] = useState("");
 const [filtSuc, setFiltSuc] = useState("");
 const tipoL = { compra_directa:"Compra Directa",compra_tes:"Compra → Almacén",traslado_dire const faseL = { entrada:"Entrada a Almacén",salida:"Salida de Almacén" };
 const allSucs = [...new Set(movimientos.flatMap(m=>[m.origen_nombre,m.destino_nombre].filte const filtered = movimientos.filter(m=>{ if (filtTipo&&m.tipo!==filtTipo) return false; if  const fmt = iso=>{ const d=new Date(iso); return d.toLocaleDateString("es-DO",{day:"2-digit return (
 <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
 <div className="card" style={{ padding:14 }}>
 <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
 <div className="field"><label>Tipo</label><select value={filtTipo} onChange={e=>set <div className="field"><label>Sucursal</label><select value={filtSuc} onChange={e=> </div>
 </div>
 <div style={{ fontSize:12,color:"#6b7280" }}>{filtered.length} movimiento{filtered.leng {loading?<div style={{ display:"flex",justifyContent:"center",padding:40 }}><Spin size= :filtered.length===0?<div className="card empty"><div style={{ fontSize:36,marginBottom :filtered.map((m,i)=>{
 const tipo=TIPOS.find(t=>t.id===m.tipo);
 return (
 <div key={m.id||i} className="card" style={{ padding:14 }}>
 <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
 <div style={{ width:42,height:42,background:"#1a2235",borderRadius:10,display:" <div style={{ flex:1,minWidth:0 }}>
 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex- <div style={{ fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"el <div style={{ background:"#f59e0b18",color:"#f59e0b",border:"1px solid #f59 </div>
 <div style={{ fontSize:12,color:"#94a3b8",marginTop:3 }}>{tipoL[m.tipo]}{m.fa <div style={{ fontSize:11,color:"#6b7280",marginTop:5,display:"flex",flexWrap {m.origen_nombre&&<span>De: <b style={{ color:"#94a3b8" }}>{m.origen_nombre {m.destino_nombre&&<span>A: <b style={{ color:"#94a3b8" }}>{m.destino_nombr </div>
 <div style={{ fontSize:11,color:"#374151",marginTop:6 }}>{fmt(m.created_at)}< </div>
 </div>
 </div>
 );
 })}
 </div>
 );
}
// ─── BUSCAR ───────────────────────────────────────────────────
function BuscarTab({ inventario, sucMap }) {
 const [q, setQ] = useState("");
 const query = q.toLowerCase().trim();
 const results = !query?[]:Object.entries(inventario).flatMap(([sucId,items])=>
 items.filter(i=>i.articulo?.toLowerCase().includes(query)||i.codigo?.toLowerCase().includ .map(i=>({...i,sucursal:sucMap[sucId]||sucId}))
 );
 const grouped = results.reduce((acc,item)=>{ if (!acc[item.articulo]) acc[item.articulo]=[] return (
 <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
 <div className="card" style={{ padding:14 }}>
 <div style={{ position:"relative" }}>
 <div style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",co <input type="text" placeholder="Artículo, código, categoría, marca..." value={q} on style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,color: onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borde </div>
 </div>
 {query&&<div style={{ fontSize:12,color:"#6b7280" }}>{results.length} resultado{results {Object.entries(grouped).map(([art,items])=>{
 const totalU=items.reduce((s,i)=>s+(i.cantidad||0),0);
 return (
 <div key={art} className="card" style={{ padding:14 }}>
 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",m <div style={{ fontSize:15,fontWeight:700,color:"#f8fafc" }}>{art}</div>
 <div style={{ fontSize:14,fontWeight:800,color:"#f59e0b",fontFamily:"'Space Gro </div>
 {items.map((item,i)=>(
 <div key={i} className="row" style={{ marginBottom:i<items.length-1?7:0 }}>
 <div><div style={{ fontSize:13,fontWeight:500 }}>{item.sucursal}</div><div st <div style={{ display:"flex",alignItems:"center",gap:10 }}><Badge e={item.est </div>
 ))}
 </div>
 );
 })}
 {query&&results.length===0&&<div className="card empty"><div style={{ fontSize:36,margi {!query&&<div className="card empty"><div style={{ fontSize:36,marginBottom:10 }}> </d </div>
 );
}
// ─── CONFIG ───────────────────────────────────────────────────
function ConfigTab({ sucursales, inventario, onAdd, onRefresh }) {
 const [nombre, setNombre] = useState("");
 const [saving, setSaving] = useState(false);
 const add = async()=>{ if (!nombre.trim()) return; setSaving(true); await onAdd(nombre); se return (
 <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
 <div className="card">
 <p className="st">Nueva Sucursal</p>
 <div style={{ display:"flex",gap:10 }}>
 <input type="text" placeholder="Nombre de la sucursal..." value={nombre} onChange={ style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,color: onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borde <button className="btn gold" style={{ padding:"11px 16px" }} onClick={add} disabled </div>
 </div>
 <div className="card">
 <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",margi <p className="st" style={{ marginBottom:0 }}>Sucursales ({sucursales.length})</p>
 <button className="btn ghost" style={{ padding:"6px 12px",fontSize:12 }} onClick={o </div>
 {sucursales.map(s=>{
 const items=inventario[s.id]||[];
 const total=items.reduce((ss,i)=>ss+(i.cantidad||0),0);
 return (
 <div key={s.id} className="row" style={{ marginBottom:8 }}>
 <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:8 <div style={{ display:"flex",gap:14,alignItems:"center" }}><span style={{ fontS </div>
 );
 })}
 </div>
 </div>
 );
}
