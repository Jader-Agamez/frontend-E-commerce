import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

const cardStyle = {
  padding: '1.2rem',
  borderRadius: '10px',
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,.08)',
  textAlign: 'center',
};

const valueStyle = {
  fontSize: '1.8rem',
  fontWeight: 900,
  margin: '0.3rem 0',
};

const labelStyle = {
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--gray)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

function BarChart({ data, colors }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '0.5rem' }}>
        {data.map((item, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '4px' }}>
              {item.value}
            </span>
            <div style={{
              width: '100%',
              maxWidth: '60px',
              height: `${(item.value / max) * 160}px`,
              background: colors[i % colors.length],
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.5s ease',
              minHeight: item.value > 0 ? '8px' : '0px',
            }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--gray)', marginTop: '6px', textAlign: 'center', lineHeight: 1.2 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardStats() {
  const [year, setYear] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async (selectedYear) => {
    setLoading(true);
    try {
      const params = selectedYear ? { year: selectedYear } : {};
      const { data } = await ordersAPI.getStats(params);
      setStats(data);
    } catch (err) {
      toast.error('Error al cargar estadísticas');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStats(year);
  }, [year]);

  const pedidosData = stats ? [
    { label: 'Generados', value: stats.pedidosGenerados },
    { label: 'Entregados', value: stats.pedidosEntregados },
    { label: 'Vendidos', value: stats.productosVendidos },
  ] : [];

  const pedidosColors = ['#6366f1', '#10b981', '#f59e0b'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Dashboard de Estadísticas</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray)' }}>Año:</label>
          <select
            className="form-control"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>Cargando...</p>
      ) : stats ? (
        <>
          {/* Cards de Pedidos */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--dark)' }}>
            📦 Reporte de Pedidos
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Pedidos Generados</div>
              <div style={{ ...valueStyle, color: 'var(--primary)' }}>{stats.pedidosGenerados}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Productos Vendidos</div>
              <div style={{ ...valueStyle, color: 'var(--secondary)' }}>{stats.productosVendidos}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Pedidos Entregados</div>
              <div style={{ ...valueStyle, color: 'var(--success)' }}>{stats.pedidosEntregados}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Total Vendido</div>
              <div style={{ ...valueStyle, color: 'var(--dark)' }}>${stats.totalVendido}</div>
            </div>
          </div>

          {/* Gráfica de Pedidos */}
          <BarChart data={pedidosData} colors={pedidosColors} />

          {/* Cards de Guías */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--dark)' }}>
            🚚 Reporte de Guías de Envío
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Guías Pendientes por Confirmar</div>
              <div style={{ ...valueStyle, color: '#f59e0b' }}>{stats.guiasPendientesConfirmar}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Guías Pendientes</div>
              <div style={{ ...valueStyle, color: '#f97316' }}>{stats.guiasPendientes}</div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Guías Generadas</div>
              <div style={{ ...valueStyle, color: 'var(--primary)' }}>{stats.guiasGeneradas}</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
