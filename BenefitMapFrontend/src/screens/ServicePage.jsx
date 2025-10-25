import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import ScrollToTopButton from '../components/ScrollToTopButton';

/* =========================
   스타일
   ========================= */

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  overflow-y: auto;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const AddressText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RefreshButton = styled.button`
  background-color: #4a9d5f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;

  &:hover {
    background-color: #3d8450;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 0;
`;

const FilterCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

const FilterColumn = styled.div`
  background-color: white;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const FilterTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 16px;
  text-align: left;
`;

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InterestCheckboxList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  gap: 8px;
  padding: 6px 0;
  transition: color 0.2s ease;

  &:hover {
    color: #4a9d5f;
  }

  input[type='checkbox'] {
    appearance: none;
    margin: 0;
    width: 16px;
    height: 16px;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    background-color: #fff;
    display: grid;
    place-content: center;
    transition: all 0.2s ease;
  }
  input[type='checkbox']:checked {
    border-color: #4a9d5f;
    background-color: #4a9d5f;
  }
  input[type='checkbox']:checked::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
  }
`;

const SectionDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9ecef;
  margin: 24px 0;
`;

const SearchSection = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e9ecef;
`;

const SearchTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 20px;
`;

const SearchForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  color: #495057;
  font-weight: 500;
`;

const AgeInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #4a9d5f;
  }
`;

const RegionSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4a9d5f;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const KeywordInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #4a9d5f;
  }

  &::placeholder {
    color: #aaa;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button`
  padding: 12px 32px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;
`;

const ResetButton = styled(Button)`
  background-color: #999;
  color: white;

  &:hover {
    background-color: #888;
  }
`;

const SearchButtonStyled = styled(Button)`
  background-color: #b8e6c9;
  color: #333;

  &:hover {
    background-color: #a5d9b8;
  }
`;

const ServiceDisplaySection = styled.div`
  margin-top: 30px;
`;

const ServiceSummary = styled.div`
  margin-bottom: 20px;
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const TotalServicesText = styled.p`
  font-size: 16px;
  color: #333;
  font-weight: 400;
`;

const SortOptions = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  font-size: 13px;
`;

const SortButton = styled.button`
  background-color: transparent;
  color: ${props => (props.active ? '#333' : '#999')};
  border: none;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => (props.active ? '600' : '400')};

  &:hover {
    color: #333;
  }

  &:not(:last-child):after {
    content: ' |';
    margin-left: 5px;
    color: #ddd;
  }
`;

const TabContainer = styled.div`
  width: 100%;
`;

const TabHeader = styled.div`
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: ${({ active }) => (active ? '#f0f0f0' : '#fff')};
  border: none;
  border-right: ${({ position }) =>
      position !== 'right' ? '1px solid #ddd' : 'none'};
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  cursor: pointer;
  display: flex;
  justify-content: center;
  gap: 6px;

  span {
    font-weight: normal;
    color: #666;
  }
`;

const ServiceCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
`;

const ServiceCard = styled.div`
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 420px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #4a9d5f;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #4a9d5f;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  gap: 6px;
  margin: 16px 0;
  flex-wrap: wrap;
  align-items: center;
`;

const ServiceTag = styled.span`
  background: #f8f9fa;
  color: #4a9d5f;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    border-color: #4a9d5f;
  }
`;

const ShowTagsButton = styled.button`
  background: transparent;
  color: #4a9d5f;
  border: 1px solid #4a9d5f;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #4a9d5f;
    color: white;
  }
`;

const ServiceTitle = styled.h3`
  font-size: 22px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 700;
  line-height: 1.3;
`;

const ServiceDescription = styled.p`
  font-size: 16px;
  color: #5a6c7d;
  margin-bottom: 20px;
  line-height: 1.6;
  flex-grow: 1;
  font-weight: 400;
`;

const ServiceDetailsList = styled.ul`
  list-style: none;
  margin-bottom: 20px;
  padding-left: 0;
`;

const ServiceDetailItem = styled.li`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid #f8f9fa;

  &:before {
    content: '•';
    margin-right: 8px;
    color: #4a9d5f;
    font-size: 14px;
    font-weight: bold;
    margin-top: 2px;
  }

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const ViewDetailsButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: #5a6268;
  }
`;

const AddToCalendarButton = styled.button`
  background-color: #4a9d5f;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover {
    background-color: #3d8450;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #666;
`;

/* =========================
   백엔드 enum 매핑
   ========================= */

const lifecyclesMap = {
  '임신, 출산': 'PREGNANCY_BIRTH',
  '영유아': 'INFANT',
  '아동': 'CHILD',
  '청소년': 'TEEN',
  '청년': 'YOUTH',
  '중장년': 'MIDDLE_AGED',
  '노년': 'SENIOR',
};

const householdMap = {
  '저소득': 'LOW_INCOME',
  '장애인': 'DISABLED',
  '한부모, 조손': 'SINGLE_PARENT',
  '다자녀': 'MULTI_CHILDREN',
  '다문화, 탈북민': 'MULTICULTURAL_NK',
  '보훈대상자': 'PROTECTED',
  '해당 사항 없음': 'NONE',
};

const interestMap = {
  '신체건강': 'PHYSICAL_HEALTH',
  '정신건강': 'MENTAL_HEALTH',
  '생활지원': 'LIVING_SUPPORT',
  '일자리': 'JOBS',
  '주거': 'HOUSING',
  '안전, 위기': 'SAFETY_CRISIS',
  '보육': 'CHILDCARE',
  '입양, 위탁': 'ADOPTION_TRUST',
  '서민금융': 'MICRO_FINANCE',
  '에너지': 'ENERGY',
  '문화, 여가': 'CULTURE_LEISURE',
  '법률': 'LAW',
  '교육': 'EDUCATION',
  '보호, 돌봄': 'CARE_PROTECT',
  '임신, 출산': 'PREGNANCY_BIRTH',
};

/* =========================
   코드 → 한글 라벨 역변환
   ========================= */

const codeToKorean = {
  // 생애주기
  PREGNANCY_BIRTH: '임신, 출산',
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
  PROTECTED: '보훈대상자',
  NONE: '해당 사항 없음',

  // 관심주제
  PHYSICAL_HEALTH: '신체건강',
  MENTAL_HEALTH: '정신건강',
  LIVING_SUPPORT: '생활지원',
  JOBS: '일자리',
  HOUSING: '주거',
  SAFETY_CRISIS: '안전, 위기',
  CHILDCARE: '보육',
  ADOPTION_TRUST: '입양, 위탁',
  MICRO_FINANCE: '서민금융',
  ENERGY: '에너지',
  CULTURE_LEISURE: '문화, 여가',
  LAW: '법률',
  EDUCATION: '교육',
  CARE_PROTECT: '보호, 돌봄',
};

/* =========================
   태그 표기 변환
   ========================= */
const translateTag = tagCode => codeToKorean[tagCode] || tagCode;

/* =========================
   API 함수
   ========================= */
const searchWelfareServices = async searchParams => {
  try {
    const response = await fetch(`/api/catalog/search`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error('복지서비스 검색 실패:', error);
    return [];
  }
};

/* =========================
   프론트엔드 최종 필터링 로직
   ========================= */
function cardMatchesKeywordIncludingTags(svc, keyword) {
  if (!keyword || keyword.trim() === '') return true;

  const kw = keyword.trim().toLowerCase();

  // 기본 텍스트 필드들
  const haystackText = [
    svc.welfareName,
    svc.description,
    svc.department,
    svc.supplyType,
    svc.supportCycle,
  ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

  if (haystackText.includes(kw)) return true;

  // 태그 코드들 (영문 enum)
  const tagCodes = [
    ...(svc.lifecycles || []),
    ...(svc.households || []),
    ...(svc.interests || []),
  ];
  const tagCodesJoined = tagCodes.join(' ').toLowerCase();
  if (tagCodesJoined.includes(kw)) return true;

  // 태그 한글 변환 후 검사
  const tagLabelsKorean = tagCodes
      .map(code => codeToKorean[code] || '')
      .join(' ')
      .toLowerCase();
  if (tagLabelsKorean.includes(kw)) return true;

  return false;
}

/* =========================
   컴포넌트
   ========================= */

const ServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // MainPage에서 넘어온 검색어
  const initialKeywordFromNav = location.state?.initialKeyword || '';

  const [selectedFilters, setSelectedFilters] = useState({
    lifeCycle: [],
    household: [],
    topics: [],
  });

  const [searchForm, setSearchForm] = useState({
    age: '',
    province: '',
    city: '',
    keyword: initialKeywordFromNav || '',
  });

  const [activeCategory, setActiveCategory] = useState('central');
  const [sortOption, setSortOption] = useState('popular');
  const [currentLocation, setCurrentLocation] = useState(
      '위치 정보를 가져오는 중...'
  );
  const [welfareServices, setWelfareServices] = useState([]);
  const [serviceSummary, setServiceSummary] = useState({
    total: 0,
    central: 0,
    local: 0,
    private: 0,
  });
  const [loading, setLoading] = useState(false);
  const [expandedTags, setExpandedTags] = useState({});

  /* 시/도, 시군구 옵션 */
  const provinces = [
    '서울특별시',
    '부산광역시',
    '대구광역시',
    '인천광역시',
    '광주광역시',
    '대전광역시',
    '울산광역시',
    '세종특별자치시',
    '경기도',
    '강원특별자치도',
    '충청북도',
    '충청남도',
    '전북특별자치도',
    '전라남도',
    '경상북도',
    '경상남도',
    '제주특별자치도',
  ];

  const cities = {
    서울특별시: [
      '강남구',
      '강동구',
      '강북구',
      '강서구',
      '관악구',
      '광진구',
      '구로구',
      '금천구',
      '노원구',
      '도봉구',
      '동대문구',
      '동작구',
      '마포구',
      '서대문구',
      '서초구',
      '성동구',
      '성북구',
      '송파구',
      '양천구',
      '영등포구',
      '용산구',
      '은평구',
      '종로구',
      '중구',
      '중랑구',
    ],
    부산광역시: [
      '강서구',
      '금정구',
      '남구',
      '동구',
      '동래구',
      '부산진구',
      '북구',
      '사상구',
      '사하구',
      '서구',
      '수영구',
      '연제구',
      '영도구',
      '중구',
      '해운대구',
      '기장군',
    ],
    대구광역시: [
      '남구',
      '달서구',
      '동구',
      '북구',
      '서구',
      '수성구',
      '중구',
      '달성군',
      '군위군',
    ],
    인천광역시: [
      '강화군',
      '계양구',
      '남동구',
      '동구',
      '미추홀구',
      '부평구',
      '서구',
      '연수구',
      '옹진군',
      '중구',
    ],
    광주광역시: ['광산구', '남구', '동구', '북구', '서구'],
    대전광역시: ['대덕구', '동구', '서구', '유성구', '중구'],
    울산광역시: ['남구', '동구', '북구', '중구', '울주군'],
    세종특별자치시: ['세종시'],
    경기도: [
      '가평군',
      '고양시 덕양구',
      '고양시 일산동구',
      '고양시 일산서구',
      '과천시',
      '광명시',
      '광주시',
      '구리시',
      '군포시',
      '김포시',
      '남양주시',
      '동두천시',
      '부천시',
      '성남시 분당구',
      '성남시 수정구',
      '성남시 중원구',
      '수원시 권선구',
      '수원시 영통구',
      '수원시 장안구',
      '수원시 팔달구',
      '시흥시',
      '안산시 단원구',
      '안산시 상록구',
      '안성시',
      '안양시 동안구',
      '안양시 만안구',
      '양주시',
      '양평군',
      '여주시',
      '연천군',
      '오산시',
      '용인시 기흥구',
      '용인시 수지구',
      '용인시 처인구',
      '의왕시',
      '의정부시',
      '이천시',
      '파주시',
      '평택시',
      '포천시',
      '하남시',
      '화성시',
    ],
    강원특별자치도: [
      '강릉시',
      '동해시',
      '삼척시',
      '속초시',
      '원주시',
      '춘천시',
      '태백시',
      '고성군',
      '양구군',
      '양양군',
      '영월군',
      '인제군',
      '정선군',
      '철원군',
      '평창군',
      '홍천군',
      '화천군',
      '횡성군',
    ],
    충청북도: [
      '제천시',
      '청주시 상당구',
      '청주시 서원구',
      '청주시 청원구',
      '청주시 흥덕구',
      '충주시',
      '괴산군',
      '단양군',
      '보은군',
      '영동군',
      '옥천군',
      '음성군',
      '증평군',
      '진천군',
    ],
    충청남도: [
      '계룡시',
      '공주시',
      '논산시',
      '당진시',
      '보령시',
      '서산시',
      '아산시',
      '천안시 동남구',
      '천안시 서북구',
      '금산군',
      '부여군',
      '서천군',
      '예산군',
      '청양군',
      '태안군',
      '홍성군',
    ],
    전북특별자치도: [
      '군산시',
      '김제시',
      '남원시',
      '익산시',
      '전주시 덕진구',
      '전주시 완산구',
      '정읍시',
      '고창군',
      '무주군',
      '부안군',
      '순창군',
      '완주군',
      '임실군',
      '장수군',
      '진안군',
    ],
    전라남도: [
      '광양시',
      '나주시',
      '목포시',
      '순천시',
      '여수시',
      '강진군',
      '고흥군',
      '곡성군',
      '구례군',
      '담양군',
      '무안군',
      '보성군',
      '신안군',
      '영광군',
      '영암군',
      '완도군',
      '장성군',
      '장흥군',
      '진도군',
      '함평군',
      '해남군',
      '화순군',
    ],
    경상북도: [
      '경산시',
      '경주시',
      '구미시',
      '김천시',
      '문경시',
      '상주시',
      '안동시',
      '영주시',
      '영천시',
      '포항시 남구',
      '포항시 북구',
      '고령군',
      '군위군',
      '봉화군',
      '성주군',
      '영덕군',
      '영양군',
      '예천군',
      '울릉군',
      '울진군',
      '의성군',
      '청도군',
      '청송군',
    ],
    경상남도: [
      '거제시',
      '김해시',
      '밀양시',
      '사천시',
      '양산시',
      '진주시',
      '창원시 마산합포구',
      '창원시 마산회원구',
      '창원시 성산구',
      '창원시 의창구',
      '창원시 진해구',
      '통영시',
      '거창군',
      '고성군',
      '남해군',
      '산청군',
      '의령군',
      '창녕군',
      '하동군',
      '함안군',
      '함양군',
      '합천군',
    ],
    제주특별자치도: ['서귀포시', '제주시'],
  };

  /* =========================
     helpers
     ========================= */

  const toEnumArray = (arr, mapObj) =>
      arr.length > 0 ? arr.map(kor => mapObj[kor]).filter(Boolean) : null;

  const buildSearchPayload = useCallback(filters => {
    return {
      keyword: null, // 서버는 keyword 기반 검색 안함
      lifecycles: toEnumArray(filters.lifeCycle, lifecyclesMap),
      households: toEnumArray(filters.household, householdMap),
      interests: toEnumArray(filters.topics, interestMap),
    };
  }, []);

  const loadWelfareServices = useCallback(
      async (filtersArg, formArg) => {
        const filters = filtersArg ?? selectedFilters;
        const form = formArg ?? searchForm;

        setLoading(true);
        try {
          // 1) 서버 호출: 체크박스 기반 후보만 받아옴
          const payload = buildSearchPayload(filters);
          const servicesFromServer = await searchWelfareServices(payload);

          // 2) 프론트 최종 필터: keyword 포함 여부로 거르기
          const refinedServerList = servicesFromServer.filter(svc =>
              cardMatchesKeywordIncludingTags(svc, form.keyword)
          );

          // 3) 카드에 뿌릴 형태로 변환
          const transformedServices = refinedServerList.map(svc => ({
            id: svc.id,
            tags: [
              ...(svc.lifecycles || []),
              ...(svc.households || []),
              ...(svc.interests || []),
            ],
            title: svc.welfareName,
            description: svc.description,
            department: svc.department,
            cycle: svc.supportCycle,
            type: svc.supplyType,
            contact: svc.contact,
            url: svc.url,
            applicationPeriod: {
              startDate: svc.startDate,
              endDate: svc.endDate,
            },
          }));

          setWelfareServices(transformedServices);

          // 4) 상단 요약 숫자
          setServiceSummary({
            total: transformedServices.length,
            central: transformedServices.filter(s =>
                s.department?.includes('부')
            ).length,
            local: transformedServices.filter(
                s =>
                    s.department?.includes('시') ||
                    s.department?.includes('도')
            ).length,
            private: transformedServices.filter(
                s =>
                    s.department?.includes('재단') ||
                    s.department?.includes('센터')
            ).length,
          });
        } catch (error) {
          console.error('복지서비스 로드 실패:', error);
          setWelfareServices([]);
          setServiceSummary({
            total: 0,
            central: 0,
            local: 0,
            private: 0,
          });
        } finally {
          setLoading(false);
        }
      },
      [buildSearchPayload, searchForm, selectedFilters]
  );

  /* 위치 정보 가져오기 */
  const [locationLoaded, setLocationLoaded] = useState(false);

  const updateLocationFromBrowser = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setCurrentLocation('브라우저에서 위치 정보를 지원하지 않아요.');
      return;
    }

    setCurrentLocation('위치 정보를 가져오는 중...');
    navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const { latitude, longitude } = pos.coords;
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko`;
            const res = await fetch(url, {
              headers: { Accept: 'application/json' },
            });
            const data = await res.json();
            const addr = data?.address || {};

            const si =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.municipality ||
                '';
            const guCandidate =
                addr.district ||
                addr.city_district ||
                addr.borough ||
                addr.county ||
                '';
            const gu = guCandidate && guCandidate !== si ? guCandidate : '';
            const dongCandidate =
                addr.suburb ||
                addr.neighbourhood ||
                addr.quarter ||
                addr.residential ||
                addr.hamlet ||
                '';
            const dong =
                dongCandidate && dongCandidate !== gu ? dongCandidate : '';

            const parts = [si, gu, dong].filter(Boolean);
            if (parts.length > 0) {
              setCurrentLocation(parts.join(' '));
            } else if (data?.display_name) {
              const rough = data.display_name.split(',').map(s => s.trim());
              const reversed = [...rough].reverse();
              const findSi = reversed.find(t => /(시|군)$/.test(t));
              const findGu = reversed.find(t => /구$/.test(t));
              const findDong = reversed.find(t => /(동|읍|면)$/.test(t));
              const fallbackParts = [findSi, findGu, findDong].filter(Boolean);
              if (fallbackParts.length > 0) {
                setCurrentLocation(fallbackParts.join(' '));
              } else {
                setCurrentLocation('현재 위치를 확인하지 못했어요.');
              }
            } else {
              setCurrentLocation('현재 위치를 확인하지 못했어요.');
            }
          } catch {
            setCurrentLocation('위치 정보를 가져오는 중 오류가 발생했어요.');
          } finally {
            setLocationLoaded(true);
          }
        },
        err => {
          if (err.code === err.PERMISSION_DENIED) {
            setCurrentLocation('위치 권한이 거부되었어요.');
          } else {
            setCurrentLocation('위치 정보를 가져올 수 없어요.');
          }
          setLocationLoaded(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // 위치 최초 로드
  useEffect(() => {
    if (!locationLoaded) {
      updateLocationFromBrowser();
    }
  }, [updateLocationFromBrowser, locationLoaded]);

  /* 필터 토글 핸들러 */
  const handleFilterChange = useCallback(
      (category, value) => {
        // household만 특수 규칙 (NONE 단독선택)
        if (category === 'household') {
          const NONE_LABEL = '해당 사항 없음';
          const prev = selectedFilters.household;

          if (value === NONE_LABEL) {
            const alreadyHasNone = prev.includes(NONE_LABEL);
            const newHousehold = alreadyHasNone ? [] : [NONE_LABEL];

            const newFilters = {
              ...selectedFilters,
              household: newHousehold,
            };
            setSelectedFilters(newFilters);

            setTimeout(() => {
              loadWelfareServices(newFilters, searchForm);
            }, 0);

            return;
          } else {
            const base = prev.includes(NONE_LABEL) ? [] : prev;
            const newHousehold = base.includes(value)
                ? base.filter(item => item !== value)
                : [...base, value];

            const newFilters = {
              ...selectedFilters,
              household: newHousehold,
            };
            setSelectedFilters(newFilters);

            setTimeout(() => {
              loadWelfareServices(newFilters, searchForm);
            }, 0);

            return;
          }
        }

        // lifeCycle / topics 일반 토글
        const newFilters = {
          ...selectedFilters,
          [category]: selectedFilters[category].includes(value)
              ? selectedFilters[category].filter(item => item !== value)
              : [...selectedFilters[category], value],
        };
        setSelectedFilters(newFilters);

        setTimeout(() => {
          loadWelfareServices(newFilters, searchForm);
        }, 0);
      },
      [selectedFilters, searchForm, loadWelfareServices]
  );

  /* 값 변경 (나이, 지역, 키워드) */
  const handleFormChange = useCallback(
      (field, value) => {
        const newForm = {
          ...searchForm,
          [field]: value,
        };
        setSearchForm(newForm);

        // keyword 입력 즉시 반영
        if (field === 'keyword') {
          setTimeout(() => {
            loadWelfareServices(selectedFilters, newForm);
          }, 0);
        }
      },
      [searchForm, selectedFilters, loadWelfareServices]
  );

  /* 초기화 */
  const handleReset = useCallback(() => {
    const clearedFilters = { lifeCycle: [], household: [], topics: [] };
    const clearedForm = { age: '', province: '', city: '', keyword: '' };
    setSelectedFilters(clearedFilters);
    setSearchForm(clearedForm);
    loadWelfareServices(clearedFilters, clearedForm);
  }, [loadWelfareServices]);

  /* 검색 버튼 */
  const handleSearch = useCallback(() => {
    loadWelfareServices(selectedFilters, searchForm);
  }, [selectedFilters, searchForm, loadWelfareServices]);

  /* 태그 더보기/접기 */
  const toggleTags = useCallback(serviceId => {
    setExpandedTags(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  }, []);

  /* 상세보기 */
  const handleViewDetails = useCallback(
      service => {
        navigate(`/service/${service.id}`, { state: { service } });
      },
      [navigate]
  );

  /* 캘린더에 추가 */
  const { isAuthenticated: authInHeader } = useAuth();

  const handleAddToCalendar = useCallback(
      service => {
        if (!authInHeader) {
          const shouldLogin = window.confirm(
              '캘린더에 추가하려면 로그인이 필요합니다.\n\n로그인 페이지로 이동하시겠습니까?'
          );
          if (shouldLogin) {
            navigate('/LoginPage');
          }
          return;
        }

        const existingServices = JSON.parse(
            localStorage.getItem('calendarServices') || '[]'
        );
        const isAlreadyAdded = existingServices.some(
            existingService => existingService.id === service.id
        );

        if (isAlreadyAdded) {
          alert('이미 추가된 일정입니다.');
          return;
        }

        const calendarData = {
          id: service.id,
          title: service.title,
          description: service.description,
          department: service.department,
          contact: service.contact,
          tags: service.tags,
          applicationPeriod:
              service.applicationPeriod || {
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                isOngoing: false,
              },
        };

        const updatedServices = [...existingServices, calendarData];
        localStorage.setItem('calendarServices', JSON.stringify(updatedServices));

        const shouldNavigateToCalendar = window.confirm(
            `${service.title}이 캘린더에 추가되었습니다!\n\n캘린더 페이지로 이동하시겠습니까?`
        );

        if (shouldNavigateToCalendar) {
          const serviceStartDate = new Date(
              calendarData.applicationPeriod.startDate
          );
          navigate('/calendar', {
            state: {
              targetDate: serviceStartDate,
            },
          });
        }
      },
      [authInHeader, navigate]
  );

  /* ✅ 여기서 핵심: 처음 로드될 때 initialKeywordFromNav로 검색을 강제로 한 번 돌린다 */
  useEffect(() => {
    const firstForm = {
      age: '',
      province: '',
      city: '',
      keyword: initialKeywordFromNav || '',
    };

    // 내부 상태도 맞춰두고
    setSearchForm(firstForm);

    // 그 값으로 검색까지 즉시 수행
    loadWelfareServices(selectedFilters, firstForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeywordFromNav]);

  /* =========================
     렌더
     ========================= */

  const lifeCycleOptions = [
    '임신, 출산',
    '영유아',
    '아동',
    '청소년',
    '청년',
    '중장년',
    '노년',
  ];

  const householdOptions = [
    '저소득',
    '장애인',
    '한부모, 조손',
    '다자녀',
    '다문화, 탈북민',
    '보훈대상자',
    '해당 사항 없음',
  ];

  const topicOptions = [
    '신체건강',
    '생활지원',
    '일자리',
    '안전, 위기',
    '보육',
    '입양, 위탁',
    '서민금융',
    '에너지',
    '정신건강',
    '문화, 여가',
    '법률',
    '주거',
    '임신, 출산',
    '교육',
    '보호, 돌봄',
  ];

  return (
      <>
        <Container>
          <MainContent>
            {/* 위치 정보 */}
            <AddressText>
              <span>{currentLocation}</span>
              <RefreshButton onClick={updateLocationFromBrowser}>
                위치 새로고침
              </RefreshButton>
            </AddressText>

            {/* 필터 섹션 */}
            <FilterSection>
              <FilterCard>
                <FilterGrid>
                  {/* 생애주기 */}
                  <FilterColumn>
                    <FilterTitle>생애주기</FilterTitle>
                    <CheckboxList>
                      {lifeCycleOptions.map((option, index) => (
                          <CheckboxItem key={`lifecycle-${index}`}>
                            <input
                                type='checkbox'
                                checked={selectedFilters.lifeCycle.includes(
                                    option
                                )}
                                onChange={() =>
                                    handleFilterChange('lifeCycle', option)
                                }
                            />
                            {option}
                          </CheckboxItem>
                      ))}
                    </CheckboxList>
                  </FilterColumn>

                  {/* 가구상황 */}
                  <FilterColumn>
                    <FilterTitle>가구상황</FilterTitle>
                    <CheckboxList>
                      {householdOptions.map((option, index) => (
                          <CheckboxItem key={`household-${index}`}>
                            <input
                                type='checkbox'
                                checked={selectedFilters.household.includes(
                                    option
                                )}
                                onChange={() =>
                                    handleFilterChange('household', option)
                                }
                            />
                            {option}
                          </CheckboxItem>
                      ))}
                    </CheckboxList>
                  </FilterColumn>

                  {/* 관심주제 */}
                  <FilterColumn>
                    <FilterTitle>관심주제</FilterTitle>
                    <InterestCheckboxList>
                      {topicOptions.map((option, index) => (
                          <CheckboxItem key={`topic-${index}`}>
                            <input
                                type='checkbox'
                                checked={selectedFilters.topics.includes(
                                    option
                                )}
                                onChange={() =>
                                    handleFilterChange('topics', option)
                                }
                            />
                            {option}
                          </CheckboxItem>
                      ))}
                    </InterestCheckboxList>
                  </FilterColumn>
                </FilterGrid>
              </FilterCard>
            </FilterSection>

            <SectionDivider />

            {/* 추가 검색 조건 */}
            <SearchSection>
              <SearchTitle>추가 검색 조건</SearchTitle>
              <SearchForm>
                {/* 나이 */}
                <FormRow>
                  <FormLabel>나이</FormLabel>
                  <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                  >
                  <span style={{ fontSize: '14px', color: '#6c757d' }}>
                    만
                  </span>
                    <AgeInput
                        type='number'
                        min='1'
                        max='150'
                        value={searchForm.age}
                        onChange={e =>
                            handleFormChange('age', e.target.value)
                        }
                        placeholder='0'
                    />
                    <span style={{ fontSize: '14px', color: '#6c757d' }}>
                    세
                  </span>
                  </div>
                </FormRow>

                {/* 지역 */}
                <FormRow>
                  <FormLabel>지역</FormLabel>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* 시/도 */}
                    <RegionSelect
                        value={searchForm.province}
                        onChange={e => {
                          const selectedProvince = e.target.value;
                          const newForm = {
                            ...searchForm,
                            province: selectedProvince,
                            city: '',
                          };
                          setSearchForm(newForm);
                        }}
                    >
                      <option value=''>시/도 선택</option>
                      {provinces.map(province => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                      ))}
                    </RegionSelect>

                    {/* 시/군/구 */}
                    <RegionSelect
                        value={searchForm.city}
                        onChange={e => {
                          const selectedCity = e.target.value;
                          const newForm = {
                            ...searchForm,
                            city: selectedCity,
                          };
                          setSearchForm(newForm);
                        }}
                        disabled={!searchForm.province}
                    >
                      <option value=''>시/군/구 선택</option>
                      {searchForm.province &&
                          cities[searchForm.province] &&
                          cities[searchForm.province].map(city => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                          ))}
                    </RegionSelect>
                  </div>

                  <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                  >
                    현재 선택: {searchForm.province || '없음'} /{' '}
                    {searchForm.city || '없음'}
                  </div>
                </FormRow>

                {/* 키워드 */}
                <FormRow style={{ gridColumn: '1 / -1' }}>
                  <FormLabel>키워드 검색</FormLabel>
                  <KeywordInput
                      type='text'
                      value={searchForm.keyword}
                      onChange={e =>
                          handleFormChange('keyword', e.target.value)
                      }
                      placeholder="검색어를 입력하세요. (예: 청년, 저소득, 정신건강...)"
                  />
                </FormRow>
              </SearchForm>

              <ButtonContainer>
                <ResetButton onClick={handleReset}>초기화</ResetButton>
                <SearchButtonStyled onClick={handleSearch}>
                  검색
                </SearchButtonStyled>
              </ButtonContainer>
            </SearchSection>

            <SectionDivider />

            {/* 검색 결과 / 요약 / 정렬 */}
            <ServiceDisplaySection>
              <ServiceSummary>
                <SummaryHeader>
                  <TotalServicesText>
                    총 {serviceSummary.total.toLocaleString()} 건의 복지
                    서비스가 있습니다.
                  </TotalServicesText>
                  <SortOptions>
                    <SortButton
                        active={sortOption === 'popular'}
                        onClick={() => setSortOption('popular')}
                    >
                      인기순
                    </SortButton>
                    <SortButton
                        active={sortOption === 'latest'}
                        onClick={() => setSortOption('latest')}
                    >
                      최신순
                    </SortButton>
                  </SortOptions>
                </SummaryHeader>

                <TabContainer>
                  <TabHeader>
                    <TabButton
                        active={activeCategory === 'central'}
                        onClick={() => setActiveCategory('central')}
                        position='left'
                    >
                      중앙부처{' '}
                      <span>
                      {serviceSummary.central.toLocaleString()}
                    </span>
                    </TabButton>
                    <TabButton
                        active={activeCategory === 'local'}
                        onClick={() => setActiveCategory('local')}
                        position='center'
                    >
                      지자체{' '}
                      <span>
                      {serviceSummary.local.toLocaleString()}
                    </span>
                    </TabButton>
                    <TabButton
                        active={activeCategory === 'private'}
                        onClick={() => setActiveCategory('private')}
                        position='right'
                    >
                      민간{' '}
                      <span>
                      {serviceSummary.private.toLocaleString()}
                    </span>
                    </TabButton>
                  </TabHeader>
                </TabContainer>
              </ServiceSummary>

              {loading ? (
                  <LoadingSpinner>서비스를 불러오는 중...</LoadingSpinner>
              ) : (
                  <ServiceCardGrid>
                    {welfareServices.map(service => {
                      const translatedTags = service.tags.map(tag =>
                          translateTag(tag)
                      );
                      const isExpanded = expandedTags[service.id];

                      return (
                          <ServiceCard key={service.id}>
                            <div>
                              <TagsContainer>
                                {isExpanded ? (
                                    <>
                                      {translatedTags.map((tag, index) => (
                                          <ServiceTag
                                              key={`${service.id}-tag-${index}`}
                                          >
                                            {tag}
                                          </ServiceTag>
                                      ))}
                                      <ShowTagsButton
                                          onClick={() =>
                                              toggleTags(service.id)
                                          }
                                      >
                                        접기
                                      </ShowTagsButton>
                                    </>
                                ) : (
                                    <>
                                      {translatedTags
                                          .slice(0, 2)
                                          .map((tag, index) => (
                                              <ServiceTag
                                                  key={`${service.id}-tag-${index}`}
                                              >
                                                {tag}
                                              </ServiceTag>
                                          ))}
                                      {translatedTags.length > 2 && (
                                          <ShowTagsButton
                                              onClick={() =>
                                                  toggleTags(service.id)
                                              }
                                          >
                                            태그 더보기 (
                                            {translatedTags.length - 2})
                                          </ShowTagsButton>
                                      )}
                                    </>
                                )}
                              </TagsContainer>

                              <ServiceTitle>{service.title}</ServiceTitle>

                              <ServiceDescription>
                                {service.description}
                              </ServiceDescription>

                              <ServiceDetailsList>
                                <ServiceDetailItem>
                                  담당부서:{' '}
                                  {service.department || '-'}
                                </ServiceDetailItem>
                                <ServiceDetailItem>
                                  지원주기: {service.cycle || '-'}
                                </ServiceDetailItem>
                                <ServiceDetailItem>
                                  제공유형: {service.type || '-'}
                                </ServiceDetailItem>
                                <ServiceDetailItem>
                                  문의처: {service.contact || '-'}
                                </ServiceDetailItem>
                              </ServiceDetailsList>
                            </div>

                            <ViewDetailsButton
                                onClick={() =>
                                    handleViewDetails(service)
                                }
                            >
                              자세히 보기
                            </ViewDetailsButton>

                            <AddToCalendarButton
                                onClick={() =>
                                    handleAddToCalendar(service)
                                }
                            >
                              캘린더에 추가
                            </AddToCalendarButton>
                          </ServiceCard>
                      );
                    })}
                  </ServiceCardGrid>
              )}
            </ServiceDisplaySection>
          </MainContent>
        </Container>

        <ScrollToTopButton />
      </>
  );
};

export default ServicePage;
