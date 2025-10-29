import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { colors, fonts, spacing, breakpoints } from '../styles/CommonStyles';
import {
  createDeadlineNotificationEmail,
  getUserEmail,
  isEmailNotificationEnabled,
} from '../utils/emailNotification';
import { useAuth } from '../hooks/useAuth';

/* =========================
   코드값 → 한글 라벨 맵 ★
   ========================= */
const TAG_LABELS = {
  // 생애주기
  PREGNANCY_BIRTH: '임신·출산',
  INFANT: '영유아',
  CHILD: '아동',
  TEEN: '청소년',
  YOUTH: '청년',
  MIDDLE_AGED: '중장년',
  SENIOR: '노년',

  // 가구상황
  LOW_INCOME: '저소득',
  DISABLED: '장애인',
  SINGLE_PARENT: '한부모·조손',
  MULTI_CHILDREN: '다자녀',
  MULTICULTURAL_NK: '다문화·탈북민',
  PROTECTED: '보호대상자',
  NONE: '해당사항 없음',

  // 관심주제
  PHYSICAL_HEALTH: '신체건강',
  MENTAL_HEALTH: '정신건강',
  LIVING_SUPPORT: '생활지원',
  HOUSING: '주거',
  JOBS: '일자리',
  CULTURE_LEISURE: '문화·여가',
  SAFETY_CRISIS: '안전·위기',
  CHILDCARE: '보육',
  ADOPTION_TRUST: '입양·위탁',
  CARE_PROTECT: '보호·돌봄',
  MICRO_FINANCE: '서민금융',
  ENERGY: '에너지',
  LAW: '법률',
  EDUCATION: '교육',
};

/* ==== styled-components ==== */

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
  background-color: #4a9d5f;
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

/* =========================
   본체
   ========================= */

const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // /service/:id
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // 메인에서 넘어온 상태 (페이지 이동 시 state로 준 service)
  const initialStateFromNav = location.state?.service || null;

  const [service, setService] = useState(initialStateFromNav);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  // 상세 API (새로고침 등으로 state 없을 때)
  const loadServiceDetail = useCallback(async () => {
    if (service) return;

    try {
      const res = await fetch(`/api/catalog/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('상세 API HTTP 오류:', res.status);
        return;
      }

      const data = await res.json();
      const s = data.data || data || {};

      const mapped = {
        id: s.id ?? id,
        title: s.welfareName || s.title || s.name || '(제목 없음)',
        description: s.description || s.summary || s.detail || '',
        department: s.department || s.dept || '',
        cycle: s.supportCycle || s.cycle || '',
        type: s.supplyType || s.type || '',
        contact: s.contact || s.phone || '',
        tags: [
          ...(s.lifecycles || []),
          ...(s.households || []),
          ...(s.interests || []),
        ],
        applicationPeriod: {
          startDate: s.startDate || s.applicationStartDate || '',
          endDate: s.endDate || s.applicationEndDate || '',
          isOngoing: !(s.endDate || s.applicationEndDate),
        },
      };

      setService(mapped);
    } catch (err) {
      console.error('서비스 상세 불러오기 실패:', err);
    }
  }, [id, service]);

  useEffect(() => {
    loadServiceDetail();
  }, [loadServiceDetail]);

  if (!service) {
    return (
        <Container data-service-detail>
          <MainContent>
            <BackButton onClick={() => navigate(-1)}>← 뒤로가기</BackButton>
            <DetailCard>
              <ServiceHeader>
                <ServiceTitle>불러오는 중...</ServiceTitle>
              </ServiceHeader>
            </DetailCard>
          </MainContent>
        </Container>
    );
  }

  /* =========================
     캘린더 추가 (DB 연동)
     ========================= */
  const handleAddToCalendar = async () => {
    if (!isAuthenticated) {
      alert('캘린더에 추가하려면 로그인이 필요합니다.');
      navigate('/LoginPage');
      return;
    }

    setIsAddingToCalendar(true);

    try {
      // 1) 이미 등록된 일정인지 서버에서 확인
      const existingRes = await fetch('/api/calendar', {
        method: 'GET',
        credentials: 'include',
      });

      if (!existingRes.ok) {
        console.warn('캘린더 GET 실패 상태코드:', existingRes.status);
      }

      const existingJson = existingRes.ok ? await existingRes.json() : [];
      // existingJson 은 [{ id, welfareId, title, ... }, ...] 형태라고 가정
      const already = Array.isArray(existingJson)
          ? existingJson.some((sv) => {
            // sv.welfareId 는 서버가 갖고있는 복지ID
            // service.id 는 지금 보고 있는 복지ID
            return sv.welfareId === service.id;
          })
          : false;

      if (already) {
        alert('이미 캘린더에 추가된 일정입니다.');
        setIsAddingToCalendar(false);
        return;
      }

      // 2) 서버에 신규 등록
      const postBody = {
        welfareId: service.id,
        title: service.title,
        description: service.description,
        department: service.department,
        contact: service.contact,
        applicationPeriod: {
          startDate: service.applicationPeriod.startDate,
          endDate: service.applicationPeriod.endDate,
        },
      };

      const postRes = await fetch('/api/calendar', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody),
      });

      if (!postRes.ok) {
        console.error('POST /api/calendar 실패', postRes.status);
        alert('캘린더에 추가하지 못했어요. 잠시 후 다시 시도해 주세요.');
        setIsAddingToCalendar(false);
        return;
      }

      // 서버가 성공적으로 저장했다고 가정
      // 이메일 알림 예약 로직 유지
      if (
          isEmailNotificationEnabled() &&
          service.applicationPeriod &&
          service.applicationPeriod.endDate
      ) {
        const userEmail = getUserEmail();
        if (userEmail) {
          const endDate = new Date(service.applicationPeriod.endDate);
          const today = new Date();
          const daysUntilDeadline = Math.ceil(
              (endDate - today) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilDeadline > 3) {
            createDeadlineNotificationEmail(service, 3, userEmail).catch(
                (error) => {
                  console.error('이메일 알림 예약 중 오류:', error);
                }
            );
          }
        }
      }

      const goCalendar = window.confirm(
          `${service.title}이(가) 캘린더에 추가되었습니다!\n\n캘린더 페이지로 이동할까요?`
      );

      if (goCalendar) {
        const start = new Date(
            service.applicationPeriod.startDate || Date.now()
        );

        navigate('/calendar', {
          state: {
            // 캘린더 페이지에서는 어차피 자기 쪽에서 /api/calendar 다시 GET 하니까
            // 여기서 newService 넘겨줘도 되고 안 넘겨줘도 크게 문제 없음.
            newService: postBody,
            targetDate: start,
          },
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
    if (service.contact) {
      alert(
          `문의처: ${service.contact}\n\n전화를 걸거나 해당 번호로 문의해주세요.`
      );
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
                {service.tags?.map((tag) => (
                    <ServiceTag key={tag}>
                      {TAG_LABELS[tag] || tag /* ★ 여기서 한글 라벨로 보여줌 */}
                    </ServiceTag>
                ))}
              </ServiceTags>

              <ServiceTitle>{service.title || '-'}</ServiceTitle>
              <ServiceDescription>
                {service.description || '-'}
              </ServiceDescription>
            </ServiceHeader>

            {service.applicationPeriod && (
                <ApplicationPeriodSection>
                  <PeriodTitle>신청 기간</PeriodTitle>
                  <PeriodInfo>
                    <PeriodDate>
                      {service.applicationPeriod.startDate || ''} ~{' '}
                      {service.applicationPeriod.endDate || '상시'}
                    </PeriodDate>
                    <StatusBadge>신청 가능</StatusBadge>
                  </PeriodInfo>
                </ApplicationPeriodSection>
            )}

            <DetailSection>
              <SectionTitle>서비스 정보</SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <DetailLabel>담당부서</DetailLabel>
                  <DetailValue>{service.department || '-'}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>지원주기</DetailLabel>
                  <DetailValue>{service.cycle || '-'}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>제공유형</DetailLabel>
                  <DetailValue>{service.type || '-'}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>문의처</DetailLabel>
                  <DetailValue>{service.contact || '-'}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <ButtonContainer>
              <AddToCalendarButton
                  onClick={handleAddToCalendar}
                  disabled={isAddingToCalendar}
              >
                {isAddingToCalendar
                    ? '캘린더에 추가 중...'
                    : isAuthenticated
                        ? '캘린더에 추가'
                        : '로그인 후 캘린더에 추가'}
              </AddToCalendarButton>

              <ContactButton onClick={handleContact}>문의하기</ContactButton>
            </ButtonContainer>
          </DetailCard>
        </MainContent>
      </Container>
  );
};

export default ServiceDetailPage;
