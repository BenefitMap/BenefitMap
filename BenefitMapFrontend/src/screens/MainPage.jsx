import React, { useState, useEffect, useCallback } from 'react';
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
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const CalendarNav = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.2rem 0;
  h2 {
    margin: 0 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    width: 150px;
    text-align: center;
  }
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 2rem;
    color: #555;
    &:hover {
      color: #000;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
`;

const CalendarHeaderCell = styled.div`
  padding: 0.8rem 0;
  font-weight: 600;
  color: #888;
  border-bottom: 1px solid #e0e0e0;
  &:not(:last-child) {
     border-right: 1px solid #e0e0e0;
  }
`;

const DayCell = styled.div`
  padding: 0.5rem;
  min-height: 100px;
  font-size: 0.9rem;
  border-top: 1px solid #e0e0e0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  visibility: ${props => props.$isEmpty ? 'hidden' : 'visible'};
  &:not(:nth-child(7n)) {
    border-right: 1px solid #e0e0e0;
  }
  &:nth-child(7n-6) > span { color: red; }
  &:nth-child(7n) > span { color: blue; }
  ${props => props.$isHighlighted && `
    background-color: #ffffe0;
  `}
`;

const DayNumber = styled.span`
  font-weight: 500;
  margin-bottom: 4px;
`;

const EventText = styled.p`
  margin: 0;
  padding: 2px 5px;
  font-size: 0.75rem;
  background-color: rgba(0,0,0,0.05);
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
`;

const SectionTitle = styled.div`
  width: 100%;
  background-color: #e6f4ea;
  color: #3e664a;
  font-weight: bold;
  padding: 12px 0;
  border-radius: 50px;
  text-align: center;
  font-size: 1.1rem;
`;

const KeywordSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const KeywordsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  width: 100%;
  padding: 20px 0;
`;

const KeywordWrapper = styled.div`
  position: relative;
`;

const KeywordButton = styled.button`
  padding: 10px 30px;
  border: 1px solid #ddd;
  border-radius: 50px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RecommendationTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const RecommendationItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #91D0A6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  h4 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 1rem;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

// --- SVG 아이콘 컴포넌트 ---

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// ✅ 이미지와 100% 동일한 트로피 SVG 코드
const TrophyIcon = ({ color, className }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 트로피 본체 (컵 부분) */}
    <path d="M6.5 7H17.5C18.3284 7 19 7.67157 19 8.5V13C19 15.7614 16.7614 18 14 18H10C7.23858 18 5 15.7614 5 13V8.5C5 7.67157 5.67157 7 6.5 7Z" 
          fill={color} stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* 트로피 받침대 */}
    <path d="M8 18H16" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 21H16.5C17.0523 21 17.5 20.5523 17.5 20V19H6.5V20C6.5 20.5523 6.94772 21 7.5 21Z" 
          fill={color} stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>

    {/* 트로피 손잡이 왼쪽 */}
    <path d="M4 11C4 10.1716 4.67157 9.5 5.5 9.5H6.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 9C3.67157 9 3 8.32843 3 7.5V5.5C3 4.67157 3.67157 4 4.5 4H6.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>

    {/* 트로피 손잡이 오른쪽 */}
    <path d="M20 11C20 10.1716 19.3284 9.5 18.5 9.5H17.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.5 9C20.3284 9 21 8.32843 21 7.5V5.5C21 4.67157 20.3284 4 19.5 4H17.5" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>

    {/* 트로피 내부의 선들 */}
    <path d="M10 10V15" stroke="#333" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
    <path d="M14 10V15" stroke="#333" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
  </svg>
);


const TrophyIconWrapper = styled(TrophyIcon)`
  position: absolute;
  top: -14px;      /* 아이콘 높이의 절반만큼 위로 */
  left: 15px;      /* 왼쪽에서 약간 안으로 */
  z-index: 2;
  filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.2)); /* 그림자 추가 */
`;


// --- 메인 페이지 컴포넌트 ---

const events = {
  '2025-5-2': '청년 주택 드림',
  '2025-5-11': '아동 복지 마감',
  '2025-5-27': '연금',
};

const MainPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1));
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // 로그인 상태 확인 함수를 useCallback으로 최적화
  const checkLoginStatus = useCallback(() => {
    const loggedIn = isLoggedIn();
    const user = getUserInfo();
    setIsUserLoggedIn(loggedIn);
    setUserInfo(user);
  }, []);

  // 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
    
    // 주기적으로 로그인 상태 확인 (localStorage 변경 감지)
    const interval = setInterval(checkLoginStatus, 1000);
    
    return () => clearInterval(interval);
  }, [checkLoginStatus]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }, [currentDate]);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }, [currentDate]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<DayCell key={`empty-${i}`} $isEmpty />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const eventKey = `${year}-${month}-${day}`;
      const highlightedDates = [
        '2025-5-2', '2025-5-3', '2025-5-11', '2025-5-12', '2025-5-27', '2025-5-28'
      ];
      const isHighlighted = highlightedDates.includes(eventKey);
      days.push(
        <DayCell key={day} $isHighlighted={isHighlighted}>
          <DayNumber>{day}</DayNumber>
          {events[eventKey] && <EventText>{events[eventKey]}</EventText>}
        </DayCell>
      );
    }
    return days;
  };
  
  return (
    <MainContainer>
      <SearchWrapper>
        <SearchInput type="text" placeholder="검색어를 입력하세요." />
        <SearchButton><SearchIcon /></SearchButton>
      </SearchWrapper>

      <CalendarWrapper>
        <CalendarNav>
            <button onClick={handlePrevMonth}>&lt;</button>
            <h2>{`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}</h2>
            <button onClick={handleNextMonth}>&gt;</button>
        </CalendarNav>
        <CalendarGrid>
          {['일', '월', '화', '수', '목', '금', '토'].map(day => <CalendarHeaderCell key={day}>{day}</CalendarHeaderCell>)}
          {renderCalendar()}
        </CalendarGrid>
      </CalendarWrapper>

      <KeywordSection>
        <SectionTitle>이달의 복지 키워드</SectionTitle>
        <KeywordsContainer>
          <KeywordWrapper>
            <TrophyIconWrapper color="#FFD700" /> {/* 금색 */}
            <KeywordButton>청년월세</KeywordButton>
          </KeywordWrapper>
          <KeywordWrapper>
            <TrophyIconWrapper color="#C0C0C0" /> {/* 은색 */}
            <KeywordButton>연금</KeywordButton>
          </KeywordWrapper>
          <KeywordWrapper>
            <TrophyIconWrapper color="#CD7F32" /> {/* 동색 */}
            <KeywordButton>아동복지</KeywordButton>
          </KeywordWrapper>
        </KeywordsContainer>
      </KeywordSection>

      <RecommendationSection>
        <SectionTitle>맞춤 추천 복지</SectionTitle>
        {isUserLoggedIn ? (
          <RecommendationBox>
            <RecommendationTitle>
              안녕하세요, {userInfo?.name || '사용자'}님! 👋
            </RecommendationTitle>
            <RecommendationItem>
              <h4>🎯 청년 월세 지원</h4>
              <p>20대 청년을 위한 월세 지원금 신청이 가능합니다. 신청 기간: 2025.05.01 ~ 2025.05.31</p>
            </RecommendationItem>
            <RecommendationItem>
              <h4>🏠 청년 주택 드림</h4>
              <p>청년층을 위한 전세자금 대출 지원 프로그램입니다. 신청 기간: 2025.05.01 ~ 2025.05.31</p>
            </RecommendationItem>
            <RecommendationItem>
              <h4>👶 아동 복지</h4>
              <p>아동 수당 및 양육비 지원 신청이 가능합니다. 신청 기간: 2025.05.01 ~ 2025.05.31</p>
            </RecommendationItem>
          </RecommendationBox>
        ) : (
          <LoginPromptBox><p>로그인 후 이용해 주세요.</p></LoginPromptBox>
        )}
      </RecommendationSection>
    </MainContainer>
  );
};

export default MainPage;