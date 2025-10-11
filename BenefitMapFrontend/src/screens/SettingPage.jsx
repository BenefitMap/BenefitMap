import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// --- 스타일 컴포넌트 정의 ---
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 130px - 317px);
  align-items: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
`;

const PageTitleContainer = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h2 { 
    font-size: 1.8rem; 
    font-weight: 600; 
    margin-bottom: 8px;
    color: #2c3e50;
  }
  
  p { 
    color: #7f8c8d; 
    font-size: 0.9rem; 
    margin: 4px 0;
  }
`;

const SettingsMain = styled.main`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SettingsBox = styled.form`
  background-color: #ffffff;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
`;

const ProgressContainer = styled.div`
  margin-bottom: 25px;
  padding: 15px;
  background-color: #e8f5e9;
  border-radius: 8px;
  border-left: 4px solid #43a047;
`;

const ProgressTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #2e7d32;
  font-size: 14px;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #c8e6c9;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #43a047;
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const ProgressText = styled.span`
  font-size: 12px;
  color: #2e7d32;
  margin-top: 8px;
  display: block;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const RequiredFormGroup = styled(FormGroup)`
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #43a047;
  position: relative;
  
  &::before {
    content: '필수';
    position: absolute;
    top: -8px;
    left: 15px;
    background-color: #43a047;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }
`;

const OptionalFormGroup = styled(FormGroup)`
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #6c757d;
  position: relative;
  
  &::before {
    content: '선택';
    position: absolute;
    top: -8px;
    left: 15px;
    background-color: #6c757d;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #2c3e50;
`;

const FormRow = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FormCol = styled.div`
  flex: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background-color: #ffffff;
  font-size: 0.9rem;
  color: #2c3e50;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #43a047;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const AgeInputContainer = styled.div`
  position: relative;
`;

const AgeSpinGroup = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AgeSpinButton = styled.button`
  width: 24px;
  height: 16px;
  border: 1px solid #dee2e6;
  background-color: transparent;
  color: #43a047;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
  line-height: 1;
  transition: all 0.2s ease;
  
  &:hover { 
    background-color: #f8f9fa;
    border-color: #43a047;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #ffffff;
  color: ${props => props.$hasValue ? '#2c3e50' : '#adb5bd'};
  font-size: 0.9rem;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  
  &:hover {
    border-color: #43a047;
  }
  
  &:focus {
    outline: none;
    border-color: #43a047;
  }
  
  &::after {
    content: '▼';
    color: #43a047;
    font-size: 10px;
    transition: transform 0.2s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  color: ${props => props.$isSelected ? 'white' : '#2c3e50'};
  background-color: ${props => props.$isSelected ? '#43a047' : 'transparent'};
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.$isSelected ? '#2e7d32' : '#f8f9fa'};
  }
`;

const ButtonContainer = styled.div`
  text-align: center;
  margin-top: 25px;
`;

const SubmitButton = styled.button`
  padding: 12px 30px;
  border-radius: 6px;
  border: none;
  background-color: #43a047;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #2e7d32;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(67, 160, 71, 0.3);
  }
`;

// 드롭다운 컴포넌트
function SimpleDropdown({ options, selectedItems, onSelectionChange, placeholder, isSingleSelect = false, nextFieldRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    // 드롭다운이 열릴 때 body 스크롤 막기 (스크롤바 공간은 유지)
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px'; // 스크롤바 너비만큼 패딩 추가
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset'; // cleanup
      document.body.style.paddingRight = '0px'; // cleanup
    };
  }, [isOpen]);

  const handleOptionClick = (option) => {
    if (isSingleSelect) {
      onSelectionChange([option]);
      setIsOpen(false);
      setTimeout(() => {
        if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
          // 다음 필드로 스크롤 이동
          nextFieldRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    } else {
      const newSelection = selectedItems.includes(option)
        ? selectedItems.filter(item => item !== option)
        : [...selectedItems, option];
      onSelectionChange(newSelection);
      setIsOpen(false);
      setTimeout(() => {
        if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
          // 다음 필드로 스크롤 이동
          nextFieldRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(e);
    }
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton 
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        $hasValue={selectedItems.length > 0}
        $isOpen={isOpen}
        type="button"
        tabIndex={0}
      >
        {selectedItems.length > 0 ? selectedItems.join(', ') : placeholder}
      </DropdownButton>
      
      {isOpen && (
        <DropdownMenu>
          {options.map(option => (
            <DropdownItem 
              key={option}
              onClick={() => handleOptionClick(option)}
              $isSelected={selectedItems.includes(option)}
            >
              {option}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
}

// 메인 컴포넌트
function SettingsPage() {
  const navigate = useNavigate();
  
  const region1Ref = useRef(null);
  const region2Ref = useRef(null);
  const ageRef = useRef(null);
  const genderRef = useRef(null);
  const lifeCycleRef = useRef(null);
  const householdRef = useRef(null);
  const interestRef = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (!accessToken && !userInfo) {
      navigate('/LoginPage');
    }
  }, [navigate]);

  const [selectedRegion1, setSelectedRegion1] = useState([]);
  const [selectedRegion2, setSelectedRegion2] = useState([]);
  const [region2Options, setRegion2Options] = useState([]);
  const [age, setAge] = useState('');
  const [selectedGender, setSelectedGender] = useState([]);
  const [selectedLifeCycle, setSelectedLifeCycle] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState([]);

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

  useEffect(() => {
    const province = selectedRegion1[0];
    if (!province) {
      setRegion2Options([]);
      setSelectedRegion2([]);
      return;
    }
    const cities = regionMap[province] || [];
    setRegion2Options(cities);
    setSelectedRegion2([]);
  }, [selectedRegion1]);

  const genderOptions = ['남성', '여성'];
  const lifeCycleOptions = ['임신 및 출산', '영유아', '아동', '청소년', '청년', '중장년', '노년'];
  const householdOptions = ['저소득', '장애인', '한부모 및 조손', '다자녀', '다문화', '탈북민', '보훈대상자', '해당사항 없음'];
  const interestOptions = [
    '신체건강','정신건강','생활지원','주거','일자리','문화·여가','안전·위기','임신·출산','보육','교육','입양·위탁','보호·돌봄','서민금융','법률','에너지','해당사항 없음'
  ];

  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 150)) {
      setAge(value);
    }
  };

  const incrementAge = () => {
    const current = age === '' ? 0 : parseInt(age);
    if (current < 150) {
      setAge(String(current + 1));
    }
  };

  const decrementAge = () => {
    const current = age === '' ? 0 : parseInt(age);
    if (current > 0) {
      setAge(String(current - 1));
    }
  };

  const calculateProgress = () => {
    const requiredFields = [
      selectedRegion1.length > 0 && selectedRegion2.length > 0,
      age !== '',
      selectedGender.length > 0,
      selectedLifeCycle.length > 0
    ];
    
    const completedRequired = requiredFields.filter(Boolean).length;
    return Math.round((completedRequired / 4) * 100);
  };

  const progress = calculateProgress();

  const isRegionCompleted = selectedRegion1.length > 0 && selectedRegion2.length > 0;
  const isAgeCompleted = age !== '';
  const isGenderCompleted = selectedGender.length > 0;
  const isLifeCycleCompleted = selectedLifeCycle.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isRegionCompleted) {
      alert('지역을 선택해주세요.');
      if (region1Ref.current) region1Ref.current.focus();
      return;
    }
    if (!isAgeCompleted) {
      alert('나이를 입력해주세요.');
      if (ageRef.current) ageRef.current.focus();
      return;
    }
    if (!isGenderCompleted) {
      alert('성별을 선택해주세요.');
      if (genderRef.current) genderRef.current.focus();
      return;
    }
    if (!isLifeCycleCompleted) {
      alert('생애주기를 선택해주세요.');
      if (lifeCycleRef.current) lifeCycleRef.current.focus();
      return;
    }
    
    const userSettings = {
      region1: selectedRegion1[0] || '',
      region2: selectedRegion2[0] || '',
      age: age,
      gender: selectedGender[0] || '',
      lifeCycle: selectedLifeCycle.join(', '),
      household: selectedHousehold.join(', '),
      interest: selectedInterest.join(', ')
    };
    
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    
    navigate('/signup-complete?loggedIn=true');
  };

  return (
    <SettingsContainer>
      <PageTitleContainer>
        <h2>개인 맞춤형 복지 혜택 서비스</h2>
        <p>정확한 혜택 추천을 위해 기본 정보가 필요합니다.</p>
        <p>입력하신 정보는 개인정보보호법에 따라 안전하게 관리됩니다.</p>
      </PageTitleContainer>

      <SettingsMain>
        <SettingsBox onSubmit={handleSubmit}>

          <ProgressContainer>
            <ProgressTitle>
              {progress === 0 ? '정보 입력 시작하기' : 
               progress < 50 ? '기본 정보 입력 중' :
               progress < 100 ? '거의 완료되었습니다' : 
               '모든 정보 입력 완료'}
            </ProgressTitle>
            <ProgressBar>
              <ProgressFill style={{ width: `${progress}%` }} />
            </ProgressBar>
            <ProgressText>
              {progress === 0 ? '정확한 혜택 추천을 위해 기본 정보를 입력해주세요' :
               progress < 100 ? `진행률 ${progress}% - 필수 정보 입력 중` : 
               '모든 필수 정보 입력이 완료되었습니다'}
            </ProgressText>
          </ProgressContainer>

          {/* 거주 지역 */}
          <RequiredFormGroup>
            <Label>거주 지역</Label>
            <FormRow>
              <FormCol>
                <SimpleDropdown 
                  options={region1Options} 
                  selectedItems={selectedRegion1} 
                  onSelectionChange={setSelectedRegion1}
                  placeholder="시/도 선택" 
                  isSingleSelect={true}
                  nextFieldRef={region2Ref}
                />
              </FormCol>
              <FormCol>
                <SimpleDropdown 
                  options={region2Options} 
                  selectedItems={selectedRegion2} 
                  onSelectionChange={setSelectedRegion2} 
                  placeholder="시/군/구 선택" 
                  isSingleSelect={true}
                  nextFieldRef={ageRef}
                />
              </FormCol>
            </FormRow>
          </RequiredFormGroup>

          {/* 나이와 성별 */}
          <RequiredFormGroup>
            <FormRow>
              <FormCol>
                <Label>나이</Label>
                <AgeInputContainer>
                  <StyledInput 
                    ref={ageRef}
                    type="text" 
                    placeholder="나이 입력" 
                    value={age} 
                    onChange={handleAgeChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (genderRef.current) genderRef.current.focus();
                      }
                    }}
                    style={{ paddingRight: '40px' }}
                    tabIndex={0}
                  />
                  <AgeSpinGroup>
                    <AgeSpinButton type="button" onClick={incrementAge} tabIndex={-1}>▲</AgeSpinButton>
                    <AgeSpinButton type="button" onClick={decrementAge} tabIndex={-1}>▼</AgeSpinButton>
                  </AgeSpinGroup>
                </AgeInputContainer>
              </FormCol>
              <FormCol>
                <Label>성별</Label>
                <SimpleDropdown 
                  options={genderOptions} 
                  selectedItems={selectedGender} 
                  onSelectionChange={setSelectedGender} 
                  placeholder="성별 선택" 
                  isSingleSelect={true}
                  nextFieldRef={lifeCycleRef}
                />
              </FormCol>
            </FormRow>
          </RequiredFormGroup>

          {/* 생애주기 */}
          <RequiredFormGroup>
            <Label>생애주기</Label>
            <SimpleDropdown 
              options={lifeCycleOptions} 
              selectedItems={selectedLifeCycle} 
              onSelectionChange={setSelectedLifeCycle} 
              placeholder="생애주기 선택"
              nextFieldRef={householdRef}
            />
          </RequiredFormGroup>

          {/* 가구상황 */}
          <OptionalFormGroup>
            <Label>가구상황 (선택사항)</Label>
            <SimpleDropdown 
              options={householdOptions} 
              selectedItems={selectedHousehold} 
              onSelectionChange={setSelectedHousehold} 
              placeholder="가구상황 선택"
              nextFieldRef={interestRef}
            />
          </OptionalFormGroup>

          {/* 관심주제 */}
          <OptionalFormGroup>
            <Label>관심주제 (선택사항)</Label>
            <SimpleDropdown 
              options={interestOptions} 
              selectedItems={selectedInterest} 
              onSelectionChange={setSelectedInterest} 
              placeholder="관심주제 선택"
              nextFieldRef={submitRef}
            />
          </OptionalFormGroup>

          <ButtonContainer>
            <SubmitButton ref={submitRef} type="submit" tabIndex={0}>
              설정 완료하기
            </SubmitButton>
          </ButtonContainer>
        </SettingsBox>
      </SettingsMain>
    </SettingsContainer>
  );
}

export default SettingsPage;