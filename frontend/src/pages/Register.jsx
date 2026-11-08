import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, login, loading } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('Dell Technologies');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        organization: organization.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      toast.success('Account provisioned successfully. Signing you in...');

      // Auto login
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-xl shadow-brand-500/25">
            IF
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">InsightForge AI</h1>
          <p className="text-xs text-slate-400">Enterprise Access Provisioning</p>
        </div>

        <Card title="Register Architect Credentials">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <Input
              label="Full Name *"
              placeholder="e.g. Sarah Connor"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Organization / Business Unit *"
              placeholder="Dell Technologies"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
            <Input
              label="Corporate Email *"
              type="email"
              placeholder="name@dell.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full mt-2" size="md">
              {loading ? 'Provisioning...' : 'Provision Enterprise Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400">
              Already provisioned?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
                Sign In
              </Link>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
