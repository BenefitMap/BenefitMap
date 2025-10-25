import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ServiceNotificationModal from '../components/ServiceNotificationModal';
import { useAuth } from '../hooks/useAuth';
import { checkAuthAndRedirect } from '../utils/auth';

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
  background-color: ${props => props.children === '캘린더 수정' ? '#4a9d5f' : '#dc3545'};
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
    background-color: ${props => props.children === '캘린더 수정' ? '#3d8450' : '#c82333'};
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
  color: ${props => {
    if (props.isSunday) return 'red';
    if (props.isSaturday) return 'blue';
    return '#666';
  }};
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
  background-color: ${props => props.isOtherMonth ? '#f5f5f5' : 'white'};
  min-height: 120px;

  &:nth-last-child(-n+7) {
    border-bottom: none;
  }
`;

const DateNumber = styled.div`
  font-size: 14px;
  font-weight: ${props => props.isToday ? 'bold' : '400'};
  color: ${props => {
    if (props.isToday) return '#fff';
    if (props.isOtherMonth) return '#bbb';
    if (props.isSunday) return 'red';
    if (props.isSaturday) return 'blue';
    return '#666';
  }};
  background-color: ${props => props.isToday ? '#dc3545' : 'transparent'};
  border-radius: ${props => props.isToday ? '50%' : '0'};
  width: ${props => props.isToday ? '24px' : 'auto'};
  height: ${props => props.isToday ? '24px' : 'auto'};
  display: ${props => props.isToday ? 'flex' : 'block'};
  align-items: ${props => props.isToday ? 'center' : 'auto'};
  justify-content: ${props => props.isToday ? 'center' : 'auto'};
  margin-bottom: 6px;
  text-align: left;
`;

const HolidayText = styled.div`
  font-size: 11px;
  color: #ff6b6b;
  font-weight: 400;
  display: inline-block;
  margin-left: 8px;
`;

const SpanningEventBar = styled.div`
  background-color: ${props => {
  const baseColor = 144; // #90ee90의 green-ish
  const intensity = Math.max(0, baseColor - (props.stackIndex * 20));
  return `rgb(${intensity}, ${intensity + 50}, ${intensity})`;
}};
  padding: 4px 8px;
  margin-bottom: 3px;
  font-size: 11px;
  color: #2d5016;
  font-weight: 400;
  cursor: ${props => props.editMode ? 'pointer' : 'default'};
  position: absolute;
  left: ${props => props.isFirst ? '8px' : '0px'};
  right: ${props => props.isLast ? '8px' : '0px'};
  top: ${props => 30 + (props.stackIndex * 20)}px;
  height: 18px;
  display: flex;
  align-items: center;
  border-radius: ${props => {
  if (props.isFirst && props.isLast) return '8px'; // 하루짜리
  if (props.isFirst) return '8px 0 0 8px';
  if (props.isLast) return '0 8px 8px 0';
  return '0';
}};
  z-index: 1;
  opacity: ${props => props.editMode ? '0.8' : '1'};
  border: ${props => props.editMode ? '2px dashed #dc3545' : 'none'};
    
  &:hover {
    background-color: ${props => {
  const baseColor = 127;
  const intensity = Math.max(0, baseColor - (props.stackIndex * 20));
  return `rgb(${intensity}, ${intensity + 30}, ${intensity})`;
}};
    opacity: ${props => props.editMode ? '1' : '0.9'};
  }
`;

/* 삭제 확인 모달 스타일 */
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
  line-height: 1.5;
  text-align: center;
`;

const ModalFooter = styled.div`
  padding: 0 24px 24px 24px;
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
  min-width: 80px;

  &.confirm {
    background-color: #4a9d5f;
    color: white;

    &:hover {
      background-color: #3d8450;
      transform: translateY(-1px);
    }
  }

  &.cancel {
    background-color: #6c757d;
    color: white;

    &:hover {
      background-color: #5a6268;
      transform: translateY(-1px);
    }
  }
`;

const Calendar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // 현재 보고 있는 년/월
  const [currentDate, setCurrentDate] = useState(() => {
    const targetDate = location.state?.targetDate;
    return targetDate ? new Date(targetDate) : new Date();
  });

  // UI 상태들
  const [editMode, setEditMode] = useState(false); // 캘린더 수정 모드
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // 알림 설정 모달 관련
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // ✅ localStorage에서 불러온 서비스들을 날짜별로 매핑한 구조
  const [welfareServices, setWelfareServices] = useState(() => {
    const savedServices = JSON.parse(localStorage.getItem('calendarServices') || '[]');

    // localStorage에 넣어둔 원본 정보 유지해서 들고오기 (부서 등 포함)
    const allServices = savedServices.map((service, index) => ({
      id: service.id,
      text: service.title,
      description: service.description,   // ✅ 추가
      department: service.department,     // ✅ 추가
      applicationPeriod: service.applicationPeriod,
      isMultiDay: service.applicationPeriod
          ? new Date(service.applicationPeriod.startDate).getTime() !==
          new Date(service.applicationPeriod.endDate).getTime()
          : false,
      startDate: service.applicationPeriod.startDate,
      endDate: service.applicationPeriod.endDate,
      span: service.applicationPeriod
          ? Math.ceil(
          (new Date(service.applicationPeriod.endDate) -
              new Date(service.applicationPeriod.startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1
          : 1,
      serviceId: service.id,
      addedOrder: index, // 추가 순서 저장
    }));

    // 날짜별로 서비스 배열 매핑
    const servicesMap = {};

    allServices.forEach((service) => {
      const startDate = new Date(service.startDate);
      const endDate = new Date(service.endDate);

      for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
      ) {
        const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

        if (!servicesMap[dateKey]) {
          servicesMap[dateKey] = [];
        }

        servicesMap[dateKey].push({
          ...service,
          rowIndex: servicesMap[dateKey].length,
        });
      }
    });

    return servicesMap;
  });

  // ✅ localStorage 변경 시 동기화
  useEffect(() => {
    const handleStorageChange = () => {
      const savedServices = JSON.parse(localStorage.getItem('calendarServices') || '[]');

      const allServices = savedServices.map((service, index) => ({
        id: service.id,
        text: service.title,
        description: service.description,   // ✅ 추가
        department: service.department,     // ✅ 추가
        applicationPeriod: service.applicationPeriod,
        isMultiDay: service.applicationPeriod
            ? new Date(service.applicationPeriod.startDate).getTime() !==
            new Date(service.applicationPeriod.endDate).getTime()
            : false,
        startDate: service.applicationPeriod.startDate,
        endDate: service.applicationPeriod.endDate,
        span: service.applicationPeriod
            ? Math.ceil(
            (new Date(service.applicationPeriod.endDate) -
                new Date(service.applicationPeriod.startDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1
            : 1,
        serviceId: service.id,
        addedOrder: index,
      }));

      const servicesMap = {};

      allServices.forEach((service) => {
        const startDate = new Date(service.startDate);
        const endDate = new Date(service.endDate);

        for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
        ) {
          const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

          if (!servicesMap[dateKey]) {
            servicesMap[dateKey] = [];
          }

          servicesMap[dateKey].push({
            ...service,
            rowIndex: servicesMap[dateKey].length,
          });
        }
      });

      setWelfareServices(servicesMap);
    };

    window.addEventListener('storage', handleStorageChange);

    // 마운트 시 즉시 동기화
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 로그인된 경우만 캘린더 위치로 스크롤
  useEffect(() => {
    if (!isAuthenticated) return;

    const timer = setTimeout(() => {
      const calendarElement = document.querySelector('[data-calendar-container]');
      if (calendarElement) {
        calendarElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else {
        window.scrollTo({
          top: window.innerHeight * 0.3,
          behavior: 'smooth',
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentDate, isAuthenticated]);

  // 캘린더에서 일정(복지서비스) 클릭
  // 수정모드면 삭제 모달 띄우고,
  // 일반모드면 알림설정 모달 띄움
  const handleServiceClick = (service) => {
    if (editMode) {
      setServiceToDelete(service);
      setShowDeleteModal(true);
    } else {
      // ✅ 여기서 department, description도 함께 넘김
      const serviceData = {
        id: service.id,
        title: service.text,
        applicationPeriod: service.applicationPeriod,
        department: service.department || '담당부서 정보 없음',
        description: service.description || '',
      };
      setSelectedService(serviceData);
      setShowNotificationModal(true);
    }
  };

  // 삭제 확정
  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      const serviceId = serviceToDelete.id;
      const existingServices = JSON.parse(localStorage.getItem('calendarServices') || '[]');
      const updatedServices = existingServices.filter(
          (s) => s.id !== serviceId
      );
      localStorage.setItem('calendarServices', JSON.stringify(updatedServices));

      // 수동으로 storage 이벤트 날려서 화면 싱크
      window.dispatchEvent(new Event('storage'));

      alert('복지 서비스가 삭제되었습니다.');
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  // 삭제 취소
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  // 알림 설정 저장
  const handleNotificationSave = (serviceId, settings) => {
    console.log(`서비스 ${serviceId} 알림 설정 저장:`, settings);
    // 필요하면 서버 저장 등 추가 가능
  };

  // 알림 모달 닫기
  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
    setSelectedService(null);
  };

  // 한국 공휴일 (2024~2025만 예시로 넣어둠)
  const holidays = {
    // 2024
    '2024-1-1': '신정',
    '2024-2-9': '설날연휴',
    '2024-2-10': '설날연휴',
    '2024-2-11': '설날',
    '2024-2-12': '설날연휴',
    '2024-3-1': '삼일절',
    '2024-4-10': '국회의원선거일',
    '2024-5-5': '어린이날',
    '2024-5-15': '부처님오신날',
    '2024-6-6': '현충일',
    '2024-8-15': '광복절',
    '2024-9-16': '추석연휴',
    '2024-9-17': '추석',
    '2024-9-18': '추석연휴',
    '2024-10-3': '개천절',
    '2024-10-9': '한글날',
    '2024-12-25': '크리스마스',
    // 2025
    '2025-1-1': '신정',
    '2025-1-28': '설날연휴',
    '2025-1-29': '설날',
    '2025-1-30': '설날연휴',
    '2025-3-1': '삼일절',
    '2025-5-5': '어린이날',
    '2025-5-13': '부처님오신날',
    '2025-6-6': '현충일',
    '2025-8-15': '광복절',
    '2025-10-5': '추석연휴',
    '2025-10-6': '추석',
    '2025-10-7': '추석연휴',
    '2025-10-8': '추석연휴',
    '2025-10-3': '개천절',
    '2025-10-9': '한글날',
    '2025-12-25': '크리스마스',
  };

  // 이전/다음 달로 이동
  const changeMonth = (direction) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 달력 셀 데이터 만들기
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

    const calendarData = [];

    // 이전 달 날짜 채우기
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      calendarData.push({
        date: prevMonthLastDay - i,
        isOtherMonth: true,
        isToday: false,
        services: [],
      });
    }

    // 이번 달 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      const dayServices = welfareServices[dateKey] || [];
      const isToday = isCurrentMonth && day === today.getDate();

      calendarData.push({
        date: day,
        isOtherMonth: false,
        isToday: isToday,
        services: dayServices,
        dateKey: dateKey,
      });
    }

    // 다음 달 날짜로 칸 채우기 (5주 = 35칸 가정)
    const remainingCells = 35 - calendarData.length;
    for (let day = 1; day <= remainingCells; day++) {
      calendarData.push({
        date: day,
        isOtherMonth: true,
        isToday: false,
        services: [],
      });
    }

    return calendarData;
  };

  const calendarData = generateCalendarData();

  // 디버깅 로그
  console.log('Calendar Debug - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  console.log('Calendar Debug - localStorage access_token:', !!localStorage.getItem('access_token'));
  console.log('Calendar Debug - localStorage user_info:', !!localStorage.getItem('user_info'));
  console.log('Calendar Debug - userSettings:', !!localStorage.getItem('userSettings'));

  // 아직 로그인 여부 확인 중이면 로딩
  if (isLoading) {
    return (
        <Container>
          <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                fontSize: '18px',
                color: '#666',
              }}
          >
            로딩 중...
          </div>
        </Container>
    );
  }

  // 로그인 안 한 상태일 때 보여줄 화면
  if (!isAuthenticated) {
    return (
        <Container>
          <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
                padding: '40px 20px',
                position: 'relative',
                top: '-80px',
              }}
          >
            <div
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '16px',
                  padding: '40px 60px',
                  maxWidth: '600px',
                  width: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e9ecef',
                }}
            >
              <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '16px',
                  }}
              >
                로그인 및 설정이 필요합니다
              </h2>
              <p
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '24px',
                    lineHeight: '1.5',
                  }}
              >
                캘린더 기능을 사용하려면
                <br />
                로그인과 개인 맞춤형 설정을 완료해주세요.
              </p>
              <button
                  onClick={() => navigate('/LoginPage')}
                  style={{
                    backgroundColor: '#4a9d5f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#3d8450')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#4a9d5f')}
              >
                로그인하러 가기
              </button>
            </div>
          </div>
        </Container>
    );
  }

  // 로그인 된 유저에게 보여줄 실제 캘린더 화면
  return (
      <Container data-calendar-container>
        <CalendarHeader>
          <NavigationButton onClick={() => changeMonth('prev')}>◀</NavigationButton>
          <CalendarTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </CalendarTitle>
          <NavigationButton onClick={() => changeMonth('next')}>▶</NavigationButton>
        </CalendarHeader>

        <CalendarWrapper>
          <CalendarHeaderGrid>
            {daysOfWeek.map((day, index) => (
                <DayHeader
                    key={index}
                    isSunday={index === 0}
                    isSaturday={index === 6}
                >
                  {day}
                </DayHeader>
            ))}
          </CalendarHeaderGrid>

          <CalendarGrid>
            {calendarData.map((cell, index) => {
              const dayOfWeek = index % 7;
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;
              const holidayName = cell.dateKey ? holidays[cell.dateKey] : null;

              return (
                  <DateCell
                      key={index}
                      isOtherMonth={cell.isOtherMonth}
                      isToday={cell.isToday}
                  >
                    {cell.date && (
                        <>
                          <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '6px',
                              }}
                          >
                            <DateNumber
                                isSunday={isSunday}
                                isSaturday={isSaturday}
                                isOtherMonth={cell.isOtherMonth}
                                isToday={cell.isToday}
                            >
                              {cell.date}
                            </DateNumber>

                            {holidayName && !cell.isOtherMonth && (
                                <HolidayText>{holidayName}</HolidayText>
                            )}
                          </div>

                          {cell.services.map((service, serviceIndex) => {
                            // 기간 계산
                            const startDate = new Date(
                                service.applicationPeriod?.startDate ||
                                service.startDate
                            );
                            const endDate = new Date(
                                service.applicationPeriod?.endDate || service.endDate
                            );
                            const currentCellDate = new Date(cell.dateKey);

                            // 날짜만 비교
                            const startDateOnly = new Date(
                                startDate.getFullYear(),
                                startDate.getMonth(),
                                startDate.getDate()
                            );
                            const endDateOnly = new Date(
                                endDate.getFullYear(),
                                endDate.getMonth(),
                                endDate.getDate()
                            );
                            const currentDateOnly = new Date(
                                currentCellDate.getFullYear(),
                                currentCellDate.getMonth(),
                                currentCellDate.getDate()
                            );

                            const isFirst =
                                currentDateOnly.getTime() ===
                                startDateOnly.getTime();
                            const isLast =
                                currentDateOnly.getTime() === endDateOnly.getTime();

                            return (
                                <SpanningEventBar
                                    key={`${service.id}-${serviceIndex}`}
                                    stackIndex={service.rowIndex}
                                    isFirst={isFirst}
                                    isLast={isLast}
                                    editMode={editMode}
                                    onClick={() => handleServiceClick(service)}
                                >
                                  {isFirst ? service.text : ''}
                                </SpanningEventBar>
                            );
                          })}
                        </>
                    )}
                  </DateCell>
              );
            })}
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
                  "{serviceToDelete?.text}" 캘린더 서비스를
                  <br />
                  삭제하시겠습니까?
                </ModalBody>
                <ModalFooter>
                  <ModalButton className="cancel" onClick={handleCancelDelete}>
                    취소
                  </ModalButton>
                  <ModalButton className="confirm" onClick={handleConfirmDelete}>
                    삭제
                  </ModalButton>
                </ModalFooter>
              </ModalContent>
            </ModalOverlay>
        )}

        {/* 서비스별 알림 설정 모달 */}
        <ServiceNotificationModal
            isOpen={showNotificationModal}
            onClose={handleCloseNotificationModal}
            service={selectedService}
            onSave={handleNotificationSave}
        />
      </Container>
  );
};

export default Calendar;
