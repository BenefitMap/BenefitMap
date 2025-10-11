import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useFontSize } from '../contexts/FontSizeContext';

const ControlsContainer = styled.div`
  position: fixed;
  top: ${props => props.top}px;
  right: ${props => props.right}px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  user-select: none;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const DragHandle = styled.div`
  width: 100%;
  height: 20px;
  background: linear-gradient(90deg, #ccc 0%, #999 50%, #ccc 100%);
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: linear-gradient(90deg, #999 0%, #666 50%, #999 100%);
  }
  
  &::before {
    content: '';
    width: 20px;
    height: 3px;
    background: white;
    border-radius: 2px;
  }
`;

const ControlButton = styled.button`
  background: ${props => props.primary ? '#007bff' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 1px solid ${props => props.primary ? '#007bff' : '#dee2e6'};
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
  
  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#e9ecef'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FontSizeDisplay = styled.div`
  text-align: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const QuickSelect = styled.select`
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FontSizeControls = () => {
  const { 
    fontSize, 
    increaseFontSize, 
    decreaseFontSize, 
    resetFontSize, 
    setFontSizeLevel, 
    getFontSizeLevel 
  } = useFontSize();

  const [position, setPosition] = useState({ top: 100, right: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startTop: 0, startRight: 0 });
  const containerRef = useRef(null);

  const currentLevel = getFontSizeLevel();
  const percentage = Math.round(fontSize * 100);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('select')) return; // 버튼이나 select 클릭 시 드래그 방지
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startTop: position.top,
      startRight: position.right
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const newTop = Math.max(0, Math.min(window.innerHeight - 200, dragStart.startTop + deltaY));
    const newRight = Math.max(0, Math.min(window.innerWidth - 200, dragStart.startRight - deltaX));

    setPosition({ top: newTop, right: newRight });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <ControlsContainer 
      ref={containerRef}
      top={position.top}
      right={position.right}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
    >
      <DragHandle />
      <FontSizeDisplay>
        글자 크기: {percentage}%
      </FontSizeDisplay>
      
      <ButtonGroup>
        <ControlButton 
          onClick={decreaseFontSize}
          disabled={fontSize <= 1.0}
          title="글자 크기 줄이기"
        >
          A-
        </ControlButton>
        
        <ControlButton 
          onClick={increaseFontSize}
          disabled={fontSize >= 1.5}
          title="글자 크기 늘리기"
        >
          A+
        </ControlButton>
        
        <ControlButton 
          onClick={resetFontSize}
          title="기본 크기로 되돌리기"
        >
          초기화
        </ControlButton>
      </ButtonGroup>
      
      <QuickSelect 
        value={currentLevel}
        onChange={(e) => setFontSizeLevel(e.target.value)}
      >
        <option value="normal">보통 (100%)</option>
        <option value="large">크게 (120%)</option>
        <option value="xlarge">매우 크게 (150%)</option>
      </QuickSelect>
    </ControlsContainer>
  );
};

export default FontSizeControls;
