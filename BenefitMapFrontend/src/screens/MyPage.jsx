import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { checkAuthAndRedirect, getUserInfo, isLoggedIn, hasUserSettings, fetchOnboardingInfo } from '../utils/auth';

// 스타일 컴포넌트 정의
const MyPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 130px - 317px);
  align-items: center;
  padding: 20px 20px;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 400;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const MainContent = styled.div`
  background-color: #91D0A6;
  border-radius: 16px;
  padding: 25px;
  width: 100%;
  max-width: 1000px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  position: relative;
  gap: 15px;
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #91D0A6;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
`;

const EditButton = styled.button`
  background-color: #91D0A6;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    background-color: #7BB899;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(145, 208, 166, 0.3);
  }
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const Section = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  flex: 1;
  min-height: 400px;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 400;
  color: #333;
  margin-bottom: 18px;
  border-bottom: 2px solid #91D0A6;
  padding-bottom: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  font-weight: 400;
  color: #555;
  margin-bottom: 6px;
  font-size: 0.85rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #333;
  background-color: #f9f9f9;
  
  &:focus {
    outline: none;
    border-color: #91D0A6;
    background-color: white;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #333;
  background-color: #f9f9f9;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #91D0A6;
    background-color: white;
  }
`;

const SaveButton = styled.button`
  background-color: #6DBE89;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a9f73;
  }
`;

const AgeInputContainer = styled.div`
  position: relative;
`;

const AgeSpinGroup = styled.div`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const AgeSpinButton = styled.button`
  width: 20px;
  height: 14px;
  border: none;
  background: #e9f6ee;
  color: #2f8a57;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  line-height: 1;
  &:hover { background: #d8f0e4; }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background-color: #91D0A6;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
`;

const NoDataText = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
`;

function MyPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    email: '',
    email2: '',
    region1: '',
    region2: '',
    lifeCycle: '',
    household: '',
    interest: ''
  });
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 서버에서 온보딩 정보 가져오기
  const fetchOnboardingData = async () => {
    try {
      const backendData = await fetchOnboardingInfo();
      
      if (backendData) {
        console.log('백엔드 온보딩 데이터:', backendData);
        setOnboardingData(backendData);
        
        // 백엔드 데이터로 폼 데이터 설정
        const profile = backendData.profile;
        const birthYear = profile?.birthDate ? new Date(profile.birthDate).getFullYear() : '';
        const currentYear = new Date().getFullYear();
        const age = birthYear ? (currentYear - birthYear + 1).toString() : '';
        
        // 태그들을 문자열로 변환
        const lifecycleNames = backendData.lifecycleTags?.map(tag => tag.nameKo).join(', ') || '';
        const householdNames = backendData.householdTags?.map(tag => tag.nameKo).join(', ') || '';
        const interestNames = backendData.interestTags?.map(tag => tag.nameKo).join(', ') || '';
        
        setFormData(prev => ({
          ...prev,
          name: getUserInfo()?.name || '',
          age: age,
          gender: profile?.gender === 'MALE' ? '남성' : profile?.gender === 'FEMALE' ? '여성' : '',
          address: '',
          email: getUserInfo()?.email || '',
          email2: '',
          region1: profile?.regionDo || '',
          region2: profile?.regionSi || '',
          lifeCycle: lifecycleNames,
          household: householdNames,
          interest: interestNames
        }));
      } else {
        // 백엔드 데이터가 없으면 로컬 스토리지에서 가져오기
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setFormData(prev => ({
            ...prev,
            ...settings
          }));
        }
      }
    } catch (error) {
      console.error('온보딩 정보 조회 실패:', error);
      // 오류 발생 시 로컬 스토리지에서 폴백
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setFormData(prev => ({
          ...prev,
          ...settings
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchOnboardingData();
    
    // 로컬 스토리지에서 추가 정보 불러오기
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFormData(prev => ({
        ...prev,
        ...settings
      }));
    }
  }, []);

  // 마이페이지는 로그인 없이도 접근 가능

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // 설정값을 localStorage에 저장
    localStorage.setItem('userSettings', JSON.stringify(formData));
    setIsEditing(false);
    alert('정보가 저장되었습니다!');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // 지역 옵션 데이터
  const region1Options = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
    '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
  ];

  const regionMap = {
    '서울특별시': ['종로구','중구','용산구','성동구','광진구','동대문구','중랑구','성북구','강북구','도봉구','노원구','은평구','서대문구','마포구','양천구','강서구','구로구','금천구','영등포구','동작구','관악구','서초구','강남구','송파구','강동구'],
    '부산광역시': ['중구','서구','동구','영도구','부산진구','동래구','남구','북구','해운대구','사하구','금정구','강서구','연제구','수영구','사상구','기장군'],
    '대구광역시': ['중구','동구','서구','남구','북구','수성구','달서구','달성군','군위군'],
    '인천광역시': ['중구','동구','미추홀구','연수구','남동구','부평구','계양구','서구','강화군','옹진군'],
    '광주광역시': ['동구','서구','남구','북구','광산구'],
    '대전광역시': ['동구','중구','서구','유성구','대덕구'],
    '울산광역시': ['중구','남구','동구','북구','울주군'],
    '세종특별자치시': ['세종시'],
    '경기도': ['수원시','성남시','의정부시','안양시','부천시','광명시','평택시','동두천시','안산시','고양시','과천시','구리시','남양주시','오산시','시흥시','군포시','의왕시','하남시','용인시','파주시','이천시','안성시','김포시','화성시','광주시','양주시','포천시','여주시','연천군','가평군','양평군'],
    '강원도': ['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
    '충청북도': ['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
    '충청남도': ['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
    '전라북도': ['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
    '전라남도': ['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
    '경상북도': ['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','군위군','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
    '경상남도': ['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
    '제주특별자치도': ['제주시','서귀포시']
  };

  const lifeCycleOptions = ['임신 및 출산', '영유아', '아동', '청소년', '청년', '중장년', '노년'];
  const householdOptions = ['저소득', '장애인', '한부모 및 조손', '다자녀', '다문화', '탈북민', '보훈대상자', '해당사항 없음'];
  const interestOptions = [
    '신체건강','정신건강','생활지원','주거','일자리','문화·여가','안전·위기','임신·출산','보육','교육','입양·위탁','보호·돌봄','서민금융','법률','에너지','해당사항 없음'
  ];

  // 현재 선택된 시/도에 따른 시/군/구 옵션
  const region2Options = formData.region1 ? regionMap[formData.region1] || [] : [];

  if (loading) {
    return (
      <MyPageContainer>
        <PageTitle>마이페이지</PageTitle>
        <MainContent>
          <LoadingText>데이터를 불러오는 중...</LoadingText>
        </MainContent>
      </MyPageContainer>
    );
  }

  return (
    <MyPageContainer>
      <PageTitle>마이페이지</PageTitle>
      
      <MainContent>
        <ProfileSection>
          <ProfileImage 
            src={getUserInfo()?.picture || '/src/assets/mypage.png'} 
            alt="프로필 사진"
            onError={(e) => {
              e.target.src = '/src/assets/mypage.png';
            }}
          />
          <EditButton onClick={handleEdit}>
             정보 수정
          </EditButton>
        </ProfileSection>

        <ContentGrid>
          {/* 개인 정보 섹션 */}
          <Section>
            <SectionTitle>개인 정보(필수)</SectionTitle>
            
            <FormGroup>
              <Label>이름:</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                placeholder="이름을 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <Label>나이:</Label>
                  <AgeInputContainer>
                    <Input
                      type="text"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      disabled={!isEditing}
                      placeholder="나이를 입력하세요"
                      style={{ paddingRight: '35px' }}
                    />
                    <AgeSpinGroup>
                      <AgeSpinButton 
                        type="button" 
                        onClick={() => {
                          const currentAge = parseInt(formData.age) || 0;
                          handleInputChange('age', Math.max(0, Math.min(150, currentAge + 1)).toString());
                        }}
                        disabled={!isEditing}
                      >
                        ▲
                      </AgeSpinButton>
                      <AgeSpinButton 
                        type="button" 
                        onClick={() => {
                          const currentAge = parseInt(formData.age) || 0;
                          handleInputChange('age', Math.max(0, Math.min(150, currentAge - 1)).toString());
                        }}
                        disabled={!isEditing}
                      >
                        ▼
                      </AgeSpinButton>
                    </AgeSpinGroup>
                  </AgeInputContainer>
                </div>
                <div style={{ flex: 1 }}>
                  <Label>성별:</Label>
                  <Select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="">성별을 선택하세요</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </Select>
                </div>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>주소:</Label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                placeholder="주소를 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <Label>이메일:</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                placeholder="이메일을 입력하세요"
              />
            </FormGroup>

            <FormGroup>
              <Input
                type="email"
                value={formData.email2 || ''}
                onChange={(e) => handleInputChange('email2', e.target.value)}
                disabled={!isEditing}
                placeholder="이메일을 입력하세요"
              />
            </FormGroup>
          </Section>

          {/* 맞춤 설정 섹션 */}
          <Section>
            <SectionTitle>맞춤 설정</SectionTitle>
            
            <FormGroup>
              <Label>지역:</Label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <Select
                    value={formData.region1}
                    onChange={(e) => {
                      handleInputChange('region1', e.target.value);
                      handleInputChange('region2', ''); // 시/군/구 초기화
                    }}
                    disabled={!isEditing}
                  >
                    <option value="">시/도 선택</option>
                    {region1Options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </div>
                <div style={{ flex: 1 }}>
                  <Select
                    value={formData.region2}
                    onChange={(e) => handleInputChange('region2', e.target.value)}
                    disabled={!isEditing || !formData.region1}
                  >
                    <option value="">시/군/구 선택</option>
                    {region2Options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>생애주기:</Label>
              {onboardingData?.lifecycleTags && onboardingData.lifecycleTags.length > 0 ? (
                <TagContainer>
                  {onboardingData.lifecycleTags.map((tag, index) => (
                    <Tag key={tag.code || index}>{tag.nameKo}</Tag>
                  ))}
                </TagContainer>
              ) : formData.lifeCycle ? (
                <div>{formData.lifeCycle}</div>
              ) : (
                <NoDataText>선택된 생애주기가 없습니다</NoDataText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>가구상황:</Label>
              {onboardingData?.householdTags && onboardingData.householdTags.length > 0 ? (
                <TagContainer>
                  {onboardingData.householdTags.map((tag, index) => (
                    <Tag key={tag.code || index}>{tag.nameKo}</Tag>
                  ))}
                </TagContainer>
              ) : formData.household ? (
                <div>{formData.household}</div>
              ) : (
                <NoDataText>선택된 가구상황이 없습니다</NoDataText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>관심주제:</Label>
              {onboardingData?.interestTags && onboardingData.interestTags.length > 0 ? (
                <TagContainer>
                  {onboardingData.interestTags.map((tag, index) => (
                    <Tag key={tag.code || index}>{tag.nameKo}</Tag>
                  ))}
                </TagContainer>
              ) : formData.interest ? (
                <div>{formData.interest}</div>
              ) : (
                <NoDataText>선택된 관심주제가 없습니다</NoDataText>
              )}
            </FormGroup>

            {isEditing && (
              <SaveButton onClick={handleSave}>
                저장하기
              </SaveButton>
            )}
          </Section>
        </ContentGrid>
      </MainContent>
    </MyPageContainer>
  );
}

export default MyPage;
