import React, { useState } from 'react';
import styled, { css } from 'styled-components';

// --- 스타일 정의 (Styled Components) ---

const MainContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

// ... (다른 styled-components 코드는 .tsx와 동일)
const SearchWrapper = styled.div` /* ... */ `;
const SearchInput = styled.input` /* ... */ `;
const SearchButton = styled.button` /* ... */ `;
const CalendarWrapper = styled.div` /* ... */ `;
const CalendarNav = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0 1rem;
    font-size: 1.25rem;
    width: 120px;
    text-align: center;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #555;
    &:hover {
      color: #000;
    }
  }
`;
const CalendarGrid = styled.div` /* ... */ `;
const CalendarHeaderCell = styled.div` /* ... */ `;

// <{...}> 타입 부분을 제거
const DayCell = styled.div`
  padding: 0.5rem 0.2rem;
  min-height: 80px;
  font-size: 0.85rem;
  border-top: 1px solid #f0f0f0;
  position: relative;
  visibility: ${props => props.$isEmpty ? 'hidden' : 'visible'};

  ${props => props.$isHighlighted && css`
    background-color: #fff9c4;
    border-radius: 4px;
  `}
`;

const EventText = styled.p` /* ... */ `;
const SectionTitle = styled.div` /* ... */ `;
const KeywordSection = styled.div` /* ... */ `;
const KeywordsContainer = styled.div` /* ... */ `;
const KeywordButton = styled.button` /* ... */ `;
const RecommendationSection = styled.div` /* ... */ `;
const LoginPromptBox = styled.div` /* ... */ `;

// --- SVG 아이콘 컴포넌트 ---

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// { color: string } 타입 부분을 제거
const TrophyIcon = ({ color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1-2.5-2.5V4a2.5 2.5 0 0 1 2.5-2.5H6c4.33 0 6.5 1.7 6.5 7.5S10.33 16 6 16"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 2.5-2.5V4a2.5 2.5 0 0 0-2.5-2.5H18c-4.33 0-6.5 1.7-6.5 7.5S13.67 16 18 16"></path><path d="M12 16v6"></path><path d="M8 22h8"></path><path d="M12 11V7"></path></svg>
);

// --- 메인 페이지 컴포넌트 ---

const events = {
  '2025-5-2': '청년 주택 드림',
  '2025-5-11': '아동 복지 마감',
  '2025-5-27': '연금',
};

// : React.FC 부분을 제거
const MainPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

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
      const isHighlighted = (eventKey === '2025-5-2' || eventKey === '2025-5-3' || eventKey === '2025-5-11' || eventKey === '2025-5-27' || eventKey === '2025-5-28');
      days.push(
        <DayCell key={day} $isHighlighted={isHighlighted}>
          <span>{day}</span>
          {events[eventKey] && <EventText>{events[eventKey]}</EventText>}
        </DayCell>
      );
    }
    return days;
  };
  
  return (
    <MainContainer>
      {/* ... (이하 JSX 구조는 .tsx와 동일) */}
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
          <KeywordButton><TrophyIcon color="#DAA520" />청년월세</KeywordButton>
          <KeywordButton><TrophyIcon color="#C0C0C0" />연금</KeywordButton>
          <KeywordButton><TrophyIcon color="#CD7F32" />아동복지</KeywordButton>
        </KeywordsContainer>
      </KeywordSection>
      <RecommendationSection>
        <SectionTitle>맞춤 추천 복지</SectionTitle>
        <LoginPromptBox><p>로그인 후 이용해 주세요.</p></LoginPromptBox>
      </RecommendationSection>
    </MainContainer>
  );
};

export default MainPage;