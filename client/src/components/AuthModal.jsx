import { useState } from 'react';
import * as authApi from '../api/auth';
import Modal from './Modal';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (mode === 'register') {
        data = await authApi.register({ name: name.trim(), email: email.trim(), password });
      } else {
        data = await authApi.login({ email: email.trim(), password });
      }

      localStorage.setItem('streakly_token', data.token);
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
  }

  const tabClass = (tab) =>
    `pb-2 text-base font-semibold transition ${
      mode === tab
        ? 'border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100'
        : 'text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300'
    }`;

  const tabs = (
    <div className="flex gap-4 border-b border-stone-100 dark:border-stone-800">
      <button type="button" onClick={() => switchMode('login')} className={tabClass('login')}>
        Sign In
      </button>
      <button type="button" onClick={() => switchMode('register')} className={tabClass('register')}>
        Create Account
      </button>
    </div>
  );

  return (
    <Modal title={tabs} onClose={onClose}>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === 'register' && (
          <div>
            <label htmlFor="auth-name" className="label">
              Your name
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={40}
              required
              className="input mt-1.5"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="label">
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="input mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="label">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
            className="input mt-1.5"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="pt-2">
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading
              ? mode === 'register'
                ? 'Creating account...'
                : 'Signing in...'
              : mode === 'register'
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
