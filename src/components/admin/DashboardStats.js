import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const STATUS_COLORS = {
  pedidosGenerados:        { bg: '#ede9fe', color: '#7c3aed', icon: '📦' },
  productosVendidos:       { bg: '#dbeafe', color: '#1d4ed8', icon: '🛍️' },
  pedidosEntregados:       { bg: '#d1fae5', color: '#065f46', icon: '✅' },
  totalVendido:            { bg: '#fef3c7', color: '#92400e', icon: '💰' },
  guiasPendientesConfirmar:{ bg: '#fce7f3', color: '#9d174d', icon: '⏳' },
  guiasPendientes:         { bg: '#ffedd5', color: '#9a3412', icon: '🚧' },
  guiasGeneradas:          { bg: '#e0f2fe', color: '#0369a1', icon: '🚚' },
};

function MetricCard({ label, value, icon, bg, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '1.2rem 1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      </div>
    </div>
  );
}

function MonthlyChart({ data }) {
  const maxTotal = Math.max(...data.map((d) => parseFloat(d.total)), 1);
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.2rem', color: '#1e293b' }}>📈 Ventas mensuales</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, overflowX: 'auto', paddingBottom: 4 }}>
        {data.map((item, i) => {
          const h = Math.max((parseFloat(item.total) / maxTotal) * 130, item.total > 0 ? 6 : 0);
          const isCurrentMonth = i === new Date().getMonth();
          return (
            <div key={i} style={{ flex: '0 0 auto', minWidth: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1e293b' }}>
                {parseFloat(item.total) > 0 ? `$${parseFloat(item.total) >= 1000 ? (parseFloat(item.total)/1000).toFixed(1)+'k' : parseFloat(item.total)}` : ''}
              </span>
              <div
                title={`$${item.total} — ${item.count} pedidos`}
                style={{
                  width: 28,
                  height: h,
                  background: isCurrentMonth ? '#7c3aed' : '#a5b4fc',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease',
                  cursor: 'default',
                }}
              />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopProducts({ products }) {
  if (!products?.length) return null;
  const maxQty = Math.max(...products.map((p) => p.totalQty), 1);
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.2rem', color: '#1e293b' }}>🏆 Top productos vendidos</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {products.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: i < 3 ? '#fff' : '#64748b', flexShrink: 0 }}>
              {i + 1}
            </div>
            {p.image && <img src={p.image} alt={p.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ marginTop: 4, height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p.totalQty / maxQty) * 100}%`, background: '#6366f1', borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1' }}>{p.totalQty} uds</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>${p.totalRevenue}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBreakdown({ stats }) {
  const items = [
    { label: 'Pendientes confirmar', value: stats.guiasPendientesConfirmar, color: '#f59e0b', pct: 0 },
    { label: 'En proceso',           value: stats.guiasPendientes,          color: '#f97316', pct: 0 },
    { label: 'Enviados',             value: stats.guiasGeneradas,           color: '#6366f1', pct: 0 },
    { label: 'Entregados',           value: stats.pedidosEntregados,        color: '#10b981', pct: 0 },
  ];
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  items.forEach((i) => { i.pct = Math.round((i.value / total) * 100); });

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1.2rem', color: '#1e293b' }}>📊 Estado de pedidos</div>
      {/* Barra apilada */}
      <div style={{ display: 'flex', height: 12, borderRadius: 8, overflow: 'hidden', marginBottom: '1.2rem', gap: 2 }}>
        {items.map((item, i) => item.value > 0 && (
          <div key={i} style={{ flex: item.value, background: item.color, transition: 'flex 0.5s ease' }} title={`${item.label}: ${item.value}`} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{item.value}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>{item.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const [year, setYear] = useState(String(currentYear));
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    ordersAPI.getStats(year ? { year } : {})
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>Dashboard</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>Resumen de tu tienda</div>
        </div>
        <select
          className="form-control"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: 'auto', minWidth: 120 }}
        >
          <option value="">Todos los años</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <MetricCard label="Pedidos generados"   value={stats.pedidosGenerados}         {...STATUS_COLORS.pedidosGenerados} />
            <MetricCard label="Productos vendidos"  value={stats.productosVendidos}         {...STATUS_COLORS.productosVendidos} />
            <MetricCard label="Pedidos entregados"  value={stats.pedidosEntregados}         {...STATUS_COLORS.pedidosEntregados} />
            <MetricCard label="Total vendido"       value={`$${stats.totalVendido}`}        {...STATUS_COLORS.totalVendido} />
            <MetricCard label="Pend. confirmar"     value={stats.guiasPendientesConfirmar}  {...STATUS_COLORS.guiasPendientesConfirmar} />
            <MetricCard label="En proceso"          value={stats.guiasPendientes}           {...STATUS_COLORS.guiasPendientes} />
            <MetricCard label="Enviados"            value={stats.guiasGeneradas}            {...STATUS_COLORS.guiasGeneradas} />
          </div>

          {/* Gráfica mensual */}
          {stats.ventasMensuales && <div style={{ marginBottom: '1.5rem' }}><MonthlyChart data={stats.ventasMensuales} /></div>}

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <StatusBreakdown stats={stats} />
            {stats.topProductos?.length > 0 && <TopProducts products={stats.topProductos} />}
          </div>
        </>
      ) : null}
    </div>
  );
}
