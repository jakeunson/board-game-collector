import React, { useState } from 'react';
import { X, Key } from 'lucide-react';
import { useGames } from '../../contexts/GameContext';

export default function ChangePasswordModal({ onClose }) {
  const { adminPassword, changeAdminPassword } = useGames();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (adminPassword === null) {
      setError('비밀번호 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (currentPassword !== adminPassword) {
      setError('현재 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 4) {
      setError('새 비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      await changeAdminPassword(newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '16px'
    }}>
      <div className="glass animate-slide-up" style={{
        width: '100%', maxWidth: '400px', borderRadius: '20px',
        border: '1px solid var(--border-medium)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>비밀번호 변경</h3>
          </div>
          <button onClick={onClose} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setError(''); }}
              placeholder="현재 비밀번호 입력"
              autoFocus
              disabled={loading}
              style={{
                width: '100%', padding: '12px', background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
                color: 'var(--text-primary)', marginTop: '6px', fontSize: '15px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              placeholder="새 비밀번호 입력"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
                color: 'var(--text-primary)', marginTop: '6px', fontSize: '15px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder="새 비밀번호 다시 입력"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
                color: 'var(--text-primary)', marginTop: '6px', fontSize: '15px'
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>{error}</p>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: '700' }}>
              {loading ? '변경 중...' : '변경하기'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '15px' }}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
