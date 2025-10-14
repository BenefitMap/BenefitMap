import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { colors, fonts, spacing, breakpoints } from '../styles/CommonStyles';
import { createDeadlineNotificationEmail, getUserEmail, isEmailNotificationEnabled } from '../utils/emailNotification';
import { useAuth } from '../hooks/useAuth';
import { checkAuthAndRedirect } from '../utils/auth';

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
`;

const MainContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${colors.primary};
  font-size: ${fonts.sizes.medium};
  cursor: pointer;
  padding: ${spacing.sm} 0;
  margin-bottom: ${spacing.lg};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  
  &:hover {
    color: ${colors.primaryHover};
  }
`;

const DetailCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 32px;
  border: 1px solid #e9ecef;
  margin-bottom: 24px;
`;

const ServiceHeader = styled.div`
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 24px;
  margin-bottom: 24px;
`;

const ServiceTags = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const ServiceTag = styled.span`
  background-color: #f8f9fa;
  color: ${colors.primary};
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid #e9ecef;
`;

const ServiceTitle = styled.h1`
  font-size: 24px;
  color: ${colors.text};
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.4;
`;

const ServiceDescription = styled.p`
  font-size: 16px;
  color: ${colors.textLight};
  line-height: 1.6;
  margin-bottom: 0;
`;

const DetailSection = styled.div`
  margin-bottom: ${spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${fonts.sizes.large};
  color: ${colors.text};
  margin-bottom: ${spacing.md};
  font-weight: ${fonts.weights.medium};
  border-left: 4px solid ${colors.primary};
  padding-left: ${spacing.md};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${spacing.lg};
`;

const DetailItem = styled.div`
  background-color: #f8f9fa;
  padding: ${spacing.lg};
  border-radius: 12px;
  border-left: 4px solid ${colors.primary};
`;

const DetailLabel = styled.div`
  font-size: ${fonts.sizes.small};
  color: ${colors.textLight};
  margin-bottom: ${spacing.xs};
  font-weight: ${fonts.weights.medium};
`;

const DetailValue = styled.div`
  font-size: ${fonts.sizes.medium};
  color: ${colors.text};
  font-weight: ${fonts.weights.regular};
`;

const ApplicationPeriodSection = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0;
`;

const PeriodTitle = styled.h4`
  color: #495057;
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 600;
`;

const PeriodInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md};
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${spacing.sm};
  }
`;

const PeriodDate = styled.div`
  font-size: ${fonts.sizes.medium};
  color: #e65100;
  font-weight: ${fonts.weights.medium};
`;

const StatusBadge = styled.span`
  background-color: #4caf50;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-top: ${spacing.xl};
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const AddToCalendarButton = styled.button`
  background-color: ${colors.primary};
  color: white;
  border: none;
  padding: ${spacing.lg} ${spacing.xl};
  border-radius: 12px;
  font-size: ${fonts.sizes.medium};
  font-weight: ${fonts.weights.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  
  &:hover {
    background-color: ${colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(145, 208, 166, 0.3);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ContactButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: ${spacing.lg} ${spacing.xl};
  border-radius: 12px;
  font-size: ${fonts.sizes.medium};
  font-weight: ${fonts.weights.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  
  &:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 117, 125, 0.3);
  }
`;

const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const service = location.state?.service;
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const { isAuthenticated } = useAuth();

  // 복지서비스 상세 페이지는 로그인 없이도 접근 가능

  // 페이지 로드 시 가운데로 스크롤
  useEffect(() => {
    const scrollToCenter = () => {
      const container = document.querySelector('[data-service-detail]');
      if (container) {
        container.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    };
    
    // 약간의 지연을 두고 실행 (DOM이 완전히 렌더링된 후)
    setTimeout(scrollToCenter, 100);
  }, []);

  // 서비스 데이터가 없으면 홈으로 리다이렉트
  if (!service) {
    navigate('/ServicePage');
    return null;
  }

  const handleAddToCalendar = async () => {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      alert('캘린더에 추가하려면 로그인이 필요합니다.');
      navigate('/LoginPage');
      return;
    }

    setIsAddingToCalendar(true);
    
    try {
      // 중복 체크
      const existingServices = JSON.parse(localStorage.getItem('calendarServices') || '[]');
      const isAlreadyAdded = existingServices.some(existingService => existingService.id === service.id);
      
      if (isAlreadyAdded) {
        alert('이미 추가된 일정입니다.');
        setIsAddingToCalendar(false);
        return;
      }

      // 캘린더에 추가할 데이터 준비
      const calendarData = {
        id: service.id,
        title: service.title,
        description: service.description,
        department: service.department,
        contact: service.contact,
        tags: service.tags,
        applicationPeriod: service.applicationPeriod || {
          startDate: new Date().toISOString().split('T')[0], // 오늘 날짜
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7일 후
          isOngoing: false
        }
      };

      // 로컬 스토리지에 저장
      const updatedServices = [...existingServices, calendarData];
      localStorage.setItem('calendarServices', JSON.stringify(updatedServices));
      
      console.log('캘린더에 추가된 서비스:', calendarData);
      console.log('전체 캘린더 서비스:', updatedServices);

      // 이메일 알림 생성 (마감 3일 전)
      if (isEmailNotificationEnabled() && service.applicationPeriod) {
        const userEmail = getUserEmail();
        if (userEmail) {
          const endDate = new Date(service.applicationPeriod.endDate);
          const today = new Date();
          const daysUntilDeadline = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDeadline > 3) {
            createDeadlineNotificationEmail(service, 3, userEmail)
              .then(result => {
                if (result.success) {
                  console.log('✅ 이메일 알림이 예약되었습니다:', result.message);
                } else {
                  console.warn('⚠️ 이메일 알림 예약 실패:', result.message);
                }
              })
              .catch(error => {
                console.error('❌ 이메일 알림 예약 중 오류:', error);
              });
          }
        }
      }

      // 성공 알림 및 캘린더 이동 확인
      const shouldNavigateToCalendar = window.confirm(
        `${service.title}이 캘린더에 추가되었습니다!\n마감 3일 전에 이메일 알림이 발송됩니다.\n\n캘린더 페이지로 이동하시겠습니까?`
      );
      
      if (shouldNavigateToCalendar) {
        // 서비스의 시작 날짜로 이동
        const serviceStartDate = new Date(calendarData.applicationPeriod.startDate);
        navigate('/calendar', { 
          state: { 
            newService: calendarData,
            targetDate: serviceStartDate
          } 
        });
      }
      
    } catch (error) {
      console.error('캘린더 추가 중 오류:', error);
      alert('캘린더 추가 중 오류가 발생했습니다.');
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const handleContact = () => {
    // 연락처 정보 표시 또는 전화 걸기
    if (service.contact) {
      alert(`문의처: ${service.contact}\n\n전화를 걸거나 해당 번호로 문의해주세요.`);
    }
  };

  return (
    <Container data-service-detail>
      <MainContent>
        <BackButton onClick={() => navigate('/ServicePage')}>
          ← 복지 서비스 목록으로 돌아가기
        </BackButton>
        
        <DetailCard>
          <ServiceHeader>
            <ServiceTags>
              {service.tags?.map(tag => (
                <ServiceTag key={tag}>{tag}</ServiceTag>
              ))}
            </ServiceTags>
            <ServiceTitle>{service.title}</ServiceTitle>
            <ServiceDescription>{service.description}</ServiceDescription>
          </ServiceHeader>

          {service.applicationPeriod && (
            <ApplicationPeriodSection>
              <PeriodTitle>신청 기간</PeriodTitle>
              <PeriodInfo>
                <PeriodDate>
                  {service.applicationPeriod.startDate} ~ {service.applicationPeriod.endDate}
                </PeriodDate>
                <StatusBadge isOngoing={service.applicationPeriod.isOngoing}>
                  신청 가능
                </StatusBadge>
              </PeriodInfo>
            </ApplicationPeriodSection>
          )}

          <DetailSection>
            <SectionTitle>서비스 정보</SectionTitle>
            <DetailGrid>
              <DetailItem>
                <DetailLabel>담당부서</DetailLabel>
                <DetailValue>{service.department}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>지원주기</DetailLabel>
                <DetailValue>{service.cycle}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>제공유형</DetailLabel>
                <DetailValue>{service.type}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>문의처</DetailLabel>
                <DetailValue>{service.contact}</DetailValue>
              </DetailItem>
            </DetailGrid>
          </DetailSection>

          <ButtonContainer>
            <AddToCalendarButton 
              onClick={handleAddToCalendar}
              disabled={isAddingToCalendar}
            >
              {isAddingToCalendar ? (
                <>캘린더에 추가 중...</>
              ) : isAuthenticated ? (
                <>캘린더에 추가</>
              ) : (
                <>로그인 후 캘린더에 추가</>
              )}
            </AddToCalendarButton>
            <ContactButton onClick={handleContact}>
              문의하기
            </ContactButton>
          </ButtonContainer>
        </DetailCard>
      </MainContent>
    </Container>
  );
};

export default ServiceDetailPage;
