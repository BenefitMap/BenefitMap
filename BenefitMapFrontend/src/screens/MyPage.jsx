import { useState, useEffect } from 'react';
import styled from 'styled-components';

/* =========================
   1) 태그 옵션 목록
   ========================= */
const LIFECYCLE_OPTIONS = [
  { id: 1, code: 'PREGNANCY_BIRTH', label: '임신·출산' },
  { id: 2, code: 'INFANT',          label: '영유아' },
  { id: 3, code: 'CHILD',           label: '아동' },
  { id: 4, code: 'TEEN',            label: '청소년' },
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
  { id: 7, code: 'NONE',             label: '해당사항 없음' },
];

const INTEREST_OPTIONS = [
  { id: 1,  code: 'PHYSICAL_HEALTH', label: '신체건강' },
  { id: 2,  code: 'MENTAL_HEALTH',   label: '정신건강' },
  { id: 3,  code: 'LIVING_SUPPORT',  label: '생활지원' },
  { id: 4,  code: 'HOUSING',         label: '주거' },
  { id: 5,  code: 'JOBS',            label: '일자리' },
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
  return json.data;
}

async function apiPatchMyPage(patchBody) {
  const res = await fetch('/user/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patchBody),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || '수정 실패');
  return json.data;
}

/* =========================
   3) styled-components
   ========================= */

/* 페이지 회색 배경 */
const PageBg = styled.div`
  min-height: calc(100vh - 130px - 317px);
  display: flex;
  justify-content: center;
  padding: 20px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;
`;

/* 가운데 흰 카드 */
const Card = styled.div`
  width: 100%;
  max-width: 1000px;
  background-color: #fff;
  border: 1px solid #cfcfcf;
  border-radius: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
`;

/* 상단 프로필 영역 */
const ProfileHeader = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 500;
  color: #111;
  margin: 0 0 16px 0;
`;

const Avatar = styled.img`
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background-color: #555;
  object-fit: cover;
  border: 4px solid #555;
  color: transparent;
`;

/* 수정/저장 버튼 pill */
const EditFloatingButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;

  background: #efefef;
  border: 1px solid #bfbfbf;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 500;
  color: #111;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 8px;

  box-shadow: 0 2px 4px rgba(0,0,0,0.15);

  &:hover {
    background: #e5e5e5;
  }
`;

/* 연한 초록색 영역 */
// ★ bg를 #99FF99 로 교체
const GreenSectionWrapper = styled.div`
  background-color: #e6f4ea;
  border-top: 1px solid #cfcfcf;
  border-bottom: 1px solid #cfcfcf;

  display: flex;
  flex-direction: row;
  padding: 24px;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  color: #000;
`;

const Divider = styled.div`
  width: 1px;
  background-color: rgba(0,0,0,0.3);

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
  }
`;

const SectionHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: #000;
  margin: 0 0 20px 0;
`;

const FieldRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-bottom: 16px;
  row-gap: 8px;
`;

const FieldLabel = styled.label`
  flex: 0 0 auto;
  min-width: 70px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #000;
  line-height: 32px;
  margin-right: 12px;
`;

/* 인풋 스타일 */
const BaseInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #bfbfbf;

  /* ★ 여기: 편집모드고 disabled여야 할 때만 연회색으로 바꾸기 */
  background-color: ${({ $forceGray }) =>
      $forceGray ? '#e0e0e0' : '#fff'};

  font-size: 1rem;
  color: #000;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);

  &:disabled {
    background-color: ${({ $forceGray }) =>
        $forceGray ? '#e0e0e0' : '#fff'};
    color: #000;
    opacity: 1;
  }

  &:focus {
    outline: 2px solid #4a6b54;
    outline-offset: 1px;
  }
`;

const AgeWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 140px;
`;

const AgeSpinner = styled.div`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AgeSpinBtn = styled.button`
  width: 20px;
  height: 14px;
  border: 1px solid #bfbfbf;
  background: #efefef;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  line-height: 1;
  color: #000;
  &:hover { background: #dedede; }
`;

const BaseSelect = styled.select`
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #bfbfbf;
  background-color: #fff;
  font-size: 1rem;
  color: #000;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  cursor: pointer;

  &:disabled {
    background-color: #fff;
    color: #000;
    opacity: 1;
    cursor: default;
  }

  &:focus {
    outline: 2px solid #4a6b54;
    outline-offset: 1px;
  }
`;

const TagGroupBlock = styled.div`
  margin-bottom: 16px;
`;

const TagGroupLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagChip = styled.span`
  background-color: #b0d9c3;
  color: #2e463a;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 10px;
  line-height: 1.2;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
`;

const CheckWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid #bfbfbf;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 0.9rem;
    line-height: 1.2;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const SaveRow = styled.div`
  text-align: right;
  margin-top: 8px;
`;

const SaveButton = styled.button`
  background: #efefef;
  border: 1px solid #bfbfbf;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);

  &:hover {
    background-color: #dedede;
  }
`;

const LoadingText = styled.div`
  padding: 60px 0;
  text-align: center;
  color: #444;
  font-style: italic;
`;

/* =========================
   4) 태그 선택 섹션
   ========================= */
function TagMultiSelectSection({
                                 title,
                                 options,
                                 selectedCodes,
                                 onToggle,
                                 readOnly,
                               }) {
  return (
      <TagGroupBlock>
        <TagGroupLabel>{title}:</TagGroupLabel>

        {readOnly ? (
            selectedCodes?.length ? (
                <TagContainer>
                  {selectedCodes.map(code => {
                    const item = options.find(o => o.code === code);
                    return (
                        <TagChip key={code}>
                          {item ? item.label : code}
                        </TagChip>
                    );
                  })}
                </TagContainer>
            ) : (
                <div
                    style={{
                      color: '#222',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                    }}
                >
                  선택된 항목이 없습니다
                </div>
            )
        ) : (
            <CheckWrap>
              {options.map(opt => (
                  <label key={opt.code}>
                    <input
                        type="checkbox"
                        checked={selectedCodes.includes(opt.code)}
                        onChange={() => onToggle(opt.code)}
                    />
                    <span>{opt.label}</span>
                  </label>
              ))}
            </CheckWrap>
        )}
      </TagGroupBlock>
  );
}

/* =========================
   5) 본체
   ========================= */
function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [serverData, setServerData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    imageUrl: '',
    age: '',
    gender: '',
    regionDo: '',
    regionSi: '',
    lifecycleTagCodes: [],
    householdTagCodes: [],
    interestTagCodes: [],
  });

  /* 지역 옵션 */
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

  /* 인풋 변경 */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /* 체크 토글 - 생애주기 */
  const toggleLifecycle = (code) => {
    setFormData(prev => {
      const exists = prev.lifecycleTagCodes.includes(code);
      return {
        ...prev,
        lifecycleTagCodes: exists
            ? prev.lifecycleTagCodes.filter(c => c !== code)
            : [...prev.lifecycleTagCodes, code],
      };
    });
  };

  /* 체크 토글 - 가구상황
     'NONE'(해당사항 없음) 단독 선택 규칙:
     - NONE을 켜면 다른 건 다 끔
     - 다른 걸 켜면 NONE 끔
  */
  const toggleHousehold = (code) => {
    setFormData(prev => {
      const exists = prev.householdTagCodes.includes(code);

      // 만약 지금 NONE을 토글하려는 상황이라면
      if (code === 'NONE') {
        if (exists) {
          // 이미 NONE이 켜져있으면 끄기
          return {
            ...prev,
            householdTagCodes: prev.householdTagCodes.filter(c => c !== 'NONE'),
          };
        } else {
          // NONE 켜면 나머지 전부 끄고 NONE만 남김
          return {
            ...prev,
            householdTagCodes: ['NONE'],
          };
        }
      }

      // 그 외 normal code
      if (exists) {
        // 이미 있는 거면 제거
        const filtered = prev.householdTagCodes.filter(c => c !== code);
        return {
          ...prev,
          householdTagCodes: filtered,
        };
      } else {
        // 새로운 거 추가할 때 NONE이 켜져있으면 NONE 제거 후 추가
        const cleaned = prev.householdTagCodes.filter(c => c !== 'NONE');
        return {
          ...prev,
          householdTagCodes: [...cleaned, code],
        };
      }
    });
  };

  /* 체크 토글 - 관심주제 (제약 없음) */
  const toggleInterest = (code) => {
    setFormData(prev => {
      const exists = prev.interestTagCodes.includes(code);
      return {
        ...prev,
        interestTagCodes: exists
            ? prev.interestTagCodes.filter(c => c !== code)
            : [...prev.interestTagCodes, code],
      };
    });
  };

  /* 수정/저장 버튼 */
  const handleEditClick = async () => {
    if (!isEditing) {
      // 수정 모드 진입
      setIsEditing(true);
      return;
    }

    // 저장 로직
    await handleSave();
  };

  /* 저장(=PATCH) */
  const handleSave = async () => {
    // 1) 유효성 검사
    // 생애주기 최소 1개
    if (formData.lifecycleTagCodes.length === 0) {
      alert('생애주기는 최소 1개 이상 선택해 주세요.');
      return;
    }

    // 가구상황 최소 1개
    if (formData.householdTagCodes.length === 0) {
      alert('가구상황은 최소 1개 이상 선택해 주세요.');
      return;
    }

    // 가구상황: 'NONE' + 다른 항목 동시선택 금지
    const hasNone = formData.householdTagCodes.includes('NONE');
    if (hasNone && formData.householdTagCodes.length > 1) {
      alert("가구상황은 '해당사항 없음'을 다른 항목과 함께 선택할 수 없어요.");
      return;
    }

    try {
      // 서버 enum 변환
      const genderEnum =
          formData.gender === '남성'
              ? 'MALE'
              : formData.gender === '여성'
                  ? 'FEMALE'
                  : '';

      const lifecycleTagIds = LIFECYCLE_OPTIONS
          .filter(opt => formData.lifecycleTagCodes.includes(opt.code))
          .map(opt => opt.id);

      const householdTagIds = HOUSEHOLD_OPTIONS
          .filter(opt => formData.householdTagCodes.includes(opt.code))
          .map(opt => opt.id);

      const interestTagIds = INTEREST_OPTIONS
          .filter(opt => formData.interestTagCodes.includes(opt.code))
          .map(opt => opt.id);

      const patchBody = {
        gender: genderEnum || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        regionDo: formData.regionDo || undefined,
        regionSi: formData.regionSi || undefined,
        lifecycleTagIds,
        householdTagIds,
        interestTagIds,
      };

      const updated = await apiPatchMyPage(patchBody);

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

  /* 최초 로드 */
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGetMyPage();
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

  if (loading) {
    return (
        <PageBg>
          <Card>
            <ProfileHeader>
              <PageTitle>마이페이지</PageTitle>
              <LoadingText>데이터를 불러오는 중...</LoadingText>
            </ProfileHeader>
          </Card>
        </PageBg>
    );
  }

  /* 렌더 */
  return (
      <PageBg>
        <Card>
          {/* 프로필 영역 */}
          <ProfileHeader>
            <PageTitle>마이페이지</PageTitle>

            <Avatar
                src={formData.imageUrl || '/src/assets/mypage.png'}
                alt="프로필 사진"
                onError={(e) => {
                  e.target.src = '/src/assets/mypage.png';
                }}
            />

            <EditFloatingButton onClick={handleEditClick}>
              <span role="img" aria-label="edit">✏️</span>
              {isEditing ? '저장' : '수정'}
            </EditFloatingButton>
          </ProfileHeader>

          {/* 초록(=연두) 섹션 */}
          <GreenSectionWrapper>

            {/* 왼쪽 */}
            <Column>
              <SectionHeader>개인 정보(필수)</SectionHeader>

              {/* 이름 */}
              <FieldRow>
                <FieldLabel>이름:</FieldLabel>
                <BaseInput
                    value={formData.name}
                    disabled={true}
                    // 수정모드일 때만 회색 처리
                    $forceGray={isEditing}
                />
              </FieldRow>

              {/* 나이 & 성별 */}
              <FieldRow style={{ gap: '12px' }}>
                {/* 나이 */}
                <div style={{ display:'flex', flex:'1', minWidth:0, alignItems:'center', gap:'12px' }}>
                  <FieldLabel style={{ minWidth:'50px', marginRight:0 }}>나이:</FieldLabel>

                  <AgeWrapper>
                    <BaseInput
                        value={formData.age}
                        onChange={e => isEditing && handleInputChange('age', e.target.value)}
                        disabled={!isEditing}
                        $forceGray={false}
                        style={{ paddingRight: '32px' }}
                    />
                    <AgeSpinner>
                      <AgeSpinBtn
                          type="button"
                          onClick={() => {
                            if (!isEditing) return;
                            const currentAge = parseInt(formData.age) || 0;
                            handleInputChange(
                                'age',
                                Math.max(0, Math.min(150, currentAge + 1)).toString()
                            );
                          }}
                      >
                        ▲
                      </AgeSpinBtn>
                      <AgeSpinBtn
                          type="button"
                          onClick={() => {
                            if (!isEditing) return;
                            const currentAge = parseInt(formData.age) || 0;
                            handleInputChange(
                                'age',
                                Math.max(0, Math.min(150, currentAge - 1)).toString()
                            );
                          }}
                      >
                        ▼
                      </AgeSpinBtn>
                    </AgeSpinner>
                  </AgeWrapper>
                </div>

                {/* 성별 */}
                <div style={{ display:'flex', flex:'1', minWidth:0, alignItems:'center', gap:'12px' }}>
                  <FieldLabel style={{ minWidth:'60px', marginRight:0 }}>성별:</FieldLabel>
                  <BaseSelect
                      value={formData.gender}
                      onChange={e => {
                        if (!isEditing) return;
                        handleInputChange('gender', e.target.value);
                      }}
                      disabled={!isEditing}
                  >
                    <option value="">성별 선택</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </BaseSelect>
                </div>
              </FieldRow>

              {/* 이메일 */}
              <FieldRow>
                <FieldLabel>이메일:</FieldLabel>
                <BaseInput
                    type="email"
                    value={formData.email}
                    disabled={true}
                    $forceGray={isEditing}
                />
              </FieldRow>
            </Column>

            <Divider />

            {/* 오른쪽 */}
            <Column>
              <SectionHeader>맞춤 설정</SectionHeader>

              {/* 지역 */}
              <FieldRow style={{ flexWrap: 'nowrap', gap:'12px' }}>
                <FieldLabel style={{ minWidth:'50px' }}>지역:</FieldLabel>

                <BaseSelect
                    style={{ flex:'1' }}
                    value={formData.regionDo}
                    onChange={e => {
                      if (!isEditing) return;
                      handleInputChange('regionDo', e.target.value);
                      handleInputChange('regionSi', '');
                    }}
                    disabled={!isEditing}
                >
                  <option value="">시/도 선택</option>
                  {region1Options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
                </BaseSelect>

                <BaseSelect
                    style={{ flex:'1' }}
                    value={formData.regionSi}
                    onChange={e => {
                      if (!isEditing) return;
                      handleInputChange('regionSi', e.target.value);
                    }}
                    disabled={!isEditing || !formData.regionDo}
                >
                  <option value="">시/군/구 선택</option>
                  {region2Options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                  ))}
                </BaseSelect>
              </FieldRow>

              {/* 생애주기 */}
              <TagMultiSelectSection
                  title="생애주기"
                  options={LIFECYCLE_OPTIONS}
                  selectedCodes={formData.lifecycleTagCodes}
                  onToggle={(code) => { if (isEditing) toggleLifecycle(code); }}
                  readOnly={!isEditing}
              />

              {/* 가구상황 */}
              <TagMultiSelectSection
                  title="가구상황"
                  options={HOUSEHOLD_OPTIONS}
                  selectedCodes={formData.householdTagCodes}
                  onToggle={(code) => { if (isEditing) toggleHousehold(code); }}
                  readOnly={!isEditing}
              />

              {/* 관심주제 */}
              <TagMultiSelectSection
                  title="관심주제"
                  options={INTEREST_OPTIONS}
                  selectedCodes={formData.interestTagCodes}
                  onToggle={(code) => { if (isEditing) toggleInterest(code); }}
                  readOnly={!isEditing}
              />

              {isEditing && (
                  <SaveRow>
                    <SaveButton onClick={handleSave}>저장</SaveButton>
                  </SaveRow>
              )}
            </Column>
          </GreenSectionWrapper>
        </Card>
      </PageBg>
  );
}

export default MyPage;
