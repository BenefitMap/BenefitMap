import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

// Removed local GlobalStyle to ensure app-wide font (GowunBatang) applies

const Container = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const AddressText = styled.div`
  font-size: 12px;
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
  background-color: #D7FFE3;
  border-radius: 24px;
  padding: 28px 24px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
`;

const FilterColumn = styled.div`
  background-color: transparent;
  padding: 8px 16px 8px 16px;
  border-right: 1px solid rgba(0,0,0,0.06);
  
  &:last-child {
    border-right: none;
  }
`;

const FilterTitle = styled.h3`
  position: relative;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 18px;
  text-align: center;

  /* ✅ 밑줄 추가 */
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 1px;
    opacity: 0.2;
    background-color: #8a8a8a;
  }
`;

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  gap: 8px;
  
  input[type="checkbox"] {
    appearance: none;
    margin: 0;
    width: 18px;
    height: 18px;
    border: 2px solid #9BECCB; /* light border to match D7FFE3 theme */
    border-radius: 4px;
    background-color: #fff;
    display: grid;
    place-content: center;
  }
  input[type="checkbox"]:checked {
    border-color: #4a9d5f;
    background-color: #4a9d5f;
  }
  input[type="checkbox"]:checked::after {
    content: '';
    width: 10px;
    height: 10px;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0, 43% 62%);
    background: #fff;
  }
`;

const SectionDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #333;
  margin: 30px 0;
`;

const SearchSection = styled.div`
  padding: 30px 0;
`;

const SearchTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const SearchForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  color: #333;
  min-width: 50px;
  font-weight: 400;
`;

const AgeInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  width: 60px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #4a9d5f;
  }
`;

const RegionSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  min-width: 180px;
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
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  flex: 1;
  max-width: 400px;
  
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
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.2s;
`;

const ResetButton = styled(Button)`
  background-color: #999;
  color: white;
  
  &:hover {
    background-color: #888;
  }
`;

const SearchButton = styled(Button)`
  background-color: #B8E6C9;
  color: #333;
  
  &:hover {
    background-color: #A5D9B8;
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
  color: ${props => props.active ? '#333' : '#999'};
  border: none;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.active ? '600' : '400'};
  
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
  background: ${({ active }) => (active ? "#f0f0f0" : "#fff")};
  border: none;
  border-right: ${({ position }) => (position !== "right" ? "1px solid #ddd" : "none")};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
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
  background-color: white;
  border: 1px solid #e0e0e0;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 450px;
`;

const ServiceTags = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ServiceTag = styled.span`
  background-color: white;
  color: #333;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 400;
  border: 1px solid #ddd;
`;

const ServiceTitle = styled.h3`
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.4;
`;

const ServiceDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
  flex-grow: 1;
`;

const ServiceDetailsList = styled.ul`
  list-style: none;
  margin-bottom: 20px;
  padding-left: 0;
`;

const ServiceDetailItem = styled.li`
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
  
  &:before {
    content: '• ';
    margin-right: 5px;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ViewDetailsButton = styled.button`
  background-color: #9e9e9e;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  font-weight: 400;
  margin-top: auto;

  &:hover {
    background-color: #8a8a8a;
  }
`;

const AddToCalendarButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  font-weight: 400;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
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

const ServicePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedFilters, setSelectedFilters] = useState({
    lifeCycle: [],
    household: [],
    topics: []
  });
  
  const [searchForm, setSearchForm] = useState({
    age: '',
    province: '',
    city: '',
    keyword: ''
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [currentLocation, setCurrentLocation] = useState('위치 정보를 가져오는 중...');
  const [welfareServices, setWelfareServices] = useState([]);
  const [serviceSummary, setServiceSummary] = useState({
    total: 0,
    central: 0,
    local: 0,
    private: 0
  });
  const [loading, setLoading] = useState(false);

  // 8월-12월 사이의 랜덤 날짜 생성 함수
  const generateRandomDate = () => {
    const year = 2025;
    const startMonth = 7; // 8월 (0부터 시작)
    const endMonth = 11; // 12월 (0부터 시작)
    
    // 랜덤 월 선택
    const randomMonth = Math.floor(Math.random() * (endMonth - startMonth + 1)) + startMonth;
    
    // 해당 월의 일수 계산
    const daysInMonth = new Date(year, randomMonth + 1, 0).getDate();
    
    // 랜덤 일 선택
    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    
    return new Date(year, randomMonth, randomDay);
  };

  // 1~12일 간격의 랜덤 서비스 기간 생성 함수
  const generateServicePeriod = () => {
    const startDate = generateRandomDate();
    const duration = Math.floor(Math.random() * 12) + 1; // 1~12일
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isOngoing: false
    };
  };

  const loadDummyData = () => {
    const dummyServices = [
      {
        id: 1,
        tags: ['일자리', '서민금융'],
        title: '장애인자립자금대여',
        description: '저소득 장애인의 소규모 창업 및 출퇴근용 자동차 구입 비용을 장기 처리로 대여하여 생업의 기반을 다지고 편리하게 이동할 수 있도록 지원합니다.',
        department: '보건복지부 장애인자립기반과',
        cycle: '1회성',
        type: '현금대여(융자)',
        contact: '129',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 2,
        tags: ['생활지원'],
        title: '저소득층 에너지 효율 개선',
        description: '저소득 가구의 에너지 사용 환경을 개선하여 난방비 부담을 줄이고 쾌적한 주거 환경을 제공합니다.',
        department: '산업통상자원부 에너지복지과',
        cycle: '매년',
        type: '시설개선',
        contact: '1600-3190',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 3,
        tags: ['주거', '생활지원'],
        title: '청년 전세자금 대출',
        description: '무주택 청년의 주거 안정을 위해 전세자금 대출을 지원하여 주거비 부담을 경감합니다.',
        department: '국토교통부 주택기금과',
        cycle: '1회성',
        type: '현금대여(융자)',
        contact: '1599-0001',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 4,
        tags: ['보육', '아동'],
        title: '아이돌봄 서비스',
        description: '맞벌이 가정 등 양육 공백이 발생한 가정에 아이돌보미를 파견하여 아동의 안전한 보호 및 양육을 지원합니다.',
        department: '여성가족부 가족정책과',
        cycle: '수시',
        type: '서비스',
        contact: '1577-2514',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 5,
        tags: ['교육', '청소년'],
        title: '청소년 방과후 아카데미',
        description: '청소년의 건강한 성장을 지원하기 위해 방과후 학습, 체험활동, 급식 등을 제공하는 종합 서비스입니다.',
        department: '여성가족부 청소년정책과',
        cycle: '매년',
        type: '서비스',
        contact: '1388',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 6,
        tags: ['노년', '신체건강'],
        title: '노인장기요양보험',
        description: '고령이나 노인성 질병 등으로 일상생활이 어려운 어르신에게 신체활동 또는 가사활동 지원 등의 장기요양급여를 제공합니다.',
        department: '보건복지부 요양보험제도과',
        cycle: '수시',
        type: '현금/서비스',
        contact: '1577-1000',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 7,
        tags: ['위기', '생활지원'],
        title: '긴급복지지원',
        description: '갑작스러운 위기 상황으로 생계 유지가 곤란한 저소득층에게 생계비, 의료비 등을 신속하게 지원합니다.',
        department: '보건복지부 복지정책과',
        cycle: '1회성',
        type: '현금/서비스',
        contact: '129',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 8,
        tags: ['다문화', '생활지원'],
        title: '다문화가족 지원 서비스',
        description: '다문화가족의 안정적인 정착과 가족생활을 지원하기 위한 한국어 교육, 상담, 통번역 등의 서비스를 제공합니다.',
        department: '여성가족부 다문화가족정책과',
        cycle: '수시',
        type: '서비스',
        contact: '1577-1366',
        applicationPeriod: generateServicePeriod()
      },
      {
        id: 9,
        tags: ['보훈대상자', '생활지원'],
        title: '국가유공자 보훈급여금',
        description: '국가유공자와 그 유족 또는 가족의 생활 안정을 도모하고 복지 향상을 위해 보훈급여금을 지급합니다.',
        department: '국가보훈부 보상정책과',
        cycle: '매월',
        type: '현금',
        contact: '1577-0606',
        applicationPeriod: generateServicePeriod()
      }
    ];

    setWelfareServices(dummyServices);
    setServiceSummary({
      total: 5256,
      central: 368,
      local: 4552,
      private: 336
    });
  };

  const updateLocationFromBrowser = React.useCallback(() => {
    if (!('geolocation' in navigator)) {
      setCurrentLocation('브라우저에서 위치 정보를 지원하지 않아요.');
      return;
    }

    setCurrentLocation('위치 정보를 가져오는 중...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko`;
          const res = await fetch(url, {
            headers: {
              // Some browsers ignore custom UA; this is best-effort.
              'Accept': 'application/json'
            }
          });
          const data = await res.json();
          const addr = data?.address || {};

          // Build Korean-style short address: 시/군 + 구/군 + 동(읍/면)
          const si = addr.city || addr.town || addr.village || addr.municipality || '';
          // district (구) or county (군)
          const guCandidate = addr.district || addr.city_district || addr.borough || addr.county || '';
          const gu = guCandidate && guCandidate !== si ? guCandidate : '';
          // neighbourhood levels often map to 동/읍/면
          const dongCandidate = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.hamlet || '';
          const dong = dongCandidate && dongCandidate !== gu ? dongCandidate : '';

          const parts = [si, gu, dong].filter(Boolean);
          if (parts.length > 0) {
            setCurrentLocation(parts.join(' '));
          } else if (data?.display_name) {
            // Fallback: parse display_name to extract tokens ending with 시/군, 구, 동/읍/면
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
        } catch (e) {
          setCurrentLocation('위치 정보를 가져오는 중 오류가 발생했어요.');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setCurrentLocation('위치 권한이 거부되었어요.');
        } else {
          setCurrentLocation('위치 정보를 가져올 수 없어요.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  React.useEffect(() => {
    updateLocationFromBrowser();
    loadDummyData();
  }, [updateLocationFromBrowser]);

  const lifeCycleOptions = ['임신, 출산', '영유아', '아동', '청소년', '청년', '중장년', '노년'];
  const householdOptions = ['저소득', '장애인', '한부모, 조손', '다자녀', '다문화, 탈북민', '보훈대상자', '해당 사항 없음'];
  const topicOptions = ['신체건강', '생활지원', '일자리', '안전, 위기', '보육', '입양, 위탁', '서민금융', '에너지', '정신건강', '문화, 여가', '법률', '주거', '임신, 출산', '교육', '보호, 돌봄'];

  const provinces = ['서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도', '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도'];

  const cities = {
    '서울특별시': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
    '부산광역시': ['강서구','금정구','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구','기장군'],
    '대구광역시': ['남구','달서구','동구','북구','서구','수성구','중구','달성군','군위군'],
    '인천광역시': ['강화군','계양구','남동구','동구','미추홀구','부평구','서구','연수구','옹진군','중구'],
    '광주광역시': ['광산구','남구','동구','북구','서구'],
    '대전광역시': ['대덕구','동구','서구','유성구','중구'],
    '울산광역시': ['남구','동구','북구','중구','울주군'],
    '세종특별자치시': ['세종시'],
    '경기도': ['가평군','고양시 덕양구','고양시 일산동구','고양시 일산서구','과천시','광명시','광주시','구리시','군포시','김포시','남양주시','동두천시','부천시','성남시 분당구','성남시 수정구','성남시 중원구','수원시 권선구','수원시 영통구','수원시 장안구','수원시 팔달구','시흥시','안산시 단원구','안산시 상록구','안성시','안양시 동안구','안양시 만안구','양주시','양평군','여주시','연천군','오산시','용인시 기흥구','용인시 수지구','용인시 처인구','의왕시','의정부시','이천시','파주시','평택시','포천시','하남시','화성시'],
    '강원특별자치도': ['강릉시','동해시','삼척시','속초시','원주시','춘천시','태백시','고성군','양구군','양양군','영월군','인제군','정선군','철원군','평창군','홍천군','화천군','횡성군'],
    '충청북도': ['제천시','청주시 상당구','청주시 서원구','청주시 청원구','청주시 흥덕구','충주시','괴산군','단양군','보은군','영동군','옥천군','음성군','증평군','진천군'],
    '충청남도': ['계룡시','공주시','논산시','당진시','보령시','서산시','아산시','천안시 동남구','천안시 서북구','금산군','부여군','서천군','예산군','청양군','태안군','홍성군'],
    '전북특별자치도': ['군산시','김제시','남원시','익산시','전주시 덕진구','전주시 완산구','정읍시','고창군','무주군','부안군','순창군','완주군','임실군','장수군','진안군'],
    '전라남도': ['광양시','나주시','목포시','순천시','여수시','강진군','고흥군','곡성군','구례군','담양군','무안군','보성군','신안군','영광군','영암군','완도군','장성군','장흥군','진도군','함평군','해남군','화순군'],
    '경상북도': ['경산시','경주시','구미시','김천시','문경시','상주시','안동시','영주시','영천시','포항시 남구','포항시 북구','고령군','군위군','봉화군','성주군','영덕군','영양군','예천군','울릉군','울진군','의성군','청도군','청송군'],
    '경상남도': ['거제시','김해시','밀양시','사천시','양산시','진주시','창원시 마산합포구','창원시 마산회원구','창원시 성산구','창원시 의창구','창원시 진해구','통영시','거창군','고성군','남해군','산청군','의령군','창녕군','하동군','함안군','함양군','합천군'],
    '제주특별자치도': ['서귀포시','제주시']
  };

  const handleFilterChange = (category, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleFormChange = (field, value) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setSelectedFilters({ lifeCycle: [], household: [], topics: [] });
    setSearchForm({ age: '', province: '', city: '', keyword: '' });
  };

  const handleSearch = () => {
    console.log('검색 조건:', { selectedFilters, searchForm });
    loadDummyData();
  };

  const handleViewDetails = (service) => {
    navigate(`/service/${service.id}`, { state: { service } });
  };

  const handleAddToCalendar = (service) => {
    // 로그인 체크
    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        '캘린더에 추가하려면 로그인이 필요합니다.\n\n로그인 페이지로 이동하시겠습니까?'
      );
      if (shouldLogin) {
        navigate('/LoginPage');
      }
      return;
    }

    // 중복 체크
    const existingServices = JSON.parse(localStorage.getItem('calendarServices') || '[]');
    const isAlreadyAdded = existingServices.some(existingService => existingService.id === service.id);
    
    if (isAlreadyAdded) {
      alert('이미 추가된 일정입니다.');
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
    
    // 성공 알림 및 캘린더 이동 확인
    const shouldNavigateToCalendar = window.confirm(
      `${service.title}이 캘린더에 추가되었습니다!\n\n캘린더 페이지로 이동하시겠습니까?`
    );
    
    if (shouldNavigateToCalendar) {
      // 서비스의 시작 날짜로 이동
      const serviceStartDate = new Date(calendarData.applicationPeriod.startDate);
      navigate('/calendar', { 
        state: { 
          targetDate: serviceStartDate 
        } 
      });
    }
  };

  return (
    <>
      <Container>
        <MainContent>
          <AddressText>
            <span>{currentLocation}</span>
            <RefreshButton onClick={updateLocationFromBrowser}>위치 새로고침</RefreshButton>
          </AddressText>
          
          <FilterSection>
            <FilterCard>
            <FilterGrid>
              <FilterColumn>
                <FilterTitle>생애주기</FilterTitle>
                <CheckboxList>
                  {lifeCycleOptions.map(option => (
                    <CheckboxItem key={option}>
                      <input
                        type="checkbox"
                        checked={selectedFilters.lifeCycle.includes(option)}
                        onChange={() => handleFilterChange('lifeCycle', option)}
                      />
                      {option}
                    </CheckboxItem>
                  ))}
                </CheckboxList>
              </FilterColumn>
              
              <FilterColumn>
                <FilterTitle>가구상황</FilterTitle>
                <CheckboxList>
                  {householdOptions.map(option => (
                    <CheckboxItem key={option}>
                      <input
                        type="checkbox"
                        checked={selectedFilters.household.includes(option)}
                        onChange={() => handleFilterChange('household', option)}
                      />
                      {option}
                    </CheckboxItem>
                  ))}
                </CheckboxList>
              </FilterColumn>
              
              <FilterColumn>
                <FilterTitle>관심주제</FilterTitle>
                <CheckboxList>
                  {topicOptions.map(option => (
                    <CheckboxItem key={option}>
                      <input
                        type="checkbox"
                        checked={selectedFilters.topics.includes(option)}
                        onChange={() => handleFilterChange('topics', option)}
                      />
                      {option}
                    </CheckboxItem>
                  ))}
                </CheckboxList>
              </FilterColumn>
            </FilterGrid>
            </FilterCard>
          </FilterSection>

          <SectionDivider />

          <SearchSection>
            <SearchTitle>선택한 항목</SearchTitle>
            <SearchForm>
              <FormRow>
                <FormLabel>나이</FormLabel>
                <span>나이 만</span>
                <AgeInput
                  type="number"
                  value={searchForm.age}
                  onChange={(e) => handleFormChange('age', e.target.value)}
                  placeholder="0"
                />
                <span>세</span>
              </FormRow>
              
              <FormRow>
                <FormLabel>지역</FormLabel>
                <RegionSelect
                  value={searchForm.province}
                  onChange={(e) => {
                    handleFormChange('province', e.target.value);
                    handleFormChange('city', '');
                  }}
                >
                  <option value="">시/도 선택</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </RegionSelect>
                <RegionSelect
                  value={searchForm.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  disabled={!searchForm.province}
                >
                  <option value="">시/군/구 선택</option>
                  {searchForm.province && cities[searchForm.province]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </RegionSelect>
              </FormRow>
              
              <FormRow>
                <FormLabel>키워드</FormLabel>
                <KeywordInput
                  type="text"
                  value={searchForm.keyword}
                  onChange={(e) => handleFormChange('keyword', e.target.value)}
                  placeholder="검색어를 입력하세요."
                />
              </FormRow>
            </SearchForm>
            
            <ButtonContainer>
              <ResetButton onClick={handleReset}>초기화</ResetButton>
              <SearchButton onClick={handleSearch}>검색</SearchButton>
            </ButtonContainer>
          </SearchSection>
          <SectionDivider />
          <ServiceDisplaySection>
            <ServiceSummary>
              <SummaryHeader>
                <TotalServicesText>
                  총 {serviceSummary.total.toLocaleString()} 건의 복지 서비스가 있습니다.
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
      position="left"
    >
      중앙부처 <span>{serviceSummary.central.toLocaleString()}</span>
    </TabButton>
    <TabButton
      active={activeCategory === 'local'}
      onClick={() => setActiveCategory('local')}
      position="center"
    >
      지자체 <span>{serviceSummary.local.toLocaleString()}</span>
    </TabButton>
    <TabButton
      active={activeCategory === 'private'}
      onClick={() => setActiveCategory('private')}
      position="right"
    >
      민간 <span>{serviceSummary.private.toLocaleString()}</span>
    </TabButton>
  </TabHeader>
</TabContainer>

            </ServiceSummary>

            {loading ? (
              <LoadingSpinner>서비스를 불러오는 중...</LoadingSpinner>
            ) : (
              <ServiceCardGrid>
                {welfareServices.map(service => (
                  <ServiceCard key={service.id}>
                    <div>
                      <ServiceTags>
                        {service.tags.map(tag => (
                          <ServiceTag key={tag}>{tag}</ServiceTag>
                        ))}
                      </ServiceTags>
                      <ServiceTitle>{service.title}</ServiceTitle>
                      <ServiceDescription>{service.description}</ServiceDescription>
                      <ServiceDetailsList>
                        <ServiceDetailItem>담당부서: {service.department}</ServiceDetailItem>
                        <ServiceDetailItem>지원주기: {service.cycle}</ServiceDetailItem>
                        <ServiceDetailItem>제공유형: {service.type}</ServiceDetailItem>
                        <ServiceDetailItem>문의처: {service.contact}</ServiceDetailItem>
                      </ServiceDetailsList>
                    </div>
                    <ViewDetailsButton onClick={() => handleViewDetails(service)}>
                      자세히 보기
                    </ViewDetailsButton>
                    <AddToCalendarButton onClick={() => handleAddToCalendar(service)}>
                      캘린더에 추가
                    </AddToCalendarButton>
                  </ServiceCard>
                ))}
              </ServiceCardGrid>
            )}
          </ServiceDisplaySection>
        </MainContent>
      </Container>
    </>
  );
};

export default ServicePage;