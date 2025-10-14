import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 감지 → 일정 높이 이상 내려가면 버튼 표시
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // 맨 위로 부드럽게 스크롤 이동
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    isVisible && (
      <TopButton onClick={scrollToTop}>
        <ArrowIcon>↑</ArrowIcon>
      </TopButton>
    )
  );
};

// 🔹 styled-components
const TopButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9d5f, #3d8b52);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  z-index: 1000; /* 다른 UI 위에 표시 */
`;

const ArrowIcon = styled.span`
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
`;

export default ScrollToTopButton;