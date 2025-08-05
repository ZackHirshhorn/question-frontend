import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, register } from '../api/auth';
import { loginSuccess } from '../store/userSlice';

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await login({ email, password });
      const user = response.data;
      setSuccess('Login successful!');
      dispatch(loginSuccess({ user }));
      window.location.href = '/';
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(Array.isArray(message) ? message.join(', ') : message);
      console.error(err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await register({ name, email, password });
      setSuccess('Registration successful! Please log in.');
      console.log(response.data);
      setActiveTab('login');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(Array.isArray(message) ? message.join(', ') : message);
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div role="tablist" style={{ display: 'flex', gap: '10px' }}>
        <button role="tab" aria-selected={activeTab === 'login'} onClick={() => setActiveTab('login')} style={{ width: '50%', padding: '10px', cursor: 'pointer', backgroundColor: activeTab === 'login' ? 'lightgray' : '#f1f1f1', color: 'black', border: 'none' }}>
          Login
        </button>
        <button role="tab" aria-selected={activeTab === 'register'} onClick={() => setActiveTab('register')} style={{ width: '50%', padding: '10px', cursor: 'pointer', backgroundColor: activeTab === 'register' ? 'lightgray' : '#f1f1f1', color: 'black', border: 'none' }}>
          Register
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="email">Email:</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="password">Password:</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="name">Name:</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="reg-email">Email:</label>
              <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="reg-password">Password:</label>
              <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="confirm-password">Confirm Password:</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Register</button>
          </form>
        )}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
      </div>
    </div>
  );
};

export default Auth;