import { useState, useEffect } from "react";

const CATEGORIAS = [
  { id: "supermercado", label: "Supermercado", emoji: "🛒", color: "#4CAF50" },
  { id: "servicios", label: "Servicios", emoji: "💡", color: "#2196F3" },
  { id: "colegio", label: "Colegio / Actividades", emoji: "📚", color: "#9C27B0" },
  { id: "salud", label: "Salud", emoji: "🏥", color: "#F44336" },
  { id: "casa", label: "Casa / Mantenimiento", emoji: "🏠", color: "#FF9800" },
  { id: "tarjeta", label: "Tarjeta", emoji: "💳", color: "#607D8B" },
  { id: "deporte", label: "Deporte", emoji: "🚴", color: "#00BCD4" },
  { id: "cenas", label: "Cenas", emoji: "🍽️", color: "#E91E63" },
  { id: "salidas", label: "Salidas", emoji: "🎭", color: "#FF5722" },
  { id: "cafe", label: "Café", emoji: "☕", color: "#8D6E63" },
  { id: "juani", label: "Mensual Juani", emoji: "👦", color: "#3F51B5" },
  { id: "otros", label: "Otros", emoji: "📦", color: "#795548" },
];

const MIEMBROS = ["Ana", "Miguel"];
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatARS(n) {
  return "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });
}

function getMesActual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function parseMes(key) {
  const [y, m] = key.split("-");
  return `${MESES[parseInt(m) - 1]} ${y}`;
}

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0d9d0",
  fontSize: 15, color: "#1a1a2e", background: "#f7f4ef", boxSizing: "border-box", outline: "none"
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, color: "#999",
  letterSpacing: 1, textTransform: "uppercase", marginBottom: 6
};

export default function App() {
  const [vista, setVista] = useState("dashboard");
  const [gastos, setGastos] = useState([]);
  const [empleada, setEmpleada] = useState({ nombre: "Empleada", salarioBase: 0, pagos: [] });
  const [mesSeleccionado, setMesSeleccionado] = useState(getMesActual());
  const [loading, setLoading] = useState(true);
  const [formGasto, setFormGasto] = useState({ monto: "", categoria: "supermercado", descripcion: "", quien: "Ana", fecha: new Date().toISOString().split("T")[0] });
  const [formPago, setFormPago] = useState({ monto: "", concepto: "Quincena", fecha: new Date().toISOString().split("T")[0] });
  const [formSalario, setFormSalario] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [editandoEmpleada, setEditandoEmpleada] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setLoading(true);
    try {
      const g = localStorage.getItem("gastos-familia");
      const e = localStorage.getItem("empleada-datos");
      if (g) setGastos(JSON.parse(g));
      if (e) {
        const ed = JSON.parse(e);
        setEmpleada(ed);
        setFormNombre(ed.nombre);
        setFormSalario(ed.salarioBase);
      }
    } catch (e) {}
    setLoading(false);
  }

  function showToast(msg, color = "#2e7d32") {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  }

  async function guardarGasto() {
    if (!formGasto.monto || isNaN(formGasto.monto)) return showToast("Ingresá un monto válido", "#c62828");
    const nuevo = { ...formGasto, id: Date.now(), monto: parseFloat(formGasto.monto) };
    const nuevos = [nuevo, ...gastos];
    setGastos(nuevos);
    localStorage.setItem("gastos-familia", JSON.stringify(nuevos));
    setFormGasto({ monto: "", categoria: formGasto.categoria, descripcion: "", quien: formGasto.quien, fecha: formGasto.fecha });
    showToast("Gasto registrado ✓");
  }

  async function eliminarGasto(id) {
    const nuevos = gastos.filter(g => g.id !== id);
    setGastos(nuevos);
    localStorage.setItem("gastos-familia", JSON.stringify(nuevos));
    showToast("Gasto eliminado", "#555");
  }

  async function guardarPagoEmpleada() {
    if (!formPago.monto || isNaN(formPago.monto)) return showToast("Ingresá un monto válido", "#c62828");
    const nuevo = { ...formPago, id: Date.now(), monto: parseFloat(formPago.monto) };
    const actualizado = { ...empleada, pagos: [nuevo, ...empleada.pagos] };
    setEmpleada(actualizado);
    localStorage.setItem("empleada-datos", JSON.stringify(actualizado));
    setFormPago({ monto: "", concepto: "Quincena", fecha: new Date().toISOString().split("T")[0] });
    showToast("Pago registrado ✓");
  }

  async function guardarDatosEmpleada() {
    const actualizado = { ...empleada, nombre: formNombre || empleada.nombre, salarioBase: parseFloat(formSalario) || 0 };
    setEmpleada(actualizado);
    localStorage.setItem("empleada-datos", JSON.stringify(actualizado));
    setEditandoEmpleada(false);
    showToast("Datos actualizados ✓");
  }

  async function eliminarPago(id) {
    const actualizado = { ...empleada, pagos: empleada.pagos.filter(p => p.id !== id) };
    setEmpleada(actualizado);
    localStorage.setItem("empleada-datos", JSON.stringify(actualizado));
    showToast("Pago eliminado", "#555");
  }

  const gastosMes = gastos.filter(g => g.fecha?.startsWith(mesSeleccionado));
  const totalMes = gastosMes.reduce((s, g) => s + g.monto, 0);
  const porCategoria = CATEGORIAS.map(c => ({ ...c, total: gastosMes.filter(g => g.categoria === c.id).reduce((s, g) => s + g.monto, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const mesesDisponibles = [...new Set(gastos.map(g => g.fecha?.slice(0, 7)).filter(Boolean))].sort().reverse();
  if (!mesesDisponibles.includes(getMesActual())) mesesDisponibles.unshift(getMesActual());
  const pagosMes = empleada.pagos.filter(p => p.fecha?.startsWith(mesSeleccionado));
  const totalPagadoEmpleadaMes = pagosMes.reduce((s, p) => s + p.monto, 0);
  const saldoEmpleada = empleada.salarioBase - totalPagadoEmpleadaMes;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8f5f0", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center", color: "#999" }}><div style={{ fontSize: 36, marginBottom: 8 }}>🏡</div><div>Cargando...</div></div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f7f4ef", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      {toast && (
        <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "#fff", padding: "10px 22px", borderRadius: 24, fontWeight: 600, fontSize: 14, zIndex: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>{toast.msg}</div>
      )}

      <div style={{ background: "#1a1a2e", color: "#fff", padding: "20px 20px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>Familia Galindo</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Gastos del Hogar</div>
          </div>
          <div style={{ fontSize: 28 }}>🏡</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["dashboard","Resumen"],["cargar","Cargar"],["historial","Historial"],["empleada","Empleada"]].map(([key, label]) => (
            <button key={key} onClick={() => setVista(key)} style={{ flex: 1, padding: "10px 0", background: vista === key ? "#fff" : "transparent", color: vista === key ? "#1a1a2e" : "#aaa", border: "none", borderRadius: "8px 8px 0 0", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {(vista === "dashboard" || vista === "historial") && (
          <select value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0d9d0", background: "#fff", fontSize: 14, fontWeight: 600, color: "#1a1a2e", marginBottom: 20 }}>
            {mesesDisponibles.map(m => <option key={m} value={m}>{parseMes(m)}</option>)}
          </select>
        )}

        {vista === "dashboard" && (
          <div>
            <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 20, color: "#fff", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Total — {parseMes(mesSeleccionado)}</div>
              <div style={{ fontSize: 40, fontWeight: 800 }}>{formatARS(totalMes)}</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{gastosMes.length} gastos</div>
            </div>
            {porCategoria.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}><div style={{ fontSize: 32 }}>📊</div><div>Sin gastos este mes</div></div>
            ) : porCategoria.map(c => (
              <div key={c.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{c.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</div>
                  <div style={{ height: 4, background: "#f0ece6", borderRadius: 4, marginTop: 6 }}>
                    <div style={{ height: 4, background: c.color, borderRadius: 4, width: `${Math.min(100, (c.total / totalMes) * 100)}%` }} />
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{formatARS(c.total)}</div>
              </div>
            ))}
            {empleada.salarioBase > 0 && (
              <div style={{ background: saldoEmpleada <= 0 ? "#e8f5e9" : "#fff3e0", borderRadius: 12, padding: 16, marginTop: 8, border: `1.5px solid ${saldoEmpleada <= 0 ? "#a5d6a7" : "#ffcc80"}` }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 6, textTransform: "uppercase" }}>👩 {empleada.nombre}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 11, color: "#999" }}>Salario</div><div style={{ fontWeight: 700 }}>{formatARS(empleada.salarioBase)}</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#999" }}>Pagado</div><div style={{ fontWeight: 700, color: "#2e7d32" }}>{formatARS(totalPagadoEmpleadaMes)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#999" }}>Saldo</div><div style={{ fontWeight: 700, color: saldoEmpleada <= 0 ? "#2e7d32" : "#e65100" }}>{saldoEmpleada <= 0 ? "✅ Al día" : formatARS(saldoEmpleada)}</div></div>
                </div>
              </div>
            )}
          </div>
        )}

        {vista === "cargar" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Nuevo gasto</div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Monto</label>
                <input type="number" placeholder="0" value={formGasto.monto} onChange={e => setFormGasto({...formGasto, monto: e.target.value})} style={{ ...inputStyle, fontSize: 28, fontWeight: 700, textAlign: "center" }} />
              </div>
              <div>
                <label style={labelStyle}>Categoría</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {CATEGORIAS.map(c => (
                    <button key={c.id} onClick={() => setFormGasto({...formGasto, categoria: c.id})} style={{ padding: "10px 8px", borderRadius: 10, border: `2px solid ${formGasto.categoria === c.id ? c.color : "#e0d9d0"}`, background: formGasto.categoria === c.id ? c.color + "18" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: formGasto.categoria === c.id ? c.color : "#666", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{c.emoji}</span>{c.label.split("/")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>¿Quién cargó?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {MIEMBROS.map(m => (
                    <button key={m} onClick={() => setFormGasto({...formGasto, quien: m})} style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${formGasto.quien === m ? "#1a1a2e" : "#e0d9d0"}`, background: formGasto.quien === m ? "#1a1a2e" : "#fff", color: formGasto.quien === m ? "#fff" : "#666", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Descripción (opcional)</label>
                <input type="text" placeholder="Ej: Coto semana 1" value={formGasto.descripcion} onChange={e => setFormGasto({...formGasto, descripcion: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fecha</label>
                <input type="date" value={formGasto.fecha} onChange={e => setFormGasto({...formGasto, fecha: e.target.value})} style={inputStyle} />
              </div>
              <button onClick={guardarGasto} style={{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>Registrar gasto</button>
            </div>
          </div>
        )}

        {vista === "historial" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>{gastosMes.length} gastos — {parseMes(mesSeleccionado)}</div>
            {gastosMes.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}><div style={{ fontSize: 32 }}>📋</div><div>Sin gastos este mes</div></div>
            ) : gastosMes.map(g => {
              const cat = CATEGORIAS.find(c => c.id === g.categoria) || CATEGORIAS[11];
              return (
                <div key={g.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{cat.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.descripcion || cat.label}</div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{g.fecha} · {g.quien}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{formatARS(g.monto)}</div>
                    <button onClick={() => eliminarGasto(g.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {vista === "empleada" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase" }}>👩 Empleada del hogar</div>
                <button onClick={() => setEditandoEmpleada(!editandoEmpleada)} style={{ background: "#f0ece6", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#666" }}>{editandoEmpleada ? "Cancelar" : "Editar"}</button>
              </div>
              {editandoEmpleada ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div><label style={labelStyle}>Nombre</label><input value={formNombre} onChange={e => setFormNombre(e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Salario mensual</label><input type="number" value={formSalario} onChange={e => setFormSalario(e.target.value)} style={inputStyle} /></div>
                  <button onClick={guardarDatosEmpleada} style={{ background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 10, padding: 12, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, background: "#f7f4ef", borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Nombre</div>
                    <div style={{ fontWeight: 700 }}>{empleada.nombre}</div>
                  </div>
                  <div style={{ flex: 1, background: "#f7f4ef", borderRadius: 10, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Salario</div>
                    <div style={{ fontWeight: 700 }}>{formatARS(empleada.salarioBase)}</div>
                  </div>
                </div>
              )}
            </div>
            {empleada.salarioBase > 0 && (
              <div style={{ background: saldoEmpleada <= 0 ? "#e8f5e9" : "#fff3e0", borderRadius: 14, padding: 16, marginBottom: 16, border: `1.5px solid ${saldoEmpleada <= 0 ? "#a5d6a7" : "#ffcc80"}` }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 10, textTransform: "uppercase" }}>{parseMes(mesSeleccionado)}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 11, color: "#999" }}>Salario</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatARS(empleada.salarioBase)}</div></div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#999" }}>Pagado</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2e7d32" }}>{formatARS(totalPagadoEmpleadaMes)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#999" }}>{saldoEmpleada <= 0 ? "Estado" : "Pendiente"}</div><div style={{ fontSize: 18, fontWeight: 700, color: saldoEmpleada <= 0 ? "#2e7d32" : "#e65100" }}>{saldoEmpleada <= 0 ? "✅ Al día" : formatARS(saldoEmpleada)}</div></div>
                </div>
              </div>
            )}
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Registrar pago</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Concepto</label>
                  <select value={formPago.concepto} onChange={e => setFormPago({...formPago, concepto: e.target.value})} style={inputStyle}>
                    {["Quincena","Sueldo completo","Aguinaldo","Adelanto","Bono","Otro"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Monto</label><input type="number" placeholder="0" value={formPago.monto} onChange={e => setFormPago({...formPago, monto: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>Fecha</label><input type="date" value={formPago.fecha} onChange={e => setFormPago({...formPago, fecha: e.target.value})} style={inputStyle} /></div>
                <button onClick={guardarPagoEmpleada} style={{ background: "#2e7d32", color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Registrar pago</button>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Historial de pagos</div>
            {empleada.pagos.length === 0 ? (
              <div style={{ textAlign: "center", color: "#aaa", padding: "30px 0" }}>Sin pagos registrados</div>
            ) : empleada.pagos.map(p => (
              <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💵</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.concepto}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{p.fecha}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#2e7d32" }}>{formatARS(p.monto)}</div>
                  <button onClick={() => eliminarPago(p.id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
