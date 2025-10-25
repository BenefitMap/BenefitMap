import { useState, useEffect } from 'react';
import styled from 'styled-components';

/* =========================
   1) 태그 옵션 목록 (id + code + label)
   - id: 백엔드에서 기대하는 tagId (Short)
   - code: 화면에서 선택 여부 관리용 (GET /user/me 에서 오는 코드랑 매칭)
   - label: 유저에게 보여줄 한글
   ========================= */
const LIFECYCLE_OPTIONS = [
  { id: 1, code: 'PREGNANCY_BIRTH', label: '임신·출산' },
  { id: 2, code: 'INFANT',          label: '영유아' },
  { id: 3, code: 'CHILD',           label: '아동' },
  { id: 4, code: 'TEEN',            label: '청소년' },        // Swagger 예시에서 4
  { id: 5, code: 'YOUTH',           label: '청년' },
  { id: 6, code: 'MIDDLE_AGED',     label: '중장년' },
  { id: 7, code: 'SENIOR',          label: '노년' },
];

const HOUSEHOLD_OPTIONS = [
  { id: 1, code: 'LOW_INCOME',       label: '저소득' },
  { id: 2, code: 'DISABLED',         label: '장애인' },
  { id: 3, code: 'SINGLE_PARENT',    label: '한부모·조손' },
  { id: 4, code: 'MULTI_CHILDREN',   label: '다자녀' },
  { id: 5, code: 'MULTICULTURAL_NK', label: '다문화·탈북민' },
  { id: 6, code: 'PROTECTED',        label: '보호대상자' },
  { id: 7, code: 'NONE',             label: '해당사항 없음' }, // Swagger 예시에서 7
];

const INTEREST_OPTIONS = [
  { id: 1,  code: 'PHYSICAL_HEALTH', label: '신체건강' },
  { id: 2,  code: 'MENTAL_HEALTH',   label: '정신건강' },     // Swagger 예시에서 2
  { id: 3,  code: 'LIVING_SUPPORT',  label: '생활지원' },
  { id: 4,  code: 'HOUSING',         label: '주거' },
  { id: 5,  code: 'JOBS',            label: '일자리' },       // Swagger 예시에서 5
  { id: 6,  code: 'CULTURE_LEISURE', label: '문화·여가' },
  { id: 7,  code: 'SAFETY_CRISIS',   label: '안전·위기' },
  { id: 8,  code: 'PREGNANCY_BIRTH', label: '임신·출산' },
  { id: 9,  code: 'CHILDCARE',       label: '보육' },
  { id: 10, code: 'EDUCATION',       label: '교육' },
  { id: 11, code: 'ADOPTION_TRUST',  label: '입양·위탁' },
  { id: 12, code: 'CARE_PROTECT',    label: '보호·돌봄' },
  { id: 13, code: 'MICRO_FINANCE',   label: '서민금융' },
  { id: 14, code: 'LAW',             label: '법률' },
  { id: 15, code: 'ENERGY',          label: '에너지' },
];

/* =========================
   2) API 유틸
   ========================= */
async function apiGetMyPage() {
  const res = await fetch('/user/me', {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || '조회 실패');
  return json.data; // MyPageResponse
}

async function apiPatchMyPage(patchBody) {
  const res = await fetch('/user/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(patchBody),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || '수정 실패');
  return json.data; // 최신 MyPageResponse
}

/* =========================
   3) styled-components
   ========================= */
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

/* =========================
   4) 체크박스 섹션 컴포넌트
   ========================= */
function TagMultiSelectSection({
                                 title,
                                 options,
                                 selectedCodes,
                                 onToggle,
                                 readOnly,
                               }) {
  return (
      <FormGroup>
        <Label>{title}:</Label>

        {readOnly ? (
            selectedCodes && selectedCodes.length > 0 ? (
                <TagContainer>
                  {selectedCodes.map((code) => {
                    const item = options.find((o) => o.code === code);
                    return (
                        <Tag key={code}>
                          {item ? item.label : code}
                        </Tag>
                    );
                  })}
                </TagContainer>
            ) : (
                <NoDataText>선택된 항목이 없습니다</NoDataText>
            )
        ) : (
            <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
            >
              {options.map((opt) => (
                  <label
                      key={opt.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        fontSize: '0.9rem',
                        lineHeight: 1.2,
                      }}
                  >
                    <input
                        type="checkbox"
                        checked={selectedCodes.includes(opt.code)}
                        onChange={() => onToggle(opt.code)}
                        style={{ cursor: 'pointer' }}
                    />
                    <span>{opt.label}</span>
                  </label>
              ))}
            </div>
        )}
      </FormGroup>
  );
}

/* =========================
   5) 본체 컴포넌트
   ========================= */
function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [serverData, setServerData] = useState(null);

  // 서버에서 받아온/지금 편집중인 값들
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    imageUrl: '',
    age: '',
    gender: '',
    regionDo: '',
    regionSi: '',
    lifecycleTagCodes: [],   // ex ["TEEN","YOUTH"]
    householdTagCodes: [],   // ex ["NONE"]
    interestTagCodes: [],    // ex ["MENTAL_HEALTH","JOBS"]
  });

  /* ---------- 지역 옵션들 ---------- */
  const region1Options = [
    '서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시','세종특별자치시',
    '경기도','강원도','충청북도','충청남도','전라북도','전라남도','경상북도','경상남도','제주특별자치도',
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
    '제주특별자치도': ['제주시','서귀포시'],
  };

  const region2Options = formData.regionDo
      ? (regionMap[formData.regionDo] || [])
      : [];

  /* ---------- 공용 인풋 핸들러 ---------- */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------- 태그 체크 토글 ---------- */
  const toggleLifecycle = (code) => {
    setFormData((prev) => {
      const exists = prev.lifecycleTagCodes.includes(code);
      return {
        ...prev,
        lifecycleTagCodes: exists
            ? prev.lifecycleTagCodes.filter((c) => c !== code)
            : [...prev.lifecycleTagCodes, code],
      };
    });
  };

  const toggleHousehold = (code) => {
    setFormData((prev) => {
      const exists = prev.householdTagCodes.includes(code);
      return {
        ...prev,
        householdTagCodes: exists
            ? prev.householdTagCodes.filter((c) => c !== code)
            : [...prev.householdTagCodes, code],
      };
    });
  };

  const toggleInterest = (code) => {
    setFormData((prev) => {
      const exists = prev.interestTagCodes.includes(code);
      return {
        ...prev,
        interestTagCodes: exists
            ? prev.interestTagCodes.filter((c) => c !== code)
            : [...prev.interestTagCodes, code],
      };
    });
  };

  /* ---------- 편집 모드 ---------- */
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // "남성"/"여성" → "MALE"/"FEMALE"
      const genderEnum =
          formData.gender === '남성'
              ? 'MALE'
              : formData.gender === '여성'
                  ? 'FEMALE'
                  : formData.gender === 'MALE' || formData.gender === 'FEMALE'
                      ? formData.gender
                      : '';

      // 코드 배열 -> ID 배열 변환
      const lifecycleTagIds = LIFECYCLE_OPTIONS
          .filter(opt => formData.lifecycleTagCodes.includes(opt.code))
          .map(opt => opt.id);

      const householdTagIds = HOUSEHOLD_OPTIONS
          .filter(opt => formData.householdTagCodes.includes(opt.code))
          .map(opt => opt.id);

      const interestTagIds = INTEREST_OPTIONS
          .filter(opt => formData.interestTagCodes.includes(opt.code))
          .map(opt => opt.id);

      // 서버 규격에 맞춰 PATCH 바디 생성
      const patchBody = {
        gender: genderEnum || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        regionDo: formData.regionDo || undefined,
        regionSi: formData.regionSi || undefined,
        lifecycleTagIds,   // 👈 서버는 이 이름으로 받는다
        householdTagIds,   // 👈 Short 리스트
        interestTagIds,    // 👈 Short 리스트
      };

      const updated = await apiPatchMyPage(patchBody);

      // 서버는 update 후 getMe() 결과를 그대로 내려줌
      setServerData(updated);
      setFormData({
        name: updated.basic?.name || '',
        email: updated.basic?.email || '',
        imageUrl: updated.basic?.imageUrl || '',
        age: updated.basic?.age?.toString() || '',
        gender:
            updated.basic?.gender === 'MALE'
                ? '남성'
                : updated.basic?.gender === 'FEMALE'
                    ? '여성'
                    : updated.basic?.gender || '',
        regionDo: updated.profile?.regionDo || '',
        regionSi: updated.profile?.regionSi || '',
        lifecycleTagCodes: updated.tags?.lifecycleCodes || [],
        householdTagCodes: updated.tags?.householdCodes || [],
        interestTagCodes: updated.tags?.interestCodes || [],
      });

      setIsEditing(false);
      alert('서버에 저장되었습니다!');
    } catch (err) {
      console.error('PATCH /user/me 실패:', err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  /* ---------- 최초 로드 ---------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetMyPage(); // { basic, profile, tags }
        setServerData(data);

        setFormData({
          name: data.basic?.name || '',
          email: data.basic?.email || '',
          imageUrl: data.basic?.imageUrl || '',
          age: data.basic?.age?.toString() || '',
          gender:
              data.basic?.gender === 'MALE'
                  ? '남성'
                  : data.basic?.gender === 'FEMALE'
                      ? '여성'
                      : data.basic?.gender || '',
          regionDo: data.profile?.regionDo || '',
          regionSi: data.profile?.regionSi || '',
          lifecycleTagCodes: data.tags?.lifecycleCodes || [],
          householdTagCodes: data.tags?.householdCodes || [],
          interestTagCodes: data.tags?.interestCodes || [],
        });
      } catch (err) {
        console.error('GET /user/me 실패:', err);
        alert('사용자 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- 로딩 화면 ---------- */
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

  /* ---------- 렌더 ---------- */
  return (
      <MyPageContainer>
        <PageTitle>마이페이지</PageTitle>

        <MainContent>
          <ProfileSection>
            <ProfileImage
                src={formData.imageUrl || '/src/assets/mypage.png'}
                alt="프로필 사진"
                onError={(e) => {
                  e.target.src = '/src/assets/mypage.png';
                }}
            />

            {!isEditing ? (
                <EditButton onClick={handleEdit}>정보 수정</EditButton>
            ) : (
                <EditButton onClick={handleSave}>저장하기</EditButton>
            )}
          </ProfileSection>

          <ContentGrid>
            {/* 왼쪽: 개인 정보 */}
            <Section>
              <SectionTitle>개인 정보(필수)</SectionTitle>

              <FormGroup>
                <Label>이름:</Label>
                <Input
                    type="text"
                    value={formData.name}
                    disabled={true /* 이름은 수정 불가 */}
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
                              if (!isEditing) return;
                              const currentAge = parseInt(formData.age) || 0;
                              handleInputChange(
                                  'age',
                                  Math.max(
                                      0,
                                      Math.min(150, currentAge + 1),
                                  ).toString(),
                              );
                            }}
                        >
                          ▲
                        </AgeSpinButton>
                        <AgeSpinButton
                            type="button"
                            onClick={() => {
                              if (!isEditing) return;
                              const currentAge = parseInt(formData.age) || 0;
                              handleInputChange(
                                  'age',
                                  Math.max(
                                      0,
                                      Math.min(150, currentAge - 1),
                                  ).toString(),
                              );
                            }}
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
                        onChange={(e) =>
                            handleInputChange('gender', e.target.value)
                        }
                        disabled={!isEditing}
                    >
                      <option value="">성별을 선택하세요</option>
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                      <option value="OTHER">기타/선택안함</option>
                    </Select>
                  </div>
                </div>
              </FormGroup>

              <FormGroup>
                <Label>이메일:</Label>
                <Input
                    type="email"
                    value={formData.email}
                    disabled={true /* 이메일 수정 불가 */}
                />
              </FormGroup>
            </Section>

            {/* 오른쪽: 맞춤 설정 */}
            <Section>
              <SectionTitle>맞춤 설정</SectionTitle>

              {/* 지역 */}
              <FormGroup>
                <Label>지역:</Label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <Select
                        value={formData.regionDo}
                        onChange={(e) => {
                          if (!isEditing) return;
                          handleInputChange('regionDo', e.target.value);
                          handleInputChange('regionSi', '');
                        }}
                        disabled={!isEditing}
                    >
                      <option value="">시/도 선택</option>
                      {region1Options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                      ))}
                    </Select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <Select
                        value={formData.regionSi}
                        onChange={(e) => {
                          if (!isEditing) return;
                          handleInputChange('regionSi', e.target.value);
                        }}
                        disabled={!isEditing || !formData.regionDo}
                    >
                      <option value="">시/군/구 선택</option>
                      {region2Options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </FormGroup>

              {/* 생애주기 */}
              <TagMultiSelectSection
                  title="생애주기"
                  options={LIFECYCLE_OPTIONS}
                  selectedCodes={formData.lifecycleTagCodes}
                  onToggle={(code) => {
                    if (!isEditing) return;
                    toggleLifecycle(code);
                  }}
                  readOnly={!isEditing}
              />

              {/* 가구상황 */}
              <TagMultiSelectSection
                  title="가구상황"
                  options={HOUSEHOLD_OPTIONS}
                  selectedCodes={formData.householdTagCodes}
                  onToggle={(code) => {
                    if (!isEditing) return;
                    toggleHousehold(code);
                  }}
                  readOnly={!isEditing}
              />

              {/* 관심주제 */}
              <TagMultiSelectSection
                  title="관심주제"
                  options={INTEREST_OPTIONS}
                  selectedCodes={formData.interestTagCodes}
                  onToggle={(code) => {
                    if (!isEditing) return;
                    toggleInterest(code);
                  }}
                  readOnly={!isEditing}
              />

              {isEditing && (
                  <SaveButton onClick={handleSave}>저장하기</SaveButton>
              )}
            </Section>
          </ContentGrid>
        </MainContent>
      </MyPageContainer>
  );
}

export default MyPage;
