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
    /* ---- Modern Contrast Theme (줄마다 명도/색상 다양화) ---- */
    background-color: ${props => {
        const colors = [
            '#4a9d5f', // 기본 녹색
            '#5eb06e', // 살짝 밝은
            '#6fbe80', // 중간톤
            '#7ecc96', // 민트 느낌
            '#9dd9b2', // 연한 청록
            '#bce7c9', // 거의 파스텔톤
        ];
        return colors[props.stackIndex % colors.length];
    }};

    padding: 4px 8px;
    margin-bottom: 3px;
    font-size: 11px;
    color: #fff; /* ✅ 흰 글씨 유지 */
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.4); /* ✅ 명도 대비 확보 */
    font-weight: 500;

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
    opacity: ${props => (props.editMode ? '0.85' : '1')};
    border: ${props => (props.editMode ? '2px dashed #dc3545' : 'none')};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: filter 0.15s ease;

    &:hover {
        filter: brightness(1.07);
    }
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

    // 현재 보고 있는 달
    const [currentDate, setCurrentDate] = useState(() => {
        const targetDate = location.state?.targetDate;
        return targetDate ? new Date(targetDate) : new Date();
    });

    // 캘린더 편집/삭제 모드
    const [editMode, setEditMode] = useState(false);

    // 삭제 확인 모달 상태
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // 알림(상세) 모달 상태
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // 서버에서 받아온 전체 일정
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

    /* 2. 이번 달 기준 lane 계산
          - 한 달 동안 같은 복지 서비스는 항상 같은 lane(줄번호) 유지하도록 */
    const servicesWithLane = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0~11

        // 이번 달의 시작과 끝
        const monthStart = new Date(year, month, 1, 0, 0, 0);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

        // 이번 달에 걸치는 서비스만 추려서, 이 달 안에서 실제로 보일 구간(_clippedStart/_clippedEnd) 계산
        const monthServices = calendarServices
            .map((svc) => {
                const rawStart = new Date(svc.applicationPeriod.startDate);
                const rawEnd = new Date(svc.applicationPeriod.endDate);

                // 이 달과 전혀 안 겹치면 제외
                if (rawEnd < monthStart || rawStart > monthEnd) {
                    return null;
                }

                // 화면에 보일 실제 시작/끝 (달 경계를 벗어나면 잘라낸다)
                const clippedStart = rawStart < monthStart ? monthStart : rawStart;
                const clippedEnd = rawEnd > monthEnd ? monthEnd : rawEnd;

                return {
                    ...svc,
                    _clippedStart: clippedStart,
                    _clippedEnd: clippedEnd,
                };
            })
            .filter(Boolean);

        // 시작 빠른 순으로 정렬
        monthServices.sort(
            (a, b) =>
                a._clippedStart - b._clippedStart ||
                a._clippedEnd - b._clippedEnd
        );

        // lane 할당
        // lanes[i] = 그 lane에서 마지막으로 차지한 서비스의 끝나는 날짜
        const lanes = [];
        const result = [];

        monthServices.forEach((svc) => {
            let assignedLane = 0;

            for (; assignedLane < lanes.length; assignedLane++) {
                const lastEnd = lanes[assignedLane];
                // 이 lane의 마지막 서비스가 끝난 날 < 현재 서비스 시작일이면 겹치지 않으므로 재사용 가능
                if (lastEnd < svc._clippedStart) {
                    break;
                }
            }

            // 적당한 lane이 없으면 새 lane 추가
            if (assignedLane === lanes.length) {
                lanes.push(svc._clippedEnd);
            } else {
                lanes[assignedLane] = svc._clippedEnd;
            }

            result.push({
                ...svc,
                lane: assignedLane, // 이게 우리가 쓸 고정 줄 번호
            });
        });

        return result;
    }, [calendarServices, currentDate]);

    /* 3. 날짜별 매핑
          - 각 날짜에 어떤 서비스들이 있는지 모으고
          - 각 서비스는 lane(=rowIndex)을 그대로 유지해서 넣는다 */
    const welfareServicesByDate = useMemo(() => {
        const servicesMap = {};

        servicesWithLane.forEach((service) => {
            const startDate = new Date(service.applicationPeriod.startDate);
            const endDate = new Date(service.applicationPeriod.endDate);

            // 서비스 기간 전체를 하루씩 돌면서 dateKey에 push
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
                    rowIndex: service.lane, // ✅ 날짜마다 새로 계산 안 하고 lane 고정
                });
            }
        });

        return servicesMap;
    }, [servicesWithLane]);

    /* 4. 일정 삭제 */
    const handleConfirmDelete = async () => {
        try {
            // 컨트롤러에서 welfareId 기반으로 삭제한다고 가정
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

    const handleServiceClick = (service) => {
        if (editMode) {
            setServiceToDelete(service);
            setShowDeleteModal(true);
        } else {
            setSelectedService(service);
            setShowNotificationModal(true);
        }
    };

    /* 5. 달력 셀 데이터 만들기 */
    const changeMonth = (direction) => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
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

        // 앞쪽: 이전 달 날짜 채우기
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

        // 뒷쪽: 다음 달 날짜로 채워서 총 35칸(5주)
        const remainingCells = 35 - cells.length;
        for (let i = 1; i <= remainingCells; i++) {
            cells.push({ date: i, isOtherMonth: true });
        }

        return cells;
    };

    const calendarData = generateCalendarData();

    /* 6. 인증/로딩 분기 */
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

    /* 7. 렌더링 */
    return (
        <Container>
            {/* 상단 월 이동 헤더 */}
            <CalendarHeader>
                <NavigationButton onClick={() => changeMonth('prev')}>◀</NavigationButton>
                <CalendarTitle>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </CalendarTitle>
                <NavigationButton onClick={() => changeMonth('next')}>▶</NavigationButton>
            </CalendarHeader>

            {/* 달력 그리드 */}
            <CalendarWrapper>
                <CalendarHeaderGrid>
                    {daysOfWeek.map((day, i) => (
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
                                    <DateNumber
                                        isToday={cell.isToday}
                                        isOtherMonth={cell.isOtherMonth}
                                        isSunday={i % 7 === 0}
                                        isSaturday={i % 7 === 6}
                                    >
                                        {cell.date}
                                    </DateNumber>
                                    {cell.services?.map((service, idx) => {
                                        const start = new Date(service.applicationPeriod.startDate);
                                        const end = new Date(service.applicationPeriod.endDate);
                                        const current = new Date(cell.dateKey);

                                        const isFirst =
                                            current.toDateString() === start.toDateString();
                                        const isLast =
                                            current.toDateString() === end.toDateString();

                                        // 이번 달의 첫 날 (예: 2025-11-01 00:00:00)
                                        const monthStartOfView = new Date(
                                            currentDate.getFullYear(),
                                            currentDate.getMonth(),
                                            1,
                                            0, 0, 0
                                        );

                                        // "이 서비스가 지난달부터 이어진 상태로 이번 달에도 계속되고 있다" 를 말해주는 조건:
                                        // - 지금 보고 있는 셀이 이번 달 첫날이다
                                        // - 근데 서비스 시작일은 그보다 더 이전이다 (즉 이전 달부터 이미 진행 중)
                                        const isMonthHead =
                                            current.toDateString() === monthStartOfView.toDateString() &&
                                            start < monthStartOfView;

                                        const shouldShowLabel = isFirst || isMonthHead;

                                        return (
                                            <SpanningEventBar
                                                key={`${service.id || service.welfareId || idx}-${idx}`}
                                                stackIndex={service.rowIndex}
                                                isFirst={isFirst}
                                                isLast={isLast}
                                                editMode={editMode}
                                                onClick={() => handleServiceClick(service)}
                                            >
                                                {shouldShowLabel ? service.title : ''}
                                            </SpanningEventBar>
                                        );
                                    })}
                                </>
                            )}
                        </DateCell>
                    ))}
                </CalendarGrid>
            </CalendarWrapper>

            {/* 우하단 편집 버튼 */}
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

            {/* 알림 설정/상세 모달 */}
            <ServiceNotificationModal
                isOpen={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                service={selectedService}
            />
        </Container>
    );
};

export default Calendar;
