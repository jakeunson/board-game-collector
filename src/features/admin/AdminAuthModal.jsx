import React, { useState } from 'react';
import { X, Lock, LogIn } from 'lucide-react';
import { useGames } from '../../contexts/GameContext';

/**
 * 관리자 인증/로그인 통합 모달
 *
 * @param {'login' | 'auth'} mode
 *   - 'login': Footer에서 명시적으로 로그인하는 경우 (제목: 관리자 로그인)
 *   - 'auth':  관리자 전용 액션 전 인증 요청하는 경우 (제목: 관리자 인증)
 * @param {() => void} onClose   모달 닫기
 * @param {() => void} [onSuccess]  인증 성공 시 콜백 (auth 모드에서 사용)
 */
export default function AdminAuthModal({ mode = 'auth', onClose, onSuccess }) {
  const { setAdminAuthenticated, adminPassword } = useGames();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isLoginMode = mode === 'login';

  const handleSubmit = e => {
    e.preventDefault();

    if (adminPassword === null) {
      setError('비밀번호 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (password === adminPassword) {
      setAdminAuthenticated(true);
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '16px',
      }}
    >
      <div
        className="glass animate-slide-up"
        style={{ width: '100%', maxWidth: '400px', borderRadius: '20px', border: '1px solid var(--border-medium)', overflow: 'hidden' }}
      >
        {/* 헤더 */}
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isLoginMode
              ? <LogIn size={18} style={{ color: 'var(--accent-primary)' }} />
              : <Lock size={18} style={{ color: 'var(--accent-primary)' }} />
            }
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>
              {isLoginMode ? '관리자 로그인' : '관리자 인증'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="비밀번호를 입력하세요"
              autoFocus
              className="form-input"
              style={{ width: '100%', marginTop: '6px', fontSize: '15px', padding: '12px' }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>{error}</p>}
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '15px', fontWeight: '700' }}>
            {isLoginMode ? '로그인' : '인증하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
