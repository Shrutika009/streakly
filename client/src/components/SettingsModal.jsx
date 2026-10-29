import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import * as authApi from '../api/auth';
import * as habitsApi from '../api/habits';
import Modal from './Modal';
import { notificationsSupported } from '../hooks/useReminders';

function errorMessage(err, fallback) {
  return err.response?.data?.error || fallback;
}

// Small status line under each section: { type: 'ok' | 'error', text }.
function Status({ status }) {
  if (!status) return null;
  return (
    <p
      className={`mt-2 text-sm ${
        status.type === 'ok'
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {status.text}
    </p>
  );
}

function Section({ title, children, danger = false }) {
  return (
    <section
      className={`border-t pt-5 ${danger ? 'border-red-100 dark:border-red-500/20' : 'border-stone-100 dark:border-stone-800'}`}
    >
      <h3
        className={`mb-3 text-sm font-semibold ${danger ? 'text-red-600 dark:text-red-400' : 'heading'}`}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function SettingsModal({
  user,
  onClose,
  onUserUpdated,
  onImported,
  onAccountDeleted,
}) {
  return (
    <Modal title="Account settings" onClose={onClose} wide>
      <p className="muted mt-1 text-sm">{user.email}</p>
      <div className="mt-5 space-y-5">
        <ProfileSection user={user} onUserUpdated={onUserUpdated} />
        <PasswordSection />
        <RemindersSection />
        <DataSection onImported={onImported} />
        <DeleteSection onAccountDeleted={onAccountDeleted} />
      </div>
    </Modal>
  );
}

function ProfileSection({ user, onUserUpdated }) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const data = await authApi.updateProfile({ name: name.trim() });
      localStorage.setItem('streakly_token', data.token);
      onUserUpdated(data.user);
      setStatus({ type: 'ok', text: 'Name updated.' });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not update your name.') });
    } finally {
      setSaving(false);
    }
  }

  const unchanged = name.trim() === user.name;

  return (
    <Section title="Profile">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="settings-name" className="sr-only">
          Name
        </label>
        <input
          id="settings-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={saving || unchanged || !name.trim()}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
      <Status status={status} />
    </Section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatus({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirm) {
      setStatus({ type: 'error', text: "New passwords don't match." });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
      setStatus({ type: 'ok', text: 'Password changed.' });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not change your password.') });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Change password">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          aria-label="Current password"
          autoComplete="current-password"
          className="input"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            aria-label="New password"
            autoComplete="new-password"
            className="input"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            aria-label="Repeat new password"
            autoComplete="new-password"
            className="input"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !currentPassword || !newPassword || !confirm}
            className="btn-primary"
          >
            {saving ? 'Changing...' : 'Change password'}
          </button>
        </div>
      </form>
      <Status status={status} />
    </Section>
  );
}

function RemindersSection() {
  const supported = notificationsSupported();
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');

  async function enable() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      new Notification('🔔 Reminders are on', {
        body: "You'll get a nudge at each habit's reminder time.",
      });
    }
  }

  return (
    <Section title="Reminders">
      <p className="muted mb-3 text-sm">
        Set a reminder time on any habit (Edit → Daily reminder). Reminders appear while Streakly is
        open in a browser tab, and are skipped if the habit is already done.
      </p>
      {permission === 'granted' && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ System notifications are on for this browser.
        </p>
      )}
      {permission === 'default' && (
        <button type="button" onClick={enable} className="btn-secondary">
          Turn on system notifications
        </button>
      )}
      {permission === 'denied' && (
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Notifications are blocked in your browser settings, so reminders show inside the app
          instead.
        </p>
      )}
      {permission === 'unsupported' && (
        <p className="text-sm text-stone-600 dark:text-stone-300">
          This browser doesn't support notifications, so reminders show inside the app instead.
        </p>
      )}
    </Section>
  );
}

function DataSection({ onImported }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleExport() {
    setBusy(true);
    setStatus(null);
    try {
      const data = await habitsApi.exportHabits();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `streakly-${dayjs().format('YYYY-MM-DD')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'ok', text: `Exported ${data.habits.length} habits.` });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not export your data.') });
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // so picking the same file again still fires
    if (!file) return;

    setBusy(true);
    setStatus(null);
    try {
      let data;
      try {
        data = JSON.parse(await file.text());
      } catch {
        throw new Error("That file isn't valid JSON.");
      }
      const result = await habitsApi.importHabits(data);
      onImported(result.habits);
      setStatus({
        type: 'ok',
        text: `Imported ${result.imported} ${result.imported === 1 ? 'habit' : 'habits'}.`,
      });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, err.message || 'Import failed.') });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Your data">
      <p className="muted mb-3 text-sm">
        Download all your habits and history as a JSON file, or import one. Importing adds the
        habits from the file next to the ones you already have.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleExport} disabled={busy} className="btn-secondary">
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="btn-secondary"
        >
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <Status status={status} />
    </Section>
  );
}

function DeleteSection({ onAccountDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleDelete(e) {
    e.preventDefault();
    setDeleting(true);
    setStatus(null);
    try {
      await authApi.deleteAccount(password);
      onAccountDeleted();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Could not delete your account.') });
      setDeleting(false);
    }
  }

  return (
    <Section title="Delete account" danger>
      {!confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="muted text-sm">Permanently removes your account and every habit.</p>
          <button type="button" onClick={() => setConfirming(true)} className="btn-danger">
            Delete account
          </button>
        </div>
      ) : (
        <form onSubmit={handleDelete} className="space-y-2">
          <p className="text-sm text-stone-600 dark:text-stone-300">
            This can't be undone. Consider exporting your data first. Enter your password to
            confirm.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            autoFocus
            className="input"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setPassword('');
                setStatus(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={deleting || !password} className="btn-danger">
              {deleting ? 'Deleting...' : 'Delete forever'}
            </button>
          </div>
        </form>
      )}
      <Status status={status} />
    </Section>
  );
}
