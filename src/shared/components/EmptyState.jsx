import React from 'react';

export default function EmptyState({ 
  icon = '🔍', 
  title = '검색 결과가 없습니다', 
  message = '다른 검색어나 필터를 적용해 보세요.' 
}) {
  return (
    <div className="glass animate-slide-up" style={{ textAlign: 'center', padding: '80px', borderRadius: '24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}
