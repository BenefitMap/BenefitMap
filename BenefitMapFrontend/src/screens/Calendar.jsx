import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ServiceNotificationModal from '../components/ServiceNotificationModal';
import { useAuth } from '../hooks/useAuth';

/* ============================
   스타일 정의
   ============================ */

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #fafafa;
  min-height: calc(100vh - 130px - 317px);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 8px 16px;
  transition: all 0.2s ease;
  &:hover {
    color: #333;
  }
`;

const CalendarTitle = styled.h1`
  font-size: 24px;
  margin: 0 40px;
  color: #333;
  font-weight: 500;
`;

const EditButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: ${props =>
      props.children === '캘린더 수정' ? '#4a9d5f' : '#dc3545'};
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  &:hover {
    background-color: ${props =>
        props.children === '캘린더 수정' ? '#3d8450' : '#c82333'};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const CalendarWrapper = styled.div`
  width: 100%;
  background: white;
  overflow: hidden;
`;

const CalendarHeaderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: white;
  border-bottom: 1px solid #d0d0d0;
`;

const DayHeader = styled.div`
  padding: 15px 0;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  color: ${props =>
      props.isSunday ? 'red' : props.isSaturday ? 'blue' : '#666'};
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 120px);
`;

const DateCell = styled.div`
  position: relative;
  border-bottom: 1px solid #d0d0d0;
  padding: 6px;
  background-color: ${props => (props.isOtherMonth ? '#f5f5f5' : 'white')};
  min-height: 120px;
  &:nth-last-child(-n+7) {
    border-bottom: none;
  }
`;

const DateNumber = styled.div`
  font-size: 14px;
  font-weight: ${props => (props.isToday ? 'bold' : '400')};
  color: ${props =>
      props.isToday
          ? '#fff'
          : props.isOtherMonth
              ? '#bbb'
              : props.isSunday
                  ? 'red'
                  : props.isSaturday
                      ? 'blue'
                      : '#666'};
  background-color: ${props => (props.isToday ? '#dc3545' : 'transparent')};
  border-radius: ${props => (props.isToday ? '50%' : '0')};
  width: ${props => (props.isToday ? '24px' : 'auto')};
  height: ${props => (props.isToday ? '24px' : 'auto')};
  display: ${props => (props.isToday ? 'flex' : 'block')};
  align-items: ${props => (props.isToday ? 'center' : 'auto')};
  justify-content: ${props => (props.isToday ? 'center' : 'auto')};
  margin-bottom: 6px;
`;

const SpanningEventBar = styled.div`
  background-color: ${props => {
  const baseColor = 144;
  const intensity = Math.max(0, baseColor - props.stackIndex * 20);
  return `rgb(${intensity}, ${intensity + 50}, ${intensity})`;
}};
  padding: 4px 8px;
  margin-bottom: 3px;
  font-size: 11px;
  color: #2d5016;
  font-weight: 400;
  cursor: ${props => (props.editMode ? 'pointer' : 'default')};
  position: absolute;
  left: ${props => (props.isFirst ? '8px' : '0px')};
  right: ${props => (props.isLast ? '8px' : '0px')};
  top: ${props => 30 + props.stackIndex * 20}px;
  height: 18px;
  display: flex;
  align-items: center;
  border-radius: ${props =>
    props.isFirst && props.isLast
        ? '8px'
        : props.isFirst
            ? '8px 0 0 8px'
            : props.isLast
                ? '0 8px 8px 0'
                : '0'};
  opacity: ${props => (props.editMode ? '0.8' : '1')};
  border: ${props => (props.editMode ? '2px dashed #dc3545' : 'none')};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  background-color: #4a9d5f;
  color: white;
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const ModalBody = styled.div`
  padding: 24px;
  font-size: 16px;
  color: #333;
  text-align: center;
`;

const ModalFooter = styled.div`
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  &.confirm {
    background-color: #4a9d5f;
    color: white;
  }
  &.cancel {
    background-color: #6c757d;
    color: white;
  }
`;

/* ==========================================================
   메인 컴포넌트 시작
   ========================================================== */
const Calendar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [currentDate, setCurrentDate] = useState(() => {
    const targetDate = location.state?.targetDate;
    return targetDate ? new Date(targetDate) : new Date();
  });

  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // 서버에서 가져온 일정들
  const [calendarServices, setCalendarServices] = useState([]);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  /* 1. 서버에서 캘린더 데이터 불러오기 */
  const fetchCalendar = async () => {
    try {
      const res = await fetch('/api/calendar', { credentials: 'include' });
      if (!res.ok) throw new Error('서버 통신 실패');
      const data = await res.json();
      setCalendarServices(data);
    } catch (err) {
      console.error('캘린더 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCalendar();
  }, [isAuthenticated]);

  /* 2. 날짜별로 매핑 */
  const welfareServicesByDate = useMemo(() => {
    const servicesMap = {};
    calendarServices.forEach(service => {
      const startDate = new Date(service.applicationPeriod.startDate);
      const endDate = new Date(service.applicationPeriod.endDate);

      // rowIndex는 겹칠 때 위아래로 쌓이게 하는 용도
      for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
      ) {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const dateKey = `${y}-${m}-${day}`;

        if (!servicesMap[dateKey]) servicesMap[dateKey] = [];
        servicesMap[dateKey].push({
          ...service,
          rowIndex: servicesMap[dateKey].length,
        });
      }
    });
    return servicesMap;
  }, [calendarServices]);

  /* 3. 일정 삭제 */
  const handleConfirmDelete = async () => {
    try {
      // 컨트롤러는 welfareId 기반으로 삭제하니까 그걸 사용
      const res = await fetch(`/api/calendar/${serviceToDelete.welfareId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        alert('복지 서비스가 삭제되었습니다.');
        fetchCalendar();
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류 발생');
    }
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleServiceClick = service => {
    if (editMode) {
      setServiceToDelete(service);
      setShowDeleteModal(true);
    } else {
      setSelectedService(service);
      setShowNotificationModal(true);
    }
  };

  /* 4. 달력 UI 계산 */
  const changeMonth = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(
          prev.getMonth() + (direction === 'next' ? 1 : -1)
      );
      return newDate;
    });
  };

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    const isCurrentMonth =
        today.getFullYear() === year && today.getMonth() === month;

    const cells = [];

    // 이전 달 채우기
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({ date: prevMonthLastDay - i, isOtherMonth: true });
    }

    // 이번 달
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      cells.push({
        date: day,
        dateKey,
        isOtherMonth: false,
        isToday: isCurrentMonth && day === today.getDate(),
        services: welfareServicesByDate[dateKey] || [],
      });
    }

    // 다음 달 채우기 (5주 = 35칸 만들기)
    const remainingCells = 35 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({ date: i, isOtherMonth: true });
    }

    return cells;
  };

  const calendarData = generateCalendarData();

  /* 5. 인증/로딩 분기 */
  if (isLoading) {
    return (
        <Container>
          <div style={{ textAlign: 'center', marginTop: '40vh' }}>
            로딩 중...
          </div>
        </Container>
    );
  }

    if (!isAuthenticated) {
        return (
            <Container
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - 130px - 317px)',
                }}
            >
                <h2>로그인이 필요합니다</h2>
                <button
                    onClick={() => navigate('/LoginPage')}
                    style={{
                        marginTop: '20px',
                        backgroundColor: '#4a9d5f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                    }}
                >
                    로그인하러 가기
                </button>
            </Container>
        );
    }

  /* 6. 렌더링 */
  return (
      <Container>
        <CalendarHeader>
          <NavigationButton onClick={() => changeMonth('prev')}>
            ◀
          </NavigationButton>
          <CalendarTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </CalendarTitle>
          <NavigationButton onClick={() => changeMonth('next')}>
            ▶
          </NavigationButton>
        </CalendarHeader>

        <CalendarWrapper>
          <CalendarHeaderGrid>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <DayHeader
                    key={i}
                    isSunday={i === 0}
                    isSaturday={i === 6}
                >
                  {day}
                </DayHeader>
            ))}
          </CalendarHeaderGrid>

          <CalendarGrid>
            {calendarData.map((cell, i) => (
                <DateCell key={i} isOtherMonth={cell.isOtherMonth}>
                  {cell.date && (
                      <>
                        <DateNumber isToday={cell.isToday}>
                          {cell.date}
                        </DateNumber>

                        {cell.services?.map((service, idx) => {
                          const start = new Date(
                              service.applicationPeriod.startDate
                          );
                          const end = new Date(
                              service.applicationPeriod.endDate
                          );
                          const current = new Date(cell.dateKey);
                          const isFirst =
                              current.toDateString() ===
                              start.toDateString();
                          const isLast =
                              current.toDateString() === end.toDateString();

                          return (
                              <SpanningEventBar
                                  key={`${service.id}-${idx}`}
                                  stackIndex={service.rowIndex}
                                  isFirst={isFirst}
                                  isLast={isLast}
                                  editMode={editMode}
                                  onClick={() => handleServiceClick(service)}
                              >
                                {isFirst ? service.title : ''}
                              </SpanningEventBar>
                          );
                        })}
                      </>
                  )}
                </DateCell>
            ))}
          </CalendarGrid>
        </CalendarWrapper>

        <EditButton onClick={() => setEditMode(!editMode)}>
          {editMode ? '완료' : '캘린더 수정'}
        </EditButton>

        {/* 삭제 확인 모달 */}
        {showDeleteModal && (
            <ModalOverlay>
              <ModalContent>
                <ModalHeader>캘린더 알림 서비스</ModalHeader>
                <ModalBody>
                  "{serviceToDelete?.title}" 서비스를
                  <br />
                  삭제하시겠습니까?
                </ModalBody>
                <ModalFooter>
                  <ModalButton
                      className="cancel"
                      onClick={handleCancelDelete}
                  >
                    취소
                  </ModalButton>
                  <ModalButton
                      className="confirm"
                      onClick={handleConfirmDelete}
                  >
                    삭제
                  </ModalButton>
                </ModalFooter>
              </ModalContent>
            </ModalOverlay>
        )}

        {/* 알림 설정 모달 */}
        <ServiceNotificationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            service={selectedService}
        />
      </Container>
  );
};

export default Calendar;
