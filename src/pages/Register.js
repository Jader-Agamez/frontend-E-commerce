import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Contraseña mínimo 6 caracteres');
    setLoading(true);
    try {
      await register(form);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '.5rem', textAlign: 'center' }}>Crear cuenta</h1>
        <p style={{ color: 'var(--gray)', textAlign: 'center', marginBottom: '2rem' }}>Únete a nuestra tienda</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo</label>
            <input className="form-control" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input className="form-control" type="password" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Teléfono (opcional)</label>
            <input className="form-control" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label>Dirección (opcional)</label>
            <textarea className="form-control" rows={2} value={form.address} onChange={set('address')} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
