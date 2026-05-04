import React, { useState } from 'react';
import { X, LogIn } from 'lucide-react';
import { useGames } from '../../contexts/GameContext';

export default function AdminLoginModal({ onClose }) {
  const { setAdminAuthenticated, adminPassword } = useGames();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (adminPassword === null) {
        setError('비밀번호 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    if (password === adminPassword) {
      setAdminAuthenticated(true);
      onClose();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
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
            <LogIn size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>관리자 로그인</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="비밀번호를 입력하세요"
              autoFocus
              style={{
                width: '100%', padding: '12px', background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
                color: 'var(--text-primary)', marginTop: '6px', fontSize: '15px'
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>{error}</p>}
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '15px', fontWeight: '700' }}>
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
