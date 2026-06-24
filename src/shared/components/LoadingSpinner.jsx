import React from 'react';
import { Dice5 } from 'lucide-react';

export default function LoadingSpinner({ text = '보드게임을 불러오는 중...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <div className="animate-fade-in">
        <Dice5 size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{text}</p>
      </div>
    </div>
  );
}
