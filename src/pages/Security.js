import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Security() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      toast('Tienes 2FA activado', { icon: '🔐' });
    }
  }, [user]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      toast('Escanea el código QR con tu app de autenticación', { icon: '📱' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al configurar 2FA');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return toast.error('El código debe tener 6 dígitos');
    setLoading(true);
    try {
      await authAPI.verify2FA({ code: verifyCode });
      toast.success('2FA activado exitosamente');
      setQrCode(null);
      setSecret(null);
      setVerifyCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código inválido');
    } finally { setLoading(false); }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) return toast.error('El código debe tener 6 dígitos');
    setLoading(true);
    try {
      await authAPI.disable2FA({ code: disableCode });
      toast.success('2FA desactivado exitosamente');
      setDisableCode('');
      setShowDisable(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código inválido');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1.5rem' }}>Seguridad</h1>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
            🔐 Autenticación de Dos Factores (2FA)
          </h2>

          {user?.twoFactorEnabled ? (
            <div>
              <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '1rem' }}>
                ✓ 2FA está activado en tu cuenta
              </p>
              {!showDisable ? (
                <button className="btn btn-outline" onClick={() => setShowDisable(true)}>
                  Desactivar 2FA
                </button>
              ) : (
                <div>
                  <p style={{ color: 'var(--gray)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Ingresa el código de tu app de autenticación para desactivar 2FA:
                  </p>
                  <input
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    style={{ marginBottom: '1rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-danger" onClick={handleDisable} disabled={loading}>
                      {loading ? 'Procesando...' : 'Desactivar'}
                    </button>
                    <button className="btn btn-outline" onClick={() => { setShowDisable(false); setDisableCode(''); }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>
                La autenticación de dos factores añade una capa extra de seguridad a tu cuenta.
              </p>

              {!qrCode ? (
                <button className="btn btn-primary" onClick={handleSetup} disabled={loading}>
                  {loading ? 'Configurando...' : 'Configurar 2FA'}
                </button>
              ) : (
                <div>
                  <p style={{ marginBottom: '1rem', fontWeight: 600 }}>
                    1. Escanea este código QR con tu app de autenticación:
                  </p>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={qrCode} alt="QR Code 2FA" style={{ maxWidth: '200px', border: '2px solid var(--border)', borderRadius: '8px' }} />
                  </div>
                  <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    O ingresa manualmente: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>{secret}</code>
                  </p>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
                    2. Ingresa el código de 6 dígitos de tu app:
                  </p>
                  <input
                    className="form-control"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    style={{ marginBottom: '1rem' }}
                  />
                  <button className="btn btn-primary" onClick={handleVerify} disabled={loading || verifyCode.length !== 6}>
                    {loading ? 'Verificando...' : 'Activar 2FA'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
            🛡️ Consejos de seguridad
          </h2>
          <ul style={{ color: 'var(--gray)', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
            <li>Usa una contraseña única y fuerte (mínimo 12 caracteres)</li>
            <li>Activa la autenticación de dos factores (2FA)</li>
            <li>Nunca compartas tus credenciales</li>
            <li>Cierra sesión en dispositivos públicos</li>
            <li>Verifica que uses HTTPS en todo momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
