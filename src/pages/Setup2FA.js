import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Setup2FA() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    if (user?.twoFactorEnabled || user?.twoFactorSkipped) {
      navigate('/');
      return;
    }
    handleSetup();
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.setup2FA();
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al generar QR');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return toast.error('El código debe tener 6 dígitos');
    setVerifying(true);
    try {
      const { data } = await authAPI.verify2FA({ code: verifyCode });
      updateUser(data.user);
      toast.success('2FA activado. Ya puedes usar la aplicación.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Código inválido');
    } finally { setVerifying(false); }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      const { data } = await authAPI.skip2FA();
      updateUser(data.user);
      toast.success('Puedes configurar 2FA después desde Seguridad.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al omitir');
    } finally { setSkipping(false); }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Generando código QR...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '.5rem', textAlign: 'center' }}>
          Configura tu autenticación de dos factores
        </h1>
        <p style={{ color: 'var(--gray)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Recomendamos proteger tu cuenta con 2FA. Puedes configurarlo ahora o hacerlo después desde Seguridad.
        </p>

        {qrCode && (
          <>
            <p style={{ fontWeight: 600, marginBottom: '1rem' }}>
              1. Escanea este código QR con tu app de autenticación:
            </p>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <img
                src={qrCode}
                alt="QR Code 2FA"
                style={{ maxWidth: '200px', border: '2px solid var(--border)', borderRadius: '8px' }}
              />
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              O ingresa manualmente: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>{secret}</code>
            </p>

            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
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
              style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }}
              autoFocus
            />
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleVerify}
              disabled={verifying || verifyCode.length !== 6}
            >
              {verifying ? 'Verificando...' : 'Activar y continuar'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowWarning(true)}
                disabled={verifying || skipping}
              >
                Omitir por ahora
              </button>
            </div>
          </>
        )}
      </div>

      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '420px', width: '100%' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>
              ⚠️ Advertencia de seguridad
            </h2>
            <p style={{ color: 'var(--gray)', marginBottom: '1.5rem', lineHeight: 1.6, textAlign: 'center' }}>
              Si omites la configuración de 2FA, tu cuenta tendrá una protección menor.
              Podrás configurarla en cualquier momento desde la sección de <strong>Seguridad</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => setShowWarning(false)}
                disabled={skipping}
              >
                Configurar 2FA
              </button>
              <button
                className="btn btn-outline btn-full"
                onClick={handleSkip}
                disabled={skipping}
              >
                {skipping ? 'Procesando...' : 'Continuar sin 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
