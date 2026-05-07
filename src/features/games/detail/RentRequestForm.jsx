import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * 대여 신청 폼 컴포넌트
 * 이메일, 대여 시작일, 반납 예정일을 입력받아 신청합니다.
 */
export default function RentRequestForm({
  game,
  showRentForm,
  onShowForm,
  rentEmail,
  rentStartDate,
  rentEndDate,
  isSubmittingRent,
  onEmailChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  onCancel,
}) {
  if (game.isRented) {
    return (
      <div className="rent-section">
        <div className="rent-status-rented">🔒 현재 대여중인 게임입니다.</div>
      </div>
    );
  }

  return (
    <div className="rent-section">
      {!showRentForm ? (
        <button onClick={onShowForm} className="btn-primary rent-btn">
          <Calendar size={16} /> 대여 신청하기
        </button>
      ) : (
        <form onSubmit={onSubmit} className="rent-form">
          <h4 className="rent-form-title">대여 신청 정보 입력</h4>

          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              required
              value={rentEmail}
              onChange={e => onEmailChange(e.target.value)}
              placeholder="example@email.com"
              className="form-input"
              style={{ marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="form-group" style={{ minWidth: 0 }}>
              <label className="form-label">대여 시작일</label>
              <input
                type="date"
                required
                value={rentStartDate}
                onChange={e => onStartDateChange(e.target.value)}
                onClick={e => e.target.showPicker()}
                className="form-input date-input"
                style={{ marginTop: '4px' }}
              />
            </div>
            <div className="form-group" style={{ minWidth: 0 }}>
              <label className="form-label">반납 예정일</label>
              <input
                type="date"
                required
                value={rentEndDate}
                onChange={e => onEndDateChange(e.target.value)}
                onClick={e => e.target.showPicker()}
                className="form-input date-input"
                style={{ marginTop: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={isSubmittingRent}
              className="btn-primary"
              style={{ flex: 1, padding: '8px' }}
            >
              {isSubmittingRent ? '제출 중...' : '신청 완료'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-ghost"
              style={{ flex: 1, padding: '8px' }}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
