import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isLoggedIn, getUserInfo } from '../utils/auth';

// --- 스타일 정의 (Styled Components) ---

const MainContainer = styled.div`
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

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

const CalendarWrapper = styled.div`
    width: 100%;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
`;

const CalendarHeader = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.2rem 0;
    border-bottom: 1px solid #e0e0e0;
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
    width: 180px;
    text-align: center;
`;

const CalendarHeaderGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: #f8f9fa;
`;

const DayHeader = styled.div`
    padding: 15px 0;
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    color: ${props => {
        if (props.$isSunday) return 'red';
        if (props.$isSaturday) return 'blue';
        return '#666';
    }};
`;

const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: 100px;
`;

const DateCell = styled.div`
    position: relative;
    border-bottom: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    padding: 6px;
    background-color: ${props => (props.$isOtherMonth ? '#f5f5f5' : 'white')};
    min-height: 100px;
    visibility: ${props => (props.$isEmpty ? 'hidden' : 'visible')};

    &:nth-child(7n) {
        border-right: none;
    }

    &:nth-last-child(-n+7) {
        border-bottom: none;
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

const EventText = styled.p`
    margin: 0;
    padding: 2px 4px;
    font-size: 0.7rem;
    background-color: #e6f4ea;
    border-radius: 3px;
    width: 100%;
    box-sizing: border-box;
    text-align: left;
    color: #3e664a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SectionTitle = styled.div`
    width: 100%;
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    padding: 12px 0;
    border-radius: 8px;
    text-align: center;
    font-size: 1rem;
    border: 1px solid #e9ecef;
`;

const KeywordSection = styled.div`
    width: 100%
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
`;

const KeywordsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 20px;
    width: 100%;
    padding: 16px 0;
`;

const KeywordWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`;

const RankBadge = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    background-color: ${props => {
        switch (props.$rank) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#6c757d';
        }
    }};
`;

const KeywordButton = styled.button`
    padding: 8px 20px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    background-color: white;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    color: #495057;
    transition: all 0.2s ease;

    &:hover {
        background-color: #f8f9fa;
        border-color: #dee2e6;
    }
`;

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

// --- SVG 아이콘 컴포넌트 ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// --- 더미 이벤트 데이터 ---
const events = {
    '2025-5-2': '청년 주택 드림',
    '2025-5-11': '아동 복지 마감',
    '2025-5-27': '연금',
};

// --- 메인 컴포넌트 ---
const MainPage = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    // 로컬/서버에서 가져온 사용자 이름
    const [displayName, setDisplayName] = useState('');

    const daysOfWeek = useMemo(
        () => ['일', '월', '화', '수', '목', '금', '토'],
        []
    );

    // 로그인 상태 확인 + 유저 정보 싱크
    const syncLoginInfo = useCallback(async () => {
        const loggedIn = isLoggedIn();
        setIsUserLoggedIn(loggedIn);

        // 1차: localStorage에 있는 정보 사용 (빠르게)
        const localUser = getUserInfo();
        if (localUser?.name) {
            setDisplayName(localUser.name);
        }

        // 2차: 서버 진짜 값으로 업데이트 (/user/me)
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
                console.error('메인페이지 /user/me 실패:', err);
            }
        }
    }, []);

    useEffect(() => {
        syncLoginInfo();
        const interval = setInterval(syncLoginInfo, 1000);
        return () => clearInterval(interval);
    }, [syncLoginInfo]);

    // 월 이동
    const changeMonth = useCallback((direction) => {
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setDate(1);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    }, []);

    // 캘린더 렌더
    const renderCalendar = useCallback(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const calendarData = [];

        // 이전 달
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            calendarData.push({
                date: prevMonthLastDay - i,
                isOtherMonth: true,
            });
        }

        // 이번 달
        for (let day = 1; day <= daysInMonth; day++) {
            calendarData.push({
                date: day,
                isOtherMonth: false,
                year,
                month,
            });
        }

        // 다음 달 (총 칸수 35 또는 42 맞추기)
        const totalCells = calendarData.length > 35 ? 42 : 35;
        const remainingCells = totalCells - calendarData.length;
        for (let day = 1; day <= remainingCells; day++) {
            calendarData.push({
                date: day,
                isOtherMonth: true,
            });
        }

        return calendarData.map((cell, index) => {
            const isToday =
                !cell.isOtherMonth &&
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === cell.date;

            const eventKey = `${cell.year}-${cell.month + 1}-${cell.date}`;
            const event = events[eventKey];

            return (
                <DateCell key={index} $isOtherMonth={cell.isOtherMonth}>
                    <DateNumber
                        $isSunday={index % 7 === 0}
                        $isSaturday={index % 7 === 6}
                        $isOtherMonth={cell.isOtherMonth}
                        $isToday={isToday}
                    >
                        {cell.date}
                    </DateNumber>
                    {event && !cell.isOtherMonth && <EventText>{event}</EventText>}
                </DateCell>
            );
        });
    }, [currentDate]);

    return (
        <MainContainer>
            {/* 검색바 */}
            <SearchWrapper>
                <SearchInput type="text" placeholder="검색어를 입력하세요." />
                <SearchButton>
                    <SearchIcon />
                </SearchButton>
            </SearchWrapper>

            {/* 캘린더 */}
            <CalendarWrapper>
                <CalendarHeader>
                    <NavigationButton onClick={() => changeMonth('prev')}>◀</NavigationButton>
                    <CalendarTitle>
                        {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </CalendarTitle>
                    <NavigationButton onClick={() => changeMonth('next')}>▶</NavigationButton>
                </CalendarHeader>

                <CalendarHeaderGrid>
                    {daysOfWeek.map((day, index) => (
                        <DayHeader
                            key={index}
                            $isSunday={index === 0}
                            $isSaturday={index === 6}
                        >
                            {day}
                        </DayHeader>
                    ))}
                </CalendarHeaderGrid>

                <CalendarGrid>{renderCalendar()}</CalendarGrid>
            </CalendarWrapper>

            {/* 키워드 섹션 */}
            <KeywordSection>
                <SectionTitle>이달의 복지 키워드</SectionTitle>
                <KeywordsContainer>
                    <KeywordWrapper>
                        <RankBadge $rank={2}>2</RankBadge>
                        <KeywordButton>연금</KeywordButton>
                    </KeywordWrapper>
                    <KeywordWrapper>
                        <RankBadge $rank={1}>1</RankBadge>
                        <KeywordButton>청년월세</KeywordButton>
                    </KeywordWrapper>
                    <KeywordWrapper>
                        <RankBadge $rank={3}>3</RankBadge>
                        <KeywordButton>아동복지</KeywordButton>
                    </KeywordWrapper>
                </KeywordsContainer>
            </KeywordSection>

            {/* 맞춤 추천 */}
            <RecommendationSection>
                <SectionTitle>맞춤 추천 복지</SectionTitle>

                {isUserLoggedIn ? (
                    <RecommendationBox>
                        <RecommendationTitle>
                            안녕하세요, {displayName || '사용자'}님!
                        </RecommendationTitle>

                        <RecommendationItem>
                            <h4>청년 월세 지원</h4>
                            <p>20대 청년을 위한 월세 지원금 신청이 가능합니다.</p>
                        </RecommendationItem>

                        <RecommendationItem>
                            <h4>청년 주택 드림</h4>
                            <p>청년층을 위한 전세자금 대출 지원 프로그램입니다.</p>
                        </RecommendationItem>

                        <RecommendationItem>
                            <h4>아동 복지</h4>
                            <p>아동 수당 및 양육비 지원 신청이 가능합니다.</p>
                        </RecommendationItem>
                    </RecommendationBox>
                ) : (
                    <LoginPromptBox>
                        <p>로그인 후 이용해 주세요.</p>
                    </LoginPromptBox>
                )}
            </RecommendationSection>
        </MainContainer>
    );
};

export default MainPage;
