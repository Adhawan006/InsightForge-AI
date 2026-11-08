import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        organization: organization.trim(),
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      await api.put('/users/me', payload);
      toast.success('Enterprise profile updated successfully.');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Architect Profile & Security</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your enterprise credentials, organization profile, and session encryption keys.
        </p>
      </div>

      <Card title="Account Credentials">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-brand-500/20">
              {fullName?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">{fullName}</span>
                <Badge variant="primary">{user?.is_superuser ? 'Lead Architect' : 'Staff Engineer'}</Badge>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tenant: {organization}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Organization / Business Unit"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </div>

          <Input
            label="Corporate Email Address"
            value={user?.email || ''}
            disabled
            helperText="Managed by corporate directory / SSO."
          />

          <Input
            label="Update Password"
            type="password"
            placeholder="Leave blank to keep current password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 6 characters. Encrypted via bcrypt."
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
