import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, demoLogin, loading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast.success('Authenticated successfully. Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      await demoLogin();
      toast.success('Authenticated as Dell Lead Solution Architect.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-xl shadow-brand-500/25">
            IF
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">InsightForge AI</h1>
          <p className="text-xs text-slate-400">AI-Powered Enterprise Data Intelligence Platform</p>
        </div>

        {/* Demo Fast-Pass Banner */}
        <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-300">Dell Technologies Fast-Pass</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-brand-600 text-white font-bold">Hackathon Demo</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            One-click authentication as Dell Lead Solution Architect with pre-loaded APEX telemetry.
          </p>
          <Button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs py-2.5 shadow-md shadow-brand-600/30"
          >
            {loading ? 'Authenticating...' : '⚡ One-Click Enterprise Demo Login'}
          </Button>
        </div>

        {/* Standard Form */}
        <Card title="Corporate Single Sign-On">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="name@dell.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full" size="md">
              {loading ? 'Verifying...' : 'Sign In with SSO'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400">
              Need an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">
                Register Enterprise Access
              </Link>
            </span>
          </div>
        </Card>

        <p className="text-center text-[11px] text-slate-500">
          Protected by Dell Technologies Enterprise Security Protocol &bull; TLS 1.3
        </p>
      </div>
    </div>
  );
}
