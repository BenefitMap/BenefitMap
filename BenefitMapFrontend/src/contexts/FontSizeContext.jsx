import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export const FontSizeProvider = ({ children }) => {
  // 기본 폰트 크기: 1.0 (100%)
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseFloat(saved) : 1.0;
  });

  // 폰트 크기 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize.toString());
    // CSS 변수 업데이트
    document.documentElement.style.setProperty('--font-size-multiplier', fontSize);
  }, [fontSize]);

  // 폰트 크기 조절 함수들
  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 0.1, 1.5)); // 최대 150%
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 0.1, 1.0)); // 최소 100%
  };

  const resetFontSize = () => {
    setFontSize(1.0);
  };

  const setFontSizeLevel = (level) => {
    const sizeMap = {
      'normal': 1.0,
      'large': 1.2,
      'xlarge': 1.5
    };
    setFontSize(sizeMap[level] || 1.0);
  };

  const getFontSizeLevel = () => {
    if (fontSize <= 1.1) return 'normal';
    if (fontSize <= 1.3) return 'large';
    return 'xlarge';
  };

  const value = {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setFontSizeLevel,
    getFontSizeLevel
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};
