import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, register } from '../api/auth';
import { loginSuccess } from '../store/userSlice';
import './Button.css';

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await login({ email, password });
      const user = response.data;
      setSuccess('התחברות בוצעה בהצלחה');
      dispatch(loginSuccess({ user }));
      // Navigate to the intended route (default '/')
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'ההתחברות נכשלה. יש לבדוק את פרטי ההתחברות.'
        : 'ההתחברות נכשלה. יש לבדוק את פרטי ההתחברות.';
      setError(Array.isArray(message) ? message.join(', ') : message);
      console.error(err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }
    try {
      const response = await register({ name, email, password });
      setSuccess('ההרשמה בוצעה בהצלחה! יש להתחבר.');
      console.log(response.data);
      setActiveTab('login');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'ההרשמה נכשלה. יש לנסות שוב.'
        : 'ההרשמה נכשלה. יש לנסות שוב.';
      setError(Array.isArray(message) ? message.join(', ') : message);
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div role="tablist" style={{ display: 'flex', gap: '10px' }}>
        <button role="tab" aria-selected={activeTab === 'login'} onClick={() => setActiveTab('login')} className={`button-tab ${activeTab === 'login' ? 'active' : ''}`}>
          התחברות
        </button>
        <button role="tab" aria-selected={activeTab === 'register'} onClick={() => setActiveTab('register')} className={`button-tab ${activeTab === 'register' ? 'active' : ''}`}>
          הרשמה
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="email">דוא"ל:</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="password">סיסמה:</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" className="button-primary" style={{ width: '100%' }}>התחברות</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="name">שם:</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="reg-email">דוא"ל:</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="reg-password">סיסמה:</label>
              <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="confirm-password">אישור סיסמה:</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" className="button-primary" style={{ width: '100%' }}>הרשמה</button>
          </form>
        )}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>
    </div>
  );
};

export default Auth;
