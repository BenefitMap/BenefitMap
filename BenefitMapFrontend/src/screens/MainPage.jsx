import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isLoggedIn, getUserInfo } from '../utils/auth';

/* =========================
   styled-components
   ========================= */

const MainContainer = styled.div`
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
`;

/* 검색 영역 */
const SearchWrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 500px;
    background-color: #e6f4ea;
    border-radius: 50px;
    padding: 8px 10px 8px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
    flex-grow: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 1rem;
    &::placeholder {
        color: #5c7f67;
    }
`;

const SearchButton = styled.button`
    background: #333;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
        background-color: #555;
    }
`;

/* =========================
   캘린더 카드 스타일
   ========================= */

const CalendarCard = styled.div`
    width: 100%;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border: 1px solid #e0e0e0;
`;

const CalendarHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.2rem 0;
    border-bottom: 1px solid #e0e0e0;
    background-color: #fff;
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
    font-size: 20px;
    margin: 0 40px;
    color: #333;
    font-weight: 500;
    width: 180px;
    text-align: center;
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
            props.$isSunday ? 'red' : props.$isSaturday ? 'blue' : '#666'};
`;

/* 달력 본문은 '주 단위 행(WeekRow)'들을 수직으로 쌓는 형태 */
const CalendarBody = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #fff;
`;

/* 한 주(7일)를 감싸는 행 */
const WeekRow = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    min-height: 120px;
    border-bottom: 1px solid #d0d0d0;
    &:last-child {
        border-bottom: none;
    }
`;

/* 각 칸(요일 한 칸) */
const DayCellWrapper = styled.div`
    position: relative;
    min-height: 120px;
    border-right: 1px solid #d0d0d0;
    background-color: ${props => (props.$isOtherMonth ? '#f5f5f5' : 'white')};
    padding: 6px;
    box-sizing: border-box;
    &:nth-child(7n) {
        border-right: none;
    }
`;

const DateNumber = styled.div`
    font-size: 14px;
    font-weight: ${props => (props.$isToday ? 'bold' : '400')};
    color: ${props => {
        if (props.$isToday) return '#fff';
        if (props.$isOtherMonth) return '#bbb';
        if (props.$isSunday) return 'red';
        if (props.$isSaturday) return 'blue';
        return '#666';
    }};
    background-color: ${props => (props.$isToday ? '#dc3545' : 'transparent')};
    border-radius: ${props => (props.$isToday ? '50%' : '0')};
    width: ${props => (props.$isToday ? '24px' : 'auto')};
    height: ${props => (props.$isToday ? '24px' : 'auto')};
    display: ${props => (props.$isToday ? 'flex' : 'block')};
    align-items: ${props => (props.$isToday ? 'center' : 'auto')};
    justify-content: ${props => (props.$isToday ? 'center' : 'auto')};
    margin-bottom: 6px;
`;

/* =========================
   Modern Contrast Theme 막대
   ========================= */
const SpanningEventBar = styled.div`
    position: absolute;
    height: 18px;

    /* 줄마다(겹침 순서마다) 색상을 달리해서 시각적으로 구분 */
    background-color: ${props => {
        const palette = [
            '#4a9d5f', // 짙은 녹 - 기본
            '#5eb06e', // 조금 더 밝은 녹
            '#6fbe80', // 중간 톤
            '#7ecc96', // 연한 민트톤
            '#9dd9b2', // 파스텔 민트
            '#bce7c9', // 매우 연한 파스텔
        ];
        return palette[props.$rowIndex % palette.length];
    }};

    color: #fff;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
    font-size: 11px;
    font-weight: 500;
    padding: 4px 8px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    border-radius: ${props =>
            props.$isFirst && props.$isLast
                    ? '8px'
                    : props.$isFirst
                            ? '8px 0 0 8px'
                            : props.$isLast
                                    ? '0 8px 8px 0'
                                    : '0'};

    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    top: ${props => 30 + props.$rowIndex * 20}px;

    transition: filter 0.15s ease;
    cursor: pointer;

    &:hover {
        filter: brightness(1.07);
    }
`;

/* =========================
   로그인 / 추천 영역
   ========================= */
const RecommendationSection = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
`;

const LoginPromptBox = styled.div`
    width: 100%;
    min-height: 150px;
    border: 1px dashed #ccc;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;

    p {
        color: #888;
        font-size: 1.1rem;
    }
`;

const RecommendationBox = styled.div`
    width: 100%;
    min-height: 150px;
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const RecommendationTitle = styled.h3`
    margin: 0;
    color: #495057;
    font-size: 1rem;
    font-weight: 600;
`;

const RecommendationItem = styled.div`
    background: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    border-left: 3px solid #91D0A6;
    cursor: pointer;
    transition: background 0.2s;
    &:hover {
        background: #e9f7ee;
    }
    h4 {
        margin: 0 0 6px 0;
        color: #495057;
        font-size: 0.9rem;
        font-weight: 600;
    }
    p {
        margin: 0;
        color: #6c757d;
        font-size: 0.8rem;
        line-height: 1.4;
    }
`;

/* =========================
   아이콘
   ========================= */
const SearchIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

/* =========================
   날짜 유틸
   ========================= */

// 안전한 로컬 Date 생성 ("2025-10-11" → 로컬 2025-10-11 00:00)
function parseYyyyMmDdLocal(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function ymdKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/* =========================
   메인 컴포넌트
   ========================= */
const MainPage = () => {
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchText, setSearchText] = useState('');

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [displayName, setDisplayName] = useState('');

    // 서버에서 받아오는 전체 일정
    // [{ id,welfareId,title, applicationPeriod:{startDate,endDate}, ... }, ...]
    const [calendarServices, setCalendarServices] = useState([]);

    // 추천 복지
    const [recommendList, setRecommendList] = useState([]);

    /* 로그인 상태 + 유저 정보 동기화 */
    const syncLoginInfo = useCallback(async () => {
        const loggedIn = isLoggedIn();
        setIsUserLoggedIn(loggedIn);

        // localStorage 우선
        const localUser = getUserInfo();
        if (localUser?.name) {
            setDisplayName(localUser.name);
        }

        // 서버에서 최신 정보
        if (loggedIn) {
            try {
                const res = await fetch('/user/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                const json = await res.json();
                if (json?.success && json?.data?.basic?.name) {
                    setDisplayName(json.data.basic.name);
                }
            } catch (err) {
                // 연결 오류(ECONNREFUSED)는 백엔드가 시작 중일 수 있으므로 조용히 처리
                if (err.message?.includes('fetch') || err.cause?.code === 'ECONNREFUSED') {
                    // 백엔드가 시작 중일 수 있음 - 조용히 무시
                    return;
                }
                console.error('메인페이지 /user/me 실패:', err);
            }
        }
    }, []);

    /* 추천 복지 불러오기 */
    const fetchRecommendations = useCallback(async () => {
        if (!isLoggedIn()) {
            setRecommendList([]);
            return;
        }

        try {
            const res = await fetch('/api/catalog/recommend', {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                console.warn('추천 API HTTP 오류:', res.status);
                setRecommendList([]);
                return;
            }

            const raw = await res.json();

            if (Array.isArray(raw)) {
                setRecommendList(raw.slice(0, 3));
                return;
            }
            if (Array.isArray(raw.data)) {
                setRecommendList(raw.data.slice(0, 3));
                return;
            }
            if (Array.isArray(raw.content)) {
                setRecommendList(raw.content.slice(0, 3));
                return;
            }
            if (raw.data && Array.isArray(raw.data.items)) {
                setRecommendList(raw.data.items.slice(0, 3));
                return;
            }
            if (raw.data && Array.isArray(raw.data.recommendations)) {
                setRecommendList(raw.data.recommendations.slice(0, 3));
                return;
            }

            console.warn('❗추천 API 응답에서 추천 리스트를 못 찾음:', raw);
            setRecommendList([]);
        } catch (err) {
            // 연결 오류는 백엔드가 시작 중일 수 있으므로 조용히 처리
            if (err.message?.includes('fetch') || err.cause?.code === 'ECONNREFUSED') {
                return; // 조용히 무시
            }
            console.error('추천 API 호출 실패:', err);
            setRecommendList([]);
        }
    }, []);

    /* 캘린더 일정 불러오기 */
    const fetchCalendar = useCallback(async () => {
        if (!isLoggedIn()) {
            setCalendarServices([]);
            return;
        }

        try {
            const res = await fetch('/api/calendar', {
                method: 'GET',
                credentials: 'include',
            });
            if (!res.ok) {
                console.warn('캘린더 API HTTP 오류:', res.status);
                setCalendarServices([]);
                return;
            }

            const data = await res.json();
            setCalendarServices(data || []);
        } catch (err) {
            // 연결 오류는 백엔드가 시작 중일 수 있으므로 조용히 처리
            if (err.message?.includes('fetch') || err.cause?.code === 'ECONNREFUSED') {
                return; // 조용히 무시
            }
            console.error('메인페이지 캘린더 불러오기 실패:', err);
            setCalendarServices([]);
        }
    }, []);

    /* 초기 로드 & 주기적 동기화 */
    useEffect(() => {
        syncLoginInfo();
        fetchRecommendations();
        fetchCalendar();

        // 1초는 너무 빈번함. 30초로 변경
        const interval = setInterval(() => {
            syncLoginInfo();
            fetchRecommendations();
            fetchCalendar();
        }, 30000); // 30초마다 동기화

        return () => clearInterval(interval);
    }, [syncLoginInfo, fetchRecommendations, fetchCalendar]);

    /* 달 이동 */
    const changeMonth = useCallback((direction) => {
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(
                prevDate.getMonth() + (direction === 'next' ? 1 : -1)
            );
            return newDate;
        });
    }, []);

    /* month grid 만들기 */
    const monthMatrix = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-index
        const firstOfMonth = new Date(year, month, 1);
        const firstDayOfWeek = firstOfMonth.getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const allDates = [];

        // 이전 달에서 채우는 날짜들
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            allDates.push(new Date(year, month - 1, prevMonthLastDay - i));
        }

        // 이번 달 날짜들
        for (let d = 1; d <= daysInMonth; d++) {
            allDates.push(new Date(year, month, d));
        }

        // 다음 달로 채우기 -> 총 35 또는 42칸
        while (allDates.length % 7 !== 0 || allDates.length < 35) {
            const last = allDates[allDates.length - 1];
            allDates.push(
                new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
            );
            if (allDates.length >= 42) break;
        }

        // 7일씩 끊어서 weeks 배열로
        const weeks = [];
        for (let i = 0; i < allDates.length; i += 7) {
            weeks.push(allDates.slice(i, i + 7));
        }

        return weeks;
    }, [currentDate]);

    /* 한 주 안에서 보여줄 bar들 계산 */
    const computeBarsForWeek = useCallback(
        (weekDates, viewYear, viewMonth) => {
            if (!isUserLoggedIn) return [];

            const weekStart = weekDates[0];
            const weekEnd = weekDates[6];

            const rawBars = [];
            calendarServices.forEach((svc) => {
                const startStr = svc?.applicationPeriod?.startDate;
                const endStr = svc?.applicationPeriod?.endDate;
                if (!startStr || !endStr) return;

                const start = parseYyyyMmDdLocal(startStr);
                const end = parseYyyyMmDdLocal(endStr);

                // 이 주와 전혀 안 겹치면 패스
                if (end < weekStart || start > weekEnd) return;

                // 이 주에서의 시작 / 끝 index
                let firstIdx = 0;
                if (start > weekStart) {
                    const found = weekDates.findIndex(
                        (d) => ymdKey(d) === ymdKey(start)
                    );
                    firstIdx = found === -1 ? 0 : found;
                }

                let lastIdx = 6;
                if (end < weekEnd) {
                    const found = weekDates.findIndex(
                        (d) => ymdKey(d) === ymdKey(end)
                    );
                    lastIdx = found === -1 ? 6 : found;
                }

                // 이 막대가 "이번 달 안에서" 이미 이어지고 있는 상태인지 체크
                // -> 이번 달의 첫날
                const monthHead = new Date(viewYear, viewMonth, 1, 0, 0, 0);
                // 화면상 이 주의 첫날이 이번 달의 첫날인가?
                const isMonthFirstWeekHead =
                    weekStart.toDateString() === monthHead.toDateString();

                // start가 이번달 첫날보다 이전이면 (즉, 이전달부터 이어진 복지면)
                // 이번 달 첫 주 첫 구간에서도 이름을 찍도록 도와줄 flag
                const startedBeforeMonth = start < monthHead;

                rawBars.push({
                    svc,
                    firstIdx,
                    lastIdx,
                    isFirst: start >= weekStart, // 이 주에서의 실제 시작?
                    isLast: end <= weekEnd,      // 이 주에서의 실제 끝?
                    // 이 달 기준으로 이어지는 막대라면 달 첫 주의 첫 셀에서도 label 찍을거야
                    showLabelAtWeekHead:
                        isMonthFirstWeekHead && startedBeforeMonth,
                });
            });

            // 겹치는 bar들끼리 rowIndex 할당 (lane 비슷하게)
            const placed = [];
            rawBars.forEach((bar) => {
                let rowIndex = 0;
                while (true) {
                    const conflict = placed.some(
                        (p) =>
                            p.rowIndex === rowIndex &&
                            !(
                                bar.lastIdx < p.firstIdx ||
                                bar.firstIdx > p.lastIdx
                            )
                    );
                    if (!conflict) break;
                    rowIndex++;
                }
                placed.push({ ...bar, rowIndex });
            });

            return placed;
        },
        [calendarServices, isUserLoggedIn]
    );

    /* 검색 제출 */
    const handleSearchSubmit = useCallback(() => {
        const keyword = searchText.trim();
        if (!keyword) return;
        navigate('/ServicePage', {
            state: {
                initialKeyword: keyword,
            },
        });
    }, [navigate, searchText]);

    /* =========================
       렌더
       ========================= */
    const today = new Date();
    const viewYear = currentDate.getFullYear();
    const viewMonth = currentDate.getMonth(); // 0-index

    return (
        <MainContainer>
            {/* 검색 영역 */}
            <SearchWrapper>
                <SearchInput
                    type="text"
                    placeholder="검색어를 입력하세요."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearchSubmit();
                        }
                    }}
                />
                <SearchButton onClick={handleSearchSubmit}>
                    <SearchIcon />
                </SearchButton>
            </SearchWrapper>

            {/* 캘린더 카드 */}
            <CalendarCard>
                <CalendarHeader>
                    <NavigationButton onClick={() => changeMonth('prev')}>
                        ◀
                    </NavigationButton>
                    <CalendarTitle>
                        {viewYear}년 {viewMonth + 1}월
                    </CalendarTitle>
                    <NavigationButton onClick={() => changeMonth('next')}>
                        ▶
                    </NavigationButton>
                </CalendarHeader>

                {/* 요일 헤더 */}
                <CalendarHeaderGrid>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                        <DayHeader
                            key={idx}
                            $isSunday={idx === 0}
                            $isSaturday={idx === 6}
                        >
                            {day}
                        </DayHeader>
                    ))}
                </CalendarHeaderGrid>

                {/* 주 단위 렌더 */}
                <CalendarBody>
                    {monthMatrix.map((weekDates, wIdx) => {
                        const bars = computeBarsForWeek(
                            weekDates,
                            viewYear,
                            viewMonth
                        );

                        return (
                            <WeekRow key={wIdx}>
                                {/* 요일 칸들 */}
                                {weekDates.map((dateObj, dIdx) => {
                                    const isOtherMonth =
                                        dateObj.getMonth() !== viewMonth;
                                    const isToday =
                                        dateObj.getFullYear() ===
                                        today.getFullYear() &&
                                        dateObj.getMonth() ===
                                        today.getMonth() &&
                                        dateObj.getDate() === today.getDate();

                                    return (
                                        <DayCellWrapper
                                            key={dIdx}
                                            $isOtherMonth={isOtherMonth}
                                        >
                                            <DateNumber
                                                $isSunday={dIdx === 0}
                                                $isSaturday={dIdx === 6}
                                                $isOtherMonth={isOtherMonth}
                                                $isToday={isToday}
                                            >
                                                {dateObj.getDate()}
                                            </DateNumber>
                                        </DayCellWrapper>
                                    );
                                })}

                                {/* 이 주에 걸친 막대들 */}
                                {bars.map((bar, idx) => {
                                    const svc = bar.svc;
                                    const startCell = bar.firstIdx;
                                    const endCell = bar.lastIdx;

                                    // 타이틀 노출 규칙:
                                    // - 이 주 안에서 실제 시작하는 경우(isFirst)
                                    // - OR 이 달이 이미 진행 중인 복지인데 달의 첫 주라서 showLabelAtWeekHead=true
                                    const showLabel =
                                        bar.isFirst || bar.showLabelAtWeekHead;

                                    return (
                                        <SpanningEventBar
                                            key={idx}
                                            $rowIndex={bar.rowIndex}
                                            $isFirst={bar.isFirst}
                                            $isLast={bar.isLast}
                                            style={{
                                                left: `calc(${(startCell / 7) * 100}% + ${
                                                    bar.isFirst ? '6px' : '0px'
                                                })`,
                                                right: `calc(${(
                                                    (6 - endCell) /
                                                    7
                                                ) * 100}% + ${
                                                    bar.isLast ? '6px' : '0px'
                                                })`,
                                            }}
                                            onClick={() => {
                                                if (!isUserLoggedIn) return;
                                                // 홈 캘린더에서 클릭 시 상세 캘린더로 이동
                                                const jumpDate =
                                                    parseYyyyMmDdLocal(
                                                        svc.applicationPeriod
                                                            .startDate
                                                    );
                                                navigate('/calendar', {
                                                    state: {
                                                        targetDate: jumpDate,
                                                    },
                                                });
                                            }}
                                        >
                                            {showLabel ? svc.title : ''}
                                        </SpanningEventBar>
                                    );
                                })}
                            </WeekRow>
                        );
                    })}
                </CalendarBody>
            </CalendarCard>

            {/* 맞춤 추천 복지 영역 */}
            <RecommendationSection>
                {!isUserLoggedIn ? (
                    <LoginPromptBox>
                        <p>로그인 후 이용해 주세요.</p>
                    </LoginPromptBox>
                ) : (
                    <RecommendationBox>
                        <RecommendationTitle>
                            안녕하세요, {displayName || '사용자'}님!
                        </RecommendationTitle>

                        {recommendList.length === 0 ? (
                            <p
                                style={{
                                    color: '#888',
                                    fontSize: '0.9rem',
                                    margin: 0,
                                }}
                            >
                                현재 추천 가능한 복지가 없어요.
                            </p>
                        ) : (
                            recommendList.map((item) => (
                                <RecommendationItem
                                    key={item.id ?? item.welfareName}
                                    onClick={() => {
                                        navigate(`/service/${item.id}`, {
                                            state: {
                                                service: {
                                                    id: item.id,
                                                    title: item.welfareName,
                                                    description:
                                                    item.description,
                                                    department:
                                                    item.department,
                                                    cycle: item.supportCycle,
                                                    type: item.supplyType,
                                                    contact: item.contact,
                                                    tags: [
                                                        ...(item.lifecycles ||
                                                            []),
                                                        ...(item.households ||
                                                            []),
                                                        ...(item.interests ||
                                                            []),
                                                    ],
                                                    applicationPeriod: {
                                                        startDate:
                                                        item.startDate,
                                                        endDate: item.endDate,
                                                        isOngoing:
                                                            !item.endDate,
                                                    },
                                                },
                                            },
                                        });
                                    }}
                                >
                                    <h4>{item.welfareName || '복지 서비스'}</h4>
                                    <p>
                                        {item.description ||
                                            '설명이 준비중입니다.'}
                                    </p>
                                </RecommendationItem>
                            ))
                        )}
                    </RecommendationBox>
                )}
            </RecommendationSection>
        </MainContainer>
    );
};

export default MainPage;
