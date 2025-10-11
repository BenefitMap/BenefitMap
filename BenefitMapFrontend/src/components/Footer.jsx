import styled from 'styled-components';
import React from 'react';
import BenefitMapLogo from '../assets/BenefitMapLogo.png';

const FooterContainer = styled.footer`
  width: 100%;
  max-width: 1920px;
  height: 317px;
  background-color: #ECECEC;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    height: 250px;
  }
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const FooterContent = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  
  @media (max-width: 1200px) {
    padding: 0 30px;
  }
  
  @media (max-width: 768px) {
    padding: 0 20px;
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #4a4a4a;
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Copyright = styled.p`
  font-size: 12px;
  color: #666666;
  margin: 8px 0 0 0;
  
  @media (max-width: 768px) {
    font-size: 10px;
    margin: 4px 0 0 0;
  }
`;

const LogoImage = styled.img`
  height: 60px;
  object-fit: contain;
  
  @media (max-width: 768px) {
    height: 40px;
  }
`;

export default function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <CompanyInfo>
          <InfoText>주소: 경기도 안양시 동안구 임곡로 29, 대림대학교 전산관</InfoText>
          <InfoText>전화번호: 010-0000-0000</InfoText>
          <InfoText>이메일: XXXX@GMAIL.COM</InfoText>
          <Copyright>© 2025 BENEFIT MAP. ALL RIGHTS RESERVED.</Copyright>
        </CompanyInfo>
        
        <LogoImage src={BenefitMapLogo} alt="BENEFIT MAP" />
      </FooterContent>
    </FooterContainer>
  );
}