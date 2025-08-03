import React, { useState } from 'react';
import { login, register } from '../api/auth';

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await login({ email, password });
      setSuccess('Login successful!');
      console.log(response.data);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await register({ name, email, password });
      setSuccess('Registration successful! Please log in.');
      console.log(response.data);
      setActiveTab('login');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveTab('login')} style={{ width: '50%', padding: '10px', cursor: 'pointer', backgroundColor: activeTab === 'login' ? 'lightgray' : '#f1f1f1', color: 'black', border: 'none' }}>
          Login
        </button>
        <button onClick={() => setActiveTab('register')} style={{ width: '50%', padding: '10px', cursor: 'pointer', backgroundColor: activeTab === 'register' ? 'lightgray' : '#f1f1f1', color: 'black', border: 'none' }}>
          Register
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '10px' }}>
              <label>Name:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
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