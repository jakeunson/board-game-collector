import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Check, RotateCcw, Ban, Trash2 } from 'lucide-react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useGames } from '../../contexts/GameContext';

export default function RentalManager({ onClose }) {
  const { updateGame } = useGames();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "rentalRequests"), orderBy("requestedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch rental requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId, gameId, newStatus) => {
    try {
      // 1. rentalRequests 상태 업데이트
      await updateDoc(doc(db, "rentalRequests", requestId), {
        status: newStatus
      });

      // 2. games 컬렉션의 isRented 상태 동기화
      if (newStatus === 'approved') {
        await updateGame(gameId, { isRented: true });
      } else if (newStatus === 'returned' || newStatus === 'rejected') {
        await updateGame(gameId, { isRented: false });
      }

      alert('상태가 변경되었습니다.');
      fetchRequests(); // 목록 새로고침
    } catch (error) {
      console.error("Failed to update status:", error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('이 대여 신청 기록을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "rentalRequests", requestId));
        alert('신청 기록이 삭제되었습니다.');
        fetchRequests();
      } catch (error) {
        console.error("Failed to delete request:", error);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>대여중</span>;
      case 'returned':
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>반납완료</span>;
      case 'rejected':
        return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>거절됨</span>;
      default:
        return <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>대기중</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '16px'
    }}>
      <div className="glass animate-slide-up" style={{
        width: '100%', maxWidth: '800px', maxHeight: '80vh', borderRadius: '20px',
        border: '1px solid var(--border-medium)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>대여 신청 관리</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>불러오는 중...</p>
          ) : requests.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>대여 신청 내역이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.map(req => (
                <div key={req.id} className="glass" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{req.gameName}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={14} /> {req.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {req.rentDate} ~ {req.returnDate}
                        </span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    {req.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusChange(req.id, req.gameId, 'approved')}
                          style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={14} /> 승인 (대여)
                        </button>
                        <button 
                          onClick={() => handleStatusChange(req.id, req.gameId, 'rejected')}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Ban size={14} /> 거절
                        </button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <button 
                        onClick={() => handleStatusChange(req.id, req.gameId, 'returned')}
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RotateCcw size={14} /> 반납 완료
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteRequest(req.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '6px' }}
                      title="기록 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
