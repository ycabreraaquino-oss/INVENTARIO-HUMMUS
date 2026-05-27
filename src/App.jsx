// ============================================================
// SABORES DEL DESIERTO - INVENTARIO
// Versión con Supabase + Login
// ============================================================

const SUPABASE_URL = "https://zbxoskebjsoronileppj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpieG9za2VianNvcm9uaWxlcHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjIxODEsImV4cCI6MjA5NTM5ODE4MX0.olPfHRTUaOGNv0a_n0ZlFJxW_kUNeFtMFluzrdjy95M";

import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CLIENT ──────────────────────────────────────────
const sb = {
  headers: { "Content-Type":"application/json", "apikey":SUPABASE_KEY, "Authorization":`Bearer ${SUPABASE_KEY}` },
  url: (table, qs="") => `${SUPABASE_URL}/rest/v1/${table}${qs}`,

  async get(table, qs="") {
    const r = await fetch(this.url(table, qs), { headers:{...this.headers,"Prefer":"return=representation"} });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async post(table, body) {
    const r = await fetch(this.url(table), { method:"POST", headers:{...this.headers,"Prefer":"return=representation"}, body:JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async patch(table, id, body) {
    const r = await fetch(this.url(table, `?id=eq.${id}`), { method:"PATCH", headers:{...this.headers,"Prefer":"return=representation"}, body:JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async delete(table, id) {
    const r = await fetch(this.url(table, `?id=eq.${id}`), { method:"DELETE", headers:this.headers });
    if (!r.ok) throw new Error(await r.text());
  },
  async login(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "apikey":SUPABASE_KEY },
      body:JSON.stringify({ email, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error_description || data.msg || "Error al iniciar sesión");
    return data;
  },
  async logout(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "apikey":SUPABASE_KEY, "Authorization":`Bearer ${token}` }
    });
  }
};

// ─── CONSTANTES ───────────────────────────────────────────────
const CATEGORIAS = [
  "Maquinaria de Cocina","Maquinaria de Frío","Utensilios Críticos",
  "Tecnología/Oficina","Utilidades/Servicios","Logística/Manejo","Seguridad","Operativos"
];
const ESTADOS = ["Bueno","Regular","Crítico","En Mantenimiento"];
const TIPOS = [
  { id:"compra_directa",   label:"Compra Directa",        desc:"Va directo a la sucursal",            icon:"🛒" },
  { id:"compra_tes",       label:"Compra a Almacén",       desc:"Entra al Almacén Principal",          icon:"📦" },
  { id:"traslado_directo", label:"Traslado Directo",       desc:"De sucursal A a sucursal B",          icon:"🔄" },
  { id:"traslado_tes",     label:"Traslado por Almacén",   desc:"Pasa por el Almacén Principal",       icon:"🏭" },
];

// ─── ICONS ────────────────────────────────────────────────────
const I = ({ n, s=20 }) => {
  const m = {
    home:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    transfer: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
    box:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>,
    history:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><polyline points="12 7 12 12 15 15"/></svg>,
    search:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    settings: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    plus:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    edit:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    check:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    close:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    refresh:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
    logout:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    print:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  };
  return m[n] || null;
};

const Badge = ({ e }) => {
  const c = { "Bueno":"#22c55e","Regular":"#f59e0b","Crítico":"#ef4444","En Mantenimiento":"#8b5cf6" }[e||"Bueno"]||"#94a3b8";
  return <span style={{ background:c+"22",color:c,border:`1px solid ${c}40`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>{e||"Bueno"}</span>;
};

const Toast = ({ msg, type, onClose }) => {
  const bg = { success:"#14532d", error:"#7f1d1d", warning:"#78350f", info:"#1e3a5f" }[type]||"#14532d";
  const ic = { success:"✓", error:"✕", warning:"⚠", info:"ℹ" }[type]||"✓";
  return (
    <div style={{ position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:bg,color:"#fff",padding:"12px 20px",borderRadius:12,fontSize:14,fontWeight:500,zIndex:9999,display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px #0009",maxWidth:"92vw",animation:"slideUp 0.25s ease" }}>
      <span>{ic}</span><span style={{ flex:1 }}>{msg}</span>
      <button onClick={onClose} style={{ background:"none",border:"none",color:"#fff9",cursor:"pointer",fontSize:18,padding:0,lineHeight:1 }}>×</button>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,background:"#000b",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={onClose}>
    <div style={{ background:"#0f1623",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:540,maxHeight:"92vh",overflow:"auto",padding:20,paddingBottom:36 }} onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <h3 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:"#f8fafc" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"#1a2235",border:"none",color:"#94a3b8",borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><I n="close" s={16}/></button>
      </div>
      {children}
    </div>
  </div>
);

const Spin = ({ size=24 }) => (
  <div style={{ width:size,height:size,border:`3px solid #1a2235`,borderTopColor:"#f59e0b",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }} />
);

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
    <div style={{ minHeight:"100vh",background:"#080d1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Space+Grotesk:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ width:"100%",maxWidth:400,animation:"fadeIn 0.4s ease" }}>
        <div style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ fontSize:48,marginBottom:12 }}>🌿</div>
          <p style={{ fontSize:11,color:"#6b7280",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:6 }}>Sabores del Desierto</p>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:700,color:"#f8fafc" }}>Control de Inventario</h1>
        </div>

        <div style={{ background:"#0f1623",border:"1px solid #1a2235",borderRadius:20,padding:24,display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <label style={{ fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.07em",textTransform:"uppercase" }}>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e=>{ setEmail(e.target.value); setError(""); }}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,color:"#e2e8f0",padding:"12px 14px",fontSize:14,fontFamily:"inherit",outline:"none",transition:"border-color 0.2s" }}
              onFocus={e=>e.target.style.borderColor="#f59e0b"}
              onBlur={e=>e.target.style.borderColor="#252f42"}
            />
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <label style={{ fontSize:11,fontWeight:600,color:"#6b7280",letterSpacing:"0.07em",textTransform:"uppercase" }}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e=>{ setPassword(e.target.value); setError(""); }}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,color:"#e2e8f0",padding:"12px 14px",fontSize:14,fontFamily:"inherit",outline:"none",transition:"border-color 0.2s" }}
              onFocus={e=>e.target.style.borderColor="#f59e0b"}
              onBlur={e=>e.target.style.borderColor="#252f42"}
            />
          </div>

          {error && (
            <div style={{ background:"#7f1d1d22",border:"1px solid #7f1d1d44",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#f87171" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#0a0e1a",border:"none",borderRadius:12,padding:"14px",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?0.7:1,marginTop:4 }}
          >
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
  const [sucMap, setSucMap]         = useState({});
  const [sucByName, setSucByName]   = useState({});
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);

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
      const origenId  = form.origen  ? sucByName[form.origen]  : null;
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
        const existing = (inventario[sucId]||[]).find(i=>i.articulo.toLowerCase().trim()===form.articulo.toLowerCase().trim());
        if (existing) {
          const newQty = Math.max(0, (existing.cantidad||0) + delta);
          await sb.patch("inventario", existing.id, { cantidad:newQty, updated_at:new Date().toISOString() });
        } else if (delta > 0) {
          await sb.post("inventario", { sucursal_id:sucId, articulo:form.articulo, codigo:form.codigo||"", categoria:form.categoria||"Operativos", cantidad:delta, marca:form.marca||"S/N", estado:form.estado||"Bueno" });
        }
      };
      if (form.tipo==="compra_directa")  { await upsertItem(destinoId, qty); }
      else if (form.tipo==="compra_tes") { await upsertItem(almacenId, qty); }
      else if (form.tipo==="traslado_directo") { await upsertItem(origenId, -qty); await upsertItem(destinoId, qty); }
      else if (form.tipo==="traslado_tes") {
        if (form.fase==="entrada") { await upsertItem(origenId, -qty); await upsertItem(almacenId, qty); }
        else { await upsertItem(almacenId, -qty); await upsertItem(destinoId, qty); }
      }
      await loadAll();
      showToast("Movimiento registrado correctamente");
      return true;
    } catch(err) { showToast("Error al registrar: "+err.message, "error"); return false; }
  };

  const saveArticulo = async (sucId, item) => {
    try {
      if (item.id) {
        await sb.patch("inventario", item.id, { articulo:item.articulo, codigo:item.codigo||"", categoria:item.categoria, cantidad:Number(item.cantidad)||0, marca:item.marca||"S/N", estado:item.estado||"Bueno" });
        showToast("Artículo actualizado");
      } else {
        const existing = (inventario[sucId]||[]).find(i=>i.articulo.toLowerCase().trim()===item.articulo.toLowerCase().trim());
        if (existing) {
          await sb.patch("inventario", existing.id, { cantidad:Number(item.cantidad)||0, estado:item.estado||"Bueno", marca:item.marca||"S/N", codigo:item.codigo||"", categoria:item.categoria });
          showToast("Artículo actualizado");
        } else {
          await sb.post("inventario", { sucursal_id:sucId, articulo:item.articulo, codigo:item.codigo||"", categoria:item.categoria||"Operativos", cantidad:Number(item.cantidad)||0, marca:item.marca||"S/N", estado:item.estado||"Bueno" });
          showToast("Artículo agregado");
        }
      }
      await loadAll();
    } catch(err) { showToast("Error: "+err.message,"error"); }
  };

  const deleteArticulo = async (id) => {
    try { await sb.delete("inventario", id); await loadAll(); showToast("Artículo eliminado"); }
    catch(err) { showToast("Error: "+err.message,"error"); }
  };

  const addSucursal = async (nombre) => {
    const trimmed = nombre.trim();
    if (!trimmed) return;
    if (sucursales.find(s=>s.nombre===trimmed)) { showToast("Esa sucursal ya existe","warning"); return; }
    try {
      await sb.post("sucursales", { nombre:trimmed });
      await loadAll();
      showToast(`Sucursal "${trimmed}" creada`);
    } catch(err) { showToast("Error: "+err.message,"error"); }
  };

  const tabs = [
    { id:"home",      label:"Inicio",    n:"home" },
    { id:"nuevo",     label:"Registro",  n:"transfer" },
    { id:"inventario",label:"Inventario",n:"box" },
    { id:"historial", label:"Historial", n:"history" },
    { id:"buscar",    label:"Buscar",    n:"search" },
  ];

  const userEmail = session?.user?.email || "";

  return (
    <div style={{ minHeight:"100vh",background:"#080d1a",color:"#e2e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif",paddingBottom:72 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#080d1a}::-webkit-scrollbar-thumb{background:#1f2937;border-radius:4px}
        input,select,textarea{outline:none}
        @keyframes slideUp{from{transform:translateX(-50%) translateY(16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .card{background:#0f1623;border:1px solid #1a2235;border-radius:16px;padding:18px;animation:fadeIn 0.25s ease}
        .field{display:flex;flex-direction:column;gap:6px}
        .field label{font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.07em;text-transform:uppercase}
        .field input,.field select,.field textarea{background:#1a2235;border:1.5px solid #252f42;border-radius:10px;color:#e2e8f0;padding:11px 13px;font-size:14px;font-family:inherit;transition:border-color 0.2s;width:100%}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:#f59e0b}
        .field select option{background:#1a2235}
        .btn{border:none;border-radius:12px;padding:13px 18px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px}
        .btn:disabled{opacity:0.4;cursor:not-allowed}
        .gold{background:linear-gradient(135deg,#f59e0b,#d97706);color:#0a0e1a}
        .gold:hover:not(:disabled){opacity:0.88}
        .ghost{background:#1a2235;color:#94a3b8;border:1.5px solid #252f42}
        .ghost:hover{background:#252f42;color:#e2e8f0}
        .danger{background:#7f1d1d22;color:#f87171;border:1.5px solid #7f1d1d44}
        .danger:hover{background:#7f1d1d44}
        .tag{background:#1a2235;border:1px solid #252f42;border-radius:7px;padding:3px 9px;font-size:11px;color:#94a3b8}
        .row{display:flex;justify-content:space-between;align-items:center;background:#131d2e;border-radius:12px;padding:12px 14px;gap:10px}
        .st{font-size:12px;color:#94a3b8;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:12px}
        .empty{text-align:center;padding:40px 20px;color:#4b5563}
        .div{height:1px;background:#1a2235;margin:12px 0}
      `}</style>

      <div style={{ padding:"18px 16px 0",background:"linear-gradient(180deg,#0d1626,transparent)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:10,color:"#6b7280",letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600 }}>Sabores del Desierto</p>
            <h1 style={{ fontSize:20,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:"#f8fafc",lineHeight:1.2 }}>Control de Inventario</h1>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={loadAll} style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,padding:8,cursor:"pointer",color:loading?"#f59e0b":"#6b7280",display:"flex",alignItems:"center" }}>
              {loading ? <Spin size={18}/> : <I n="refresh" s={18}/>}
            </button>
            <button onClick={()=>setTab("config")} style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,padding:8,cursor:"pointer",color:tab==="config"?"#f59e0b":"#6b7280",display:"flex",alignItems:"center" }}>
              <I n="settings" s={18}/>
            </button>
            <button onClick={()=>window.print()} title="Imprimir" style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,padding:8,cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center" }}><I n="print" s={18}/></button>
            <button onClick={handleLogout} title="Cerrar sesión" style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,padding:8,cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center" }}>
              <I n="logout" s={18}/>
            </button>
          </div>
        </div>
        <div style={{ marginTop:6,marginBottom:2,display:"flex",alignItems:"center",gap:6 }}>
          <div style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e" }}/>
          <span style={{ fontSize:11,color:"#374151" }}>{userEmail}</span>
        </div>
      </div>

      <div style={{ padding:"12px 14px 0" }}>
        {tab==="home"       && <HomeTab inventario={inventario} movimientos={movimientos} sucMap={sucMap} sucursales={sucursales} setTab={setTab} loading={loading}/>}
        {tab==="nuevo"      && <NuevoTab sucursales={sucursales.map(s=>s.nombre)} onSubmit={addMovimiento} showToast={showToast} inventario={inventario} sucByName={sucByName}/>}
        {tab==="inventario" && <InvTab inventario={inventario} sucursales={sucursales} sucMap={sucMap} onSave={saveArticulo} onDelete={deleteArticulo} loading={loading}/>}
        {tab==="historial"  && <HistTab movimientos={movimientos} loading={loading}/>}
        {tab==="buscar"     && <BuscarTab inventario={inventario} sucMap={sucMap}/>}
        {tab==="config"     && <ConfigTab sucursales={sucursales} inventario={inventario} onAdd={addSucursal} onRefresh={loadAll}/>}
      </div>

      <div style={{ position:"fixed",bottom:0,left:0,right:0,background:"#0d1220",borderTop:"1px solid #1a2235",display:"flex",justifyContent:"space-around",padding:"8px 0 8px",zIndex:100 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 6px",color:tab===t.id?"#f59e0b":"#374151",transition:"color 0.2s",minWidth:50 }}>
            <I n={t.n} s={22}/>
            <span style={{ fontSize:9.5,fontWeight:tab===t.id?700:500,letterSpacing:"0.04em" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────
function HomeTab({ inventario, movimientos, sucMap, sucursales, setTab, loading }) {
  const allItems   = Object.values(inventario).flat();
  const totalUnids = allItems.reduce((s,i)=>s+(i.cantidad||0),0);
  const criticos   = allItems.filter(i=>i.estado==="Crítico").map(i=>({...i,sucursal:sucMap[i.sucursal_id]||"?"}));
  const movHoy     = movimientos.filter(m=>new Date(m.created_at).toDateString()===new Date().toDateString()).length;
  const tipoL      = { compra_directa:"Compra Directa",compra_tes:"Compra → Almacén",traslado_directo:"Traslado Directo",traslado_tes:"Traslado por Almacén" };
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
        {[{l:"Artículos",v:allItems.length,c:"#f59e0b"},{l:"Unidades",v:totalUnids,c:"#60a5fa"},{l:"Mov. Hoy",v:movHoy,c:"#34d399"}].map(s=>(
          <div key={s.l} className="card" style={{ padding:12,textAlign:"center" }}>
            {loading?<div style={{ display:"flex",justifyContent:"center",padding:"6px 0" }}><Spin size={20}/></div>:<div style={{ fontSize:24,fontWeight:800,color:s.c,fontFamily:"'Space Grotesk',sans-serif" }}>{s.v}</div>}
            <div style={{ fontSize:10,color:"#6b7280",marginTop:2,lineHeight:1.3 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="st">Acciones Rápidas</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
          {TIPOS.map(t=>(
            <button key={t.id} onClick={()=>setTab("nuevo")} className="btn ghost" style={{ flexDirection:"column",gap:6,padding:"14px 10px",height:"auto" }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:11,textAlign:"center",lineHeight:1.3 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      {criticos.length>0&&(
        <div className="card" style={{ borderColor:"#450a0a" }}>
          <p className="st" style={{ color:"#ef4444" }}>⚠ Críticos ({criticos.length})</p>
          {criticos.slice(0,5).map((i,idx)=>(
            <div key={idx} className="row" style={{ marginBottom:idx<Math.min(criticos.length,5)-1?8:0 }}>
              <div><div style={{ fontSize:13,fontWeight:600 }}>{i.articulo}</div><div style={{ fontSize:11,color:"#6b7280" }}>{i.sucursal}</div></div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:12,color:"#f59e0b",fontWeight:700 }}>{i.cantidad}</span><Badge e={i.estado}/></div>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <p className="st">Sucursales ({sucursales.length})</p>
        {sucursales.slice(0,6).map(s=>{
          const items=inventario[s.id]||[];
          const total=items.reduce((ss,i)=>ss+(i.cantidad||0),0);
          return (
            <div key={s.id} className="row" style={{ marginBottom:8 }}>
              <span style={{ fontSize:13,fontWeight:500 }}>{s.nombre}</span>
              <div style={{ display:"flex",gap:12 }}><span style={{ fontSize:11,color:"#6b7280" }}>{items.length} art.</span><span style={{ fontSize:13,fontWeight:700,color:"#f59e0b" }}>{total}</span></div>
            </div>
          );
        })}
      </div>
      {movimientos.length>0&&(
        <div className="card">
          <p className="st">Últimos Movimientos</p>
          {movimientos.slice(0,4).map((m,i)=>{
            const tipo=TIPOS.find(t=>t.id===m.tipo);
            return (
              <div key={i} style={{ display:"flex",gap:10,alignItems:"center",marginBottom:i<3?10:0 }}>
                <div style={{ width:38,height:38,background:"#1a2235",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{tipo?.icon||"📋"}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.articulo}</div>
                  <div style={{ fontSize:11,color:"#6b7280" }}>{tipoL[m.tipo]} · {m.cantidad} und.</div>
                </div>
                <div style={{ fontSize:11,color:"#4b5563",flexShrink:0 }}>{new Date(m.created_at).toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── NUEVO MOVIMIENTO ─────────────────────────────────────────
function ArticuloBuscador({ sucursalNombre, inventario, sucByName, value, onChange, onSelect, error }) {
  const [q, setQ] = useState(value||"");
  const [open, setOpen] = useState(false);
  const [confirmar, setConfirmar] = useState(null); // { articulo, enOtra: [{sucursal,item}] }
  const ref = React.useRef();

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
      (i.articulo?.toLowerCase().includes(query) || i.codigo?.toLowerCase().includes(query)) &&
      !sugerencias.find(s => s.articulo?.toLowerCase() === i.articulo?.toLowerCase())
    ).slice(0, 5);

  const seleccionar = (item, forzar=false) => {
    if (!forzar && item._sucId !== sucId && item._sucId !== undefined) {
      // está en otra sucursal, no en la seleccionada
      const otherSucs = todosItems.filter(i => i.articulo?.toLowerCase() === item.articulo?.toLowerCase() && i._sucId !== sucId);
      if (otherSucs.length > 0) {
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
    onSelect({ articulo: q, codigo:"", categoria:"Maquinaria de Cocina", marca:"S/N", estado:"Bueno", _nuevo: true });
    setOpen(false);
    setConfirmar(null);
  };

  React.useEffect(() => {
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
          onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); setConfirmar(null); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(()=>setOpen(false), 200)}
          style={{ background:"#1a2235", border:`1.5px solid ${error?"#ef4444":"#252f42"}`, borderRadius:10, color:"#e2e8f0", padding:"11px 13px", fontSize:14, fontFamily:"inherit", width:"100%", outline:"none", transition:"border-color 0.2s", opacity:sucursalNombre?1:0.5 }}
          onFocus2={e=>e.target.style.borderColor="#f59e0b"}
        />
        {q && <button onClick={()=>{ setQ(""); onChange(""); onSelect({}); }} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:18,lineHeight:1 }}>×</button>}
      </div>

      {open && sucursalNombre && (sugerencias.length > 0 || enOtras.length > 0 || q.trim()) && (
        <div style={{ position:"absolute",top:"100%",left:0,right:0,background:"#0f1623",border:"1.5px solid #252f42",borderRadius:12,zIndex:200,maxHeight:280,overflow:"auto",marginTop:4,boxShadow:"0 8px 32px #0008" }}>
          {sugerencias.length > 0 && (
            <>
              <div style={{ fontSize:10,color:"#4b5563",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",padding:"10px 14px 6px" }}>En {sucursalNombre}</div>
              {sugerencias.map((item,i) => (
                <div key={i} onMouseDown={()=>seleccionar(item)} style={{ padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #1a2235",display:"flex",justifyContent:"space-between",alignItems:"center" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#1a2235"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{item.articulo}</div>
                    <div style={{ fontSize:11,color:"#6b7280" }}>{item.categoria}{item.codigo?` · ${item.codigo}`:""}</div>
                  </div>
                  <span style={{ fontSize:13,fontWeight:700,color:"#f59e0b" }}>{item.cantidad} und.</span>
                </div>
              ))}
            </>
          )}
          {enOtras.length > 0 && (
            <>
              <div style={{ fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",padding:"10px 14px 6px" }}>En otras sucursales</div>
              {enOtras.map((item,i) => (
                <div key={i} onMouseDown={()=>seleccionar(item)} style={{ padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #1a2235",display:"flex",justifyContent:"space-between",alignItems:"center",opacity:0.8 }}
                  onMouseEnter={e=>e.currentTarget.style.background="#1a2235"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div>
                    <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{item.articulo}</div>
                    <div style={{ fontSize:11,color:"#f59e0b" }}>⚠ No está en {sucursalNombre}</div>
                  </div>
                  <span style={{ fontSize:13,fontWeight:700,color:"#f59e0b" }}>{item.cantidad} und.</span>
                </div>
              ))}
            </>
          )}
          {q.trim() && sugerencias.length === 0 && (
            <div onMouseDown={crearNuevo} style={{ padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10 }}
              onMouseEnter={e=>e.currentTarget.style.background="#1a2235"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ width:28,height:28,background:"#f59e0b22",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#f59e0b",fontSize:18 }}>+</div>
              <div>
                <div style={{ fontSize:13,fontWeight:600,color:"#f59e0b" }}>Crear "{q}"</div>
                <div style={{ fontSize:11,color:"#6b7280" }}>Artículo nuevo</div>
              </div>
            </div>
          )}
        </div>
      )}

      {confirmar && (
        <div style={{ background:"#1c1708",border:"1.5px solid #f59e0b44",borderRadius:12,padding:14,marginTop:8 }}>
          <p style={{ fontSize:13,color:"#f59e0b",fontWeight:600,marginBottom:10 }}>⚠ "{confirmar.articulo}" no está en {sucursalNombre}</p>
          <p style={{ fontSize:12,color:"#94a3b8",marginBottom:12 }}>¿Confirmas usar este artículo de todas formas? Se creará en {sucursalNombre} si no existe.</p>
          <div style={{ display:"flex",gap:8 }}>
            <button className="btn ghost" style={{ flex:1,padding:"8px",fontSize:12 }} onClick={()=>setConfirmar(null)}>Cancelar</button>
            <button className="btn gold" style={{ flex:1,padding:"8px",fontSize:12 }} onClick={()=>seleccionar(confirmar.item, true)}>Confirmar</button>
          </div>
        </div>
      )}
    </div>
  );
}


function NuevoTab({ sucursales, onSubmit, showToast, inventario, sucByName }) {
  const init = { tipo:"compra_directa",origen:"",destino:"",articulo:"",cantidad:"1",categoria:"Maquinaria de Cocina",marca:"",estado:"Bueno",observaciones:"",fase:"salida",codigo:"" };
  const [form, setForm] = useState(init);
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k,v)=>{ setForm(p=>({...p,[k]:v})); setErrs(e=>({...e,[k]:undefined})); };
  const validate = ()=>{
    const e={};
    if (!form.articulo.trim()) e.articulo="Requerido";
    if (!form.cantidad||Number(form.cantidad)<1) e.cantidad="Mín 1";
    if (form.tipo==="compra_directa"&&!form.destino) e.destino="Requerido";
    if (form.tipo==="traslado_directo"){ if (!form.origen) e.origen="Requerido"; if (!form.destino) e.destino="Requerido"; if (form.origen&&form.destino&&form.origen===form.destino) e.destino="≠ al origen"; }
    if (form.tipo==="traslado_tes"&&form.fase==="entrada"&&!form.origen) e.origen="Requerido";
    if (form.tipo==="traslado_tes"&&form.fase==="salida"&&!form.destino) e.destino="Requerido";
    return e;
  };
  const submit = async()=>{
    const e=validate(); if (Object.keys(e).length){ setErrs(e); showToast("Completa los campos requeridos","error"); return; }
    setSaving(true); const ok=await onSubmit(form); setSaving(false);
    if (ok){ setDone(true); setTimeout(()=>{ setDone(false); setForm(init); setErrs({}); },2200); }
  };
  if (done) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:320,gap:14,animation:"fadeIn 0.3s ease" }}>
      <div style={{ width:70,height:70,background:"#14532d",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center" }}><I n="check" s={34}/></div>
      <p style={{ fontSize:20,fontWeight:700,color:"#22c55e",fontFamily:"'Space Grotesk',sans-serif" }}>¡Guardado en la nube!</p>
    </div>
  );
  const needsOrigen=form.tipo==="traslado_directo"||(form.tipo==="traslado_tes"&&form.fase==="entrada");
  const needsDestino=form.tipo==="compra_directa"||form.tipo==="traslado_directo"||(form.tipo==="traslado_tes"&&form.fase==="salida");
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14,maxWidth:560,margin:"0 auto" }}>
      <div className="card">
        <p className="st">Tipo de Movimiento</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
          {TIPOS.map(t=>(
            <button key={t.id} onClick={()=>set("tipo",t.id)} style={{ background:form.tipo===t.id?"#1c1708":"#1a2235",border:`2px solid ${form.tipo===t.id?"#f59e0b":"#252f42"}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",color:form.tipo===t.id?"#f59e0b":"#94a3b8",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all 0.2s",fontFamily:"inherit" }}>
              <span style={{ fontSize:22 }}>{t.icon}</span>
              <span style={{ fontSize:11,fontWeight:600,textAlign:"center",lineHeight:1.3 }}>{t.label}</span>
              <span style={{ fontSize:10,color:form.tipo===t.id?"#d97706":"#4b5563",textAlign:"center",lineHeight:1.3 }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>
      {form.tipo==="traslado_tes"&&(
        <div className="card">
          <p className="st">Fase</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:9 }}>
            {[{v:"entrada",l:"Entrada al Almacén",ic:"⬇️",d:"Viene de sucursal"},{v:"salida",l:"Salida del Almacén",ic:"⬆️",d:"Va a sucursal"}].map(f=>(
              <button key={f.v} onClick={()=>set("fase",f.v)} style={{ background:form.fase===f.v?"#0c1a2e":"#1a2235",border:`2px solid ${form.fase===f.v?"#60a5fa":"#252f42"}`,borderRadius:12,padding:"12px 8px",cursor:"pointer",color:form.fase===f.v?"#60a5fa":"#94a3b8",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all 0.2s",fontFamily:"inherit" }}>
                <span style={{ fontSize:22 }}>{f.ic}</span><span style={{ fontSize:11,fontWeight:600,textAlign:"center" }}>{f.l}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="card" style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <p className="st">Detalles</p>
        {needsOrigen&&(<div className="field"><label>Origen {errs.origen&&<span style={{ color:"#ef4444" }}>— {errs.origen}</span>}</label><select value={form.origen} onChange={e=>set("origen",e.target.value)}><option value="">Seleccionar...</option>{sucursales.filter(s=>s!=="Almacén Principal").map(s=><option key={s} value={s}>{s}</option>)}</select></div>)}
        {needsDestino&&(<div className="field"><label>Destino {errs.destino&&<span style={{ color:"#ef4444" }}>— {errs.destino}</span>}</label><select value={form.destino} onChange={e=>set("destino",e.target.value)}><option value="">Seleccionar...</option>{sucursales.filter(s=>(form.tipo==="traslado_tes"||form.tipo==="traslado_directo")?s!=="Almacén Principal"&&s!==form.origen:s!==form.origen).map(s=><option key={s} value={s}>{s}</option>)}</select></div>)}
        <div className="field">
          <label>Artículo {errs.articulo&&<span style={{ color:"#ef4444" }}>— {errs.articulo}</span>}</label>
          <ArticuloBuscador
            sucursalNombre={form.tipo==="compra_directa"||(form.tipo==="traslado_tes"&&form.fase==="salida") ? form.destino : form.origen}
            inventario={inventario}
            sucByName={sucByName}
            value={form.articulo}
            error={!!errs.articulo}
            onChange={v=>set("articulo",v)}
            onSelect={item=>{ if(item.articulo){ set("articulo",item.articulo); if(item.codigo) set("codigo",item.codigo||""); if(item.categoria) set("categoria",item.categoria||"Maquinaria de Cocina"); if(item.marca) set("marca",item.marca||""); if(item.estado) set("estado",item.estado||"Bueno"); } }}
          />
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div className="field"><label>Cantidad {errs.cantidad&&<span style={{ color:"#ef4444" }}>— {errs.cantidad}</span>}</label><input type="number" min="1" value={form.cantidad} onChange={e=>set("cantidad",e.target.value)}/></div>
          <div className="field"><label>Estado</label><select value={form.estado} onChange={e=>set("estado",e.target.value)}>{ESTADOS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div className="field"><label>Categoría</label><select value={form.categoria} onChange={e=>set("categoria",e.target.value)}>{CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="field"><label>Marca / Modelo</label><input type="text" placeholder="S/N" value={form.marca} onChange={e=>set("marca",e.target.value)}/></div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div className="field"><label>Código Activo</label><input type="text" placeholder="G00XXX" value={form.codigo} onChange={e=>set("codigo",e.target.value)}/></div>
          <div className="field"><label>Observaciones</label><input type="text" placeholder="Opcional..." value={form.observaciones} onChange={e=>set("observaciones",e.target.value)}/></div>
        </div>
        <button className="btn gold" style={{ width:"100%",marginTop:4 }} onClick={submit} disabled={saving}>
          {saving?<><Spin size={18}/> Guardando...</>:"Registrar Movimiento"}
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
  const items = (inventario[sucId]||[]).filter(i=>{ if (filtCateg&&i.categoria!==filtCateg) return false; if (filtEstado&&i.estado!==filtEstado) return false; return true; }).sort((a,b)=>a.articulo.localeCompare(b.articulo));
  const totalUnids = (inventario[sucId]||[]).reduce((s,i)=>s+(i.cantidad||0),0);
  useEffect(()=>{ if (sucursales.length&&!sucId) setSucId(sucursales[0].id); },[sucursales,sucId]);
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div className="card" style={{ padding:14 }}>
        <div className="field"><label>Sucursal</label><select value={sucId} onChange={e=>setSucId(e.target.value)}>{sucursales.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12 }}>
          <div className="field"><label>Categoría</label><select value={filtCateg} onChange={e=>setFiltCateg(e.target.value)}><option value="">Todas</option>{CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="field"><label>Estado</label><select value={filtEstado} onChange={e=>setFiltEstado(e.target.value)}><option value="">Todos</option>{ESTADOS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:12,color:"#6b7280" }}><span style={{ color:"#f59e0b",fontWeight:700 }}>{items.length}</span> artículos · <span style={{ color:"#60a5fa",fontWeight:700 }}>{totalUnids}</span> und.</div>
        <button className="btn gold" style={{ padding:"8px 14px",fontSize:13 }} onClick={()=>setModal({})}><I n="plus" s={16}/> Agregar</button>
      </div>
      {loading?<div style={{ display:"flex",justifyContent:"center",padding:40 }}><Spin size={32}/></div>
      :items.length===0?<div className="card empty"><div style={{ fontSize:36,marginBottom:10 }}>📦</div><p style={{ fontWeight:600,marginBottom:6 }}>Sin artículos</p></div>
      :items.map(item=>(
        <div key={item.id} className="card" style={{ padding:14 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:14,fontWeight:600,marginBottom:5 }}>{item.articulo}</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {item.codigo&&<span className="tag">{item.codigo}</span>}
                <span className="tag">{item.categoria}</span>
                {item.marca&&item.marca!=="S/N"&&<span className="tag">{item.marca}</span>}
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ fontSize:26,fontWeight:800,color:"#f59e0b",fontFamily:"'Space Grotesk',sans-serif",lineHeight:1 }}>{item.cantidad}</div>
              <div style={{ fontSize:10,color:"#6b7280",marginBottom:5 }}>und.</div>
              <Badge e={item.estado}/>
            </div>
          </div>
          <div className="div"/>
          <div style={{ display:"flex",gap:8 }}>
            <button className="btn ghost" style={{ flex:1,padding:"8px",fontSize:12 }} onClick={()=>setModal({item})}><I n="edit" s={14}/> Editar</button>
            <button className="btn danger" style={{ flex:1,padding:"8px",fontSize:12 }} onClick={()=>onDelete(item.id)}><I n="trash" s={14}/> Eliminar</button>
          </div>
        </div>
      ))}
      {modal&&<ArticuloModal sucNombre={suc?.nombre||""} item={modal.item} onSave={item=>{ onSave(sucId,item); setModal(null); }} onClose={()=>setModal(null)}/>}
    </div>
  );
}

function ArticuloModal({ sucNombre, item, onSave, onClose }) {
  const [form, setForm] = useState(item||{articulo:"",cantidad:"1",categoria:"Maquinaria de Cocina",marca:"",estado:"Bueno",codigo:""});
  const [err, setErr] = useState({});
  const set=(k,v)=>{ setForm(p=>({...p,[k]:v})); setErr(e=>({...e,[k]:undefined})); };
  const save=()=>{ if (!form.articulo.trim()){ setErr({articulo:"Requerido"}); return; } onSave({...form,cantidad:Number(form.cantidad)||0}); };
  return (
    <Modal title={item?`Editar: ${item.articulo}`:`Agregar a ${sucNombre}`} onClose={onClose}>
      <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
        <div className="field"><label>Artículo {err.articulo&&<span style={{ color:"#ef4444" }}>— {err.articulo}</span>}</label><input type="text" placeholder="Nombre..." value={form.articulo} onChange={e=>set("articulo",e.target.value)} autoFocus/></div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div className="field"><label>Cantidad</label><input type="number" min="0" value={form.cantidad} onChange={e=>set("cantidad",e.target.value)}/></div>
          <div className="field"><label>Estado</label><select value={form.estado} onChange={e=>set("estado",e.target.value)}>{ESTADOS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="field"><label>Categoría</label><select value={form.categoria} onChange={e=>set("categoria",e.target.value)}>{CATEGORIAS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div className="field"><label>Código</label><input type="text" placeholder="G00XXX" value={form.codigo} onChange={e=>set("codigo",e.target.value)}/></div>
          <div className="field"><label>Marca</label><input type="text" placeholder="S/N" value={form.marca} onChange={e=>set("marca",e.target.value)}/></div>
        </div>
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
  const [filtSuc, setFiltSuc]   = useState("");
  const tipoL = { compra_directa:"Compra Directa",compra_tes:"Compra → Almacén",traslado_directo:"Traslado Directo",traslado_tes:"Traslado por Almacén" };
  const faseL = { entrada:"Entrada a Almacén",salida:"Salida de Almacén" };
  const allSucs = [...new Set(movimientos.flatMap(m=>[m.origen_nombre,m.destino_nombre].filter(Boolean)))].sort();
  const filtered = movimientos.filter(m=>{ if (filtTipo&&m.tipo!==filtTipo) return false; if (filtSuc&&m.origen_nombre!==filtSuc&&m.destino_nombre!==filtSuc) return false; return true; });
  const fmt = iso=>{ const d=new Date(iso); return d.toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"})+" "+d.toLocaleTimeString("es-DO",{hour:"2-digit",minute:"2-digit"}); };
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div className="card" style={{ padding:14 }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <div className="field"><label>Tipo</label><select value={filtTipo} onChange={e=>setFiltTipo(e.target.value)}><option value="">Todos</option>{TIPOS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
          <div className="field"><label>Sucursal</label><select value={filtSuc} onChange={e=>setFiltSuc(e.target.value)}><option value="">Todas</option>{allSucs.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
      </div>
      <div style={{ fontSize:12,color:"#6b7280" }}>{filtered.length} movimiento{filtered.length!==1?"s":""}</div>
      {loading?<div style={{ display:"flex",justifyContent:"center",padding:40 }}><Spin size={32}/></div>
      :filtered.length===0?<div className="card empty"><div style={{ fontSize:36,marginBottom:10 }}>📋</div><p>Sin movimientos</p></div>
      :filtered.map((m,i)=>{
        const tipo=TIPOS.find(t=>t.id===m.tipo);
        return (
          <div key={m.id||i} className="card" style={{ padding:14 }}>
            <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
              <div style={{ width:42,height:42,background:"#1a2235",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{tipo?.icon||"📋"}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                  <div style={{ fontSize:14,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>{m.articulo}</div>
                  <div style={{ background:"#f59e0b18",color:"#f59e0b",border:"1px solid #f59e0b30",borderRadius:8,padding:"2px 10px",fontSize:13,fontWeight:700,flexShrink:0 }}>{m.cantidad} und.</div>
                </div>
                <div style={{ fontSize:12,color:"#94a3b8",marginTop:3 }}>{tipoL[m.tipo]}{m.fase?` · ${faseL[m.fase]}`:""}</div>
                <div style={{ fontSize:11,color:"#6b7280",marginTop:5,display:"flex",flexWrap:"wrap",gap:"4px 14px" }}>
                  {m.origen_nombre&&<span>De: <b style={{ color:"#94a3b8" }}>{m.origen_nombre}</b></span>}
                  {m.destino_nombre&&<span>A: <b style={{ color:"#94a3b8" }}>{m.destino_nombre}</b></span>}
                </div>
                <div style={{ fontSize:11,color:"#374151",marginTop:6 }}>{fmt(m.created_at)}</div>
              </div>
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
    items.filter(i=>i.articulo?.toLowerCase().includes(query)||i.codigo?.toLowerCase().includes(query)||i.categoria?.toLowerCase().includes(query)||i.marca?.toLowerCase().includes(query))
    .map(i=>({...i,sucursal:sucMap[sucId]||sucId}))
  );
  const grouped = results.reduce((acc,item)=>{ if (!acc[item.articulo]) acc[item.articulo]=[]; acc[item.articulo].push(item); return acc; },{});
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div className="card" style={{ padding:14 }}>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"#6b7280",pointerEvents:"none" }}><I n="search" s={17}/></div>
          <input type="text" placeholder="Artículo, código, categoría, marca..." value={q} onChange={e=>setQ(e.target.value)} autoFocus
            style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,color:"#e2e8f0",padding:"12px 13px 12px 40px",fontSize:14,fontFamily:"inherit",width:"100%",outline:"none" }}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#252f42"}/>
        </div>
      </div>
      {query&&<div style={{ fontSize:12,color:"#6b7280" }}>{results.length} resultado{results.length!==1?"s":""}</div>}
      {Object.entries(grouped).map(([art,items])=>{
        const totalU=items.reduce((s,i)=>s+(i.cantidad||0),0);
        return (
          <div key={art} className="card" style={{ padding:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <div style={{ fontSize:15,fontWeight:700,color:"#f8fafc" }}>{art}</div>
              <div style={{ fontSize:14,fontWeight:800,color:"#f59e0b",fontFamily:"'Space Grotesk',sans-serif" }}>{totalU} und.</div>
            </div>
            {items.map((item,i)=>(
              <div key={i} className="row" style={{ marginBottom:i<items.length-1?7:0 }}>
                <div><div style={{ fontSize:13,fontWeight:500 }}>{item.sucursal}</div><div style={{ fontSize:11,color:"#6b7280",marginTop:2 }}>{item.categoria}</div></div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}><Badge e={item.estado}/><div style={{ fontSize:20,fontWeight:800,color:"#f59e0b",fontFamily:"'Space Grotesk',sans-serif",minWidth:28,textAlign:"right" }}>{item.cantidad}</div></div>
              </div>
            ))}
          </div>
        );
      })}
      {query&&results.length===0&&<div className="card empty"><div style={{ fontSize:36,marginBottom:10 }}>🔍</div><p>Sin resultados para "{q}"</p></div>}
      {!query&&<div className="card empty"><div style={{ fontSize:36,marginBottom:10 }}>🔍</div><p style={{ fontSize:14 }}>Busca en todas las sucursales</p></div>}
    </div>
  );
}

// ─── CONFIG ───────────────────────────────────────────────────
function ConfigTab({ sucursales, inventario, onAdd, onRefresh }) {
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const add = async()=>{ if (!nombre.trim()) return; setSaving(true); await onAdd(nombre); setNombre(""); setSaving(false); };
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div className="card">
        <p className="st">Nueva Sucursal</p>
        <div style={{ display:"flex",gap:10 }}>
          <input type="text" placeholder="Nombre de la sucursal..." value={nombre} onChange={e=>setNombre(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
            style={{ background:"#1a2235",border:"1.5px solid #252f42",borderRadius:10,color:"#e2e8f0",padding:"11px 13px",fontSize:14,fontFamily:"inherit",flex:1,outline:"none" }}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#252f42"}/>
          <button className="btn gold" style={{ padding:"11px 16px" }} onClick={add} disabled={saving||!nombre.trim()}>{saving?<Spin size={18}/>:<I n="plus" s={18}/>}</button>
        </div>
      </div>
      <div className="card">
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <p className="st" style={{ marginBottom:0 }}>Sucursales ({sucursales.length})</p>
          <button className="btn ghost" style={{ padding:"6px 12px",fontSize:12 }} onClick={onRefresh}><I n="refresh" s={14}/> Actualizar</button>
        </div>
        {sucursales.map(s=>{
          const items=inventario[s.id]||[];
          const total=items.reduce((ss,i)=>ss+(i.cantidad||0),0);
          return (
            <div key={s.id} className="row" style={{ marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#22c55e",flexShrink:0 }}/><span style={{ fontSize:13,fontWeight:500 }}>{s.nombre}</span></div>
              <div style={{ display:"flex",gap:14,alignItems:"center" }}><span style={{ fontSize:11,color:"#6b7280" }}>{items.length} art.</span><span style={{ fontSize:12,fontWeight:700,color:"#f59e0b" }}>{total} und.</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
