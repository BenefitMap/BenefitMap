import styled from 'styled-components';

// 공통 색상 정의
export const colors = {
  primary: '#91D0A6',
  primaryHover: '#7BB899',
  secondary: '#333',
  background: '#ffffff',
  border: '#d0d0d0',
  text: '#333',
  textSecondary: '#767676',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowHover: 'rgba(145, 208, 166, 0.3)',
};

// 공통 폰트 정의
export const fonts = {
  primary: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  sizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '24px',
    xxlarge: '32px',
  },
  weights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
};

// 공통 간격 정의
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// 공통 브레이크포인트
export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px',
};

// 공통 컨테이너
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.md};
  }
`;

// 공통 버튼 스타일
export const Button = styled.button`
  background: ${props => props.variant === 'primary' ? colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? colors.background : colors.text};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${colors.border}`};
  border-radius: ${props => props.rounded ? '50px' : '8px'};
  padding: ${spacing.sm} ${spacing.lg};
  font-size: ${fonts.sizes.medium};
  font-weight: ${fonts.weights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  
  &:hover {
    background: ${props => props.variant === 'primary' ? colors.primaryHover : colors.background};
    box-shadow: ${props => props.variant === 'primary' ? `0 2px 8px ${colors.shadowHover}` : `0 2px 4px ${colors.shadow}`};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 공통 카드 스타일
export const Card = styled.div`
  background: ${colors.background};
  border-radius: 12px;
  box-shadow: 0 2px 8px ${colors.shadow};
  padding: ${spacing.lg};
  border: 1px solid ${colors.border};
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 16px ${colors.shadow};
  }
`;

// 공통 입력 필드 스타일
export const Input = styled.input`
  width: 100%;
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: ${fonts.sizes.medium};
  font-family: ${fonts.primary};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.shadowHover};
  }
  
  &::placeholder {
    color: ${colors.textSecondary};
  }
`;

// 공통 모달 스타일
export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${colors.background};
  border-radius: 12px;
  padding: ${spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px ${colors.shadow};
`;

// 공통 드롭다운 스타일
export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${colors.background};
  border-radius: 12px;
  box-shadow: 0 4px 20px ${colors.shadow};
  border: 1px solid ${colors.border};
  z-index: 1000;
  overflow: hidden;
  min-width: 180px;
`;

export const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: 100%;
  background: none;
  border: none;
  padding: ${spacing.sm} ${spacing.md};
  text-align: left;
  font-size: ${fonts.sizes.small};
  color: ${colors.text};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:first-child {
    border-bottom: 1px solid #f0f0f0;
  }
`;
