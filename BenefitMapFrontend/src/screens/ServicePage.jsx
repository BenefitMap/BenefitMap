import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'GowunBatang';
    src: url('./fonts/GowunBatang.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'GowunBatang', serif;
    background-color: #f8f9fa;
  }
`;

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
  background-color: white;
  border: 2px solid #D7FFE3;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
`;

const FilterColumn = styled.div`
  background-color: #D7FFE3;
  border-radius: 8px;
  padding: 15px;
`;

const FilterTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
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
  
  input[type="checkbox"] {
    margin-right: 8px;
    width: 16px;
    height: 16px;
    accent-color: #4a9d5f;
  }
`;

const SearchSection = styled.div`
  background-color: white;
  border: 2px solid #D7FFE3;
  border-radius: 12px;
  padding: 20px;
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

const CategoryTabContainer = styled.div`
  display: flex;
  border: 1px solid #e0e0e0;
  background-color: white;
`;

const CategoryTab = styled.div`
  flex: 1;
  text-align: center;
  padding: 15px 20px;
  background-color: ${props => props.active ? '#f5f5f5' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
  
  &:not(:last-child) {
    border-right: 1px solid #e0e0e0;
  }
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const CategoryTabName = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 400;
`;

const CategoryTabCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ServiceCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
`;

const ServiceCard = styled.div`
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
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
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
  font-weight: 400;

  &:hover {
    background-color: #8a8a8a;
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
  const [locationError, setLocationError] = useState(null);
  const [welfareServices, setWelfareServices] = useState([]);
  const [serviceSummary, setServiceSummary] = useState({
    total: 0,
    central: 0,
    local: 0,
    private: 0
  });
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setCurrentLocation('위치 서비스 미지원');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          setCurrentLocation(address);
          setLocationError(null);
        } catch (error) {
          console.error('주소 변환 실패:', error);
          setCurrentLocation(`위도: ${latitude.toFixed(4)}, 경도: ${longitude.toFixed(4)}`);
          setLocationError('주소 변환에 실패했습니다.');
        }
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        let errorMessage = '위치 정보를 가져올 수 없습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 접근 권한이 거부되었습니다.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }
        setLocationError(errorMessage);
        setCurrentLocation('위치 정보 없음');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ko`,
        {
          headers: {
            'User-Agent': 'BenefitMap/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('API 요청 실패');
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        const address = data.address;
        if (address) {
          let koreanAddress = '';
          
          if (address.state) {
            koreanAddress += address.state;
          }
          
          if (address.city || address.county) {
            koreanAddress += ` ${address.city || address.county}`;
          }
          
          if (address.suburb || address.district) {
            koreanAddress += ` ${address.suburb || address.district}`;
          }
          
          if (address.road) {
            koreanAddress += ` ${address.road}`;
          }
          
          if (address.house_number) {
            koreanAddress += ` ${address.house_number}`;
          }
          
          const finalAddress = koreanAddress.trim();
          if (finalAddress && finalAddress.length > 3) {
            return finalAddress;
          }
        }
        
        const displayName = data.display_name;
        if (displayName.includes('대한민국') || displayName.includes('South Korea')) {
          const koreanPattern = /([가-힣]+(?:도|시|특별시|광역시|자치시|자치도))\s*([가-힣]+(?:시|군|구|동|읍|면))\s*([가-힣]+(?:구|동|읍|면|리))\s*([가-힣\s\d-]+)/;
          const match = displayName.match(koreanPattern);
          if (match) {
            return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`.trim();
          }
        }
        
        return displayName;
      } else {
        throw new Error('주소 정보 없음');
      }
    } catch (error) {
      console.warn('주소 변환 실패, 대체 방법 사용:', error);
      return getApproximateAddress(lat, lng);
    }
  };

  const getApproximateAddress = (lat, lng) => {
    const regions = [
      { name: '서울특별시', lat: [37.4, 37.7], lng: [126.7, 127.2] },
      { name: '부산광역시', lat: [35.0, 35.3], lng: [128.9, 129.2] },
      { name: '대구광역시', lat: [35.7, 35.9], lng: [128.4, 128.7] },
      { name: '인천광역시', lat: [37.3, 37.6], lng: [126.4, 126.8] },
      { name: '광주광역시', lat: [35.1, 35.2], lng: [126.7, 126.9] },
      { name: '대전광역시', lat: [36.2, 36.4], lng: [127.3, 127.5] },
      { name: '울산광역시', lat: [35.4, 35.6], lng: [129.2, 129.4] },
      { name: '세종특별자치시', lat: [36.4, 36.6], lng: [127.2, 127.4] },
      { name: '경기도', lat: [36.8, 38.2], lng: [126.2, 127.8] },
      { name: '강원도', lat: [37.0, 38.8], lng: [127.0, 129.5] },
      { name: '충청북도', lat: [36.0, 37.8], lng: [127.0, 128.8] },
      { name: '충청남도', lat: [35.0, 37.2], lng: [125.5, 127.8] },
      { name: '전라북도', lat: [35.0, 36.8], lng: [125.5, 127.8] },
      { name: '전라남도', lat: [33.5, 35.5], lng: [124.5, 127.5] },
      { name: '경상북도', lat: [35.5, 38.0], lng: [128.0, 130.5] },
      { name: '경상남도', lat: [34.0, 36.2], lng: [127.0, 130.0] },
      { name: '제주특별자치도', lat: [33.0, 34.2], lng: [126.0, 127.5] }
    ];

    for (const region of regions) {
      if (lat >= region.lat[0] && lat <= region.lat[1] && 
          lng >= region.lng[0] && lng <= region.lng[1]) {
        return `${region.name} (대략적 위치)`;
      }
    }
    
    return `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`;
  };

  const fetchWelfareServices = async (searchParams = {}) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.bokjiro.go.kr/welfare/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
          ...searchParams,
          page: 1,
          size: 9
        })
      });

      if (!response.ok) {
        throw new Error('API 호출 실패');
      }

      const data = await response.json();
      
      const services = data.services || [];
      setWelfareServices(services);
      
      setServiceSummary({
        total: data.totalCount || services.length,
        central: data.centralCount || 0,
        local: data.localCount || 0,
        private: data.privateCount || 0
      });
    } catch (error) {
      console.error('복지 서비스 데이터 로드 실패:', error);
      loadDummyData();
    } finally {
      setLoading(false);
    }
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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
        source: 'central'
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

  React.useEffect(() => {
    getCurrentLocation();
    loadDummyData();
  }, []);

  const lifeCycleOptions = [
    '임신, 출산', '영유아', '아동', '청소년', '청년', '중장년', '노년'
  ];

  const householdOptions = [
    '저소득', '장애인', '한부모, 조손', '다자녀', '다문화, 탈북민', '보훈대상자', '해당 사항 없음'
  ];

  const topicOptions = [
    '신체건강', '생활지원', '일자리', '안전, 위기', '보육', '입양, 위탁', 
    '서민금융', '에너지', '정신건강', '문화, 여가', '법률', '주거', 
    '임신, 출산', '교육', '보호, 돌봄'
  ];

  const provinces = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', 
    '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도', 
    '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
  ];

  const cities = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '부산광역시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
    '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '인천광역시': ['계양구', '남구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
    '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
    '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
    '세종특별자치시': ['세종시'],
    '경기도': ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '과천시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '여주시', '양평군', '고양시', '동두천시', '가평군', '연천군'],
    '강원도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
    '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
    '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
    '전라북도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
    '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
    '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
    '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
    '제주특별자치도': ['제주시', '서귀포시']
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
    setSelectedFilters({
      lifeCycle: [],
      household: [],
      topics: []
    });
    setSearchForm({
      age: '',
      province: '',
      city: '',
      keyword: ''
    });
  };

  const handleSearch = () => {
    console.log('검색 조건:', { selectedFilters, searchForm });
    
    const searchParams = {
      lifeCycle: selectedFilters.lifeCycle,
      household: selectedFilters.household,
      topics: selectedFilters.topics,
      age: searchForm.age,
      province: searchForm.province,
      city: searchForm.city,
      keyword: searchForm.keyword
    };
    
    fetchWelfareServices(searchParams);
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <MainContent>
          <AddressText>
            <span>{currentLocation}</span>
            {locationError && (
              <span style={{ color: '#ff6b6b', fontSize: '11px' }}>
                ({locationError})
              </span>
            )}
            <RefreshButton onClick={getCurrentLocation}>
              위치 새로고침
            </RefreshButton>
          </AddressText>
          
          <FilterSection>
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
          </FilterSection>

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
              
              <CategoryTabContainer>
                <CategoryTab 
                  active={activeCategory === 'central'}
                  onClick={() => setActiveCategory('central')}
                >
                  <CategoryTabName>중앙부처</CategoryTabName>
                  <CategoryTabCount>{serviceSummary.central.toLocaleString()}</CategoryTabCount>
                </CategoryTab>
                <CategoryTab 
                  active={activeCategory === 'local'}
                  onClick={() => setActiveCategory('local')}
                >
                  <CategoryTabName>지자체</CategoryTabName>
                  <CategoryTabCount>{serviceSummary.local.toLocaleString()}</CategoryTabCount>
                </CategoryTab>
                <CategoryTab 
                  active={activeCategory === 'private'}
                  onClick={() => setActiveCategory('private')}
                >
                  <CategoryTabName>민간</CategoryTabName>
                  <CategoryTabCount>{serviceSummary.private.toLocaleString()}</CategoryTabCount>
                </CategoryTab>
              </CategoryTabContainer>
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
                    <ViewDetailsButton>자세히 보기</ViewDetailsButton>
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