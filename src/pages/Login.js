import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (requires2FA) payload.twoFactorCode = twoFactorCode;

      const data = await login(payload);

      if (data.requires2FA) {
        setRequires2FA(true);
        toast('Ingresa tu código de autenticación', { icon: '🔐' });
        setLoading(false);
        return;
      }

      toast.success(`Bienvenido, ${data.user.name}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '.5rem', textAlign: 'center' }}>Iniciar sesión</h1>
        <p style={{ color: 'var(--gray)', textAlign: 'center', marginBottom: '2rem' }}>Bienvenido de vuelta</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" className="form-control" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingRight: '4rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)',
                }}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {requires2FA && (
            <div className="form-group">
              <label htmlFor="twoFactorCode">Código 2FA</label>
              <input
                id="twoFactorCode"
                className="form-control"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                autoFocus
              />
              <small style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>
                Ingresa el código de tu aplicación de autenticación
              </small>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '.5rem' }}>
            {loading ? 'Ingresando...' : requires2FA ? 'Verificar código' : 'Iniciar sesión'}
          </button>

          {requires2FA && (
            <button
              type="button"
              className="btn btn-outline btn-full"
              style={{ marginTop: '.5rem' }}
              onClick={() => { setRequires2FA(false); setTwoFactorCode(''); }}
            >
              Volver al login
            </button>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
