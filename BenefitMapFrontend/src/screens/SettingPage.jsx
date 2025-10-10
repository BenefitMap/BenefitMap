// 리액트 훅 import: useState(상태관리), useEffect(컴포넌트 생명주기관리), useRef(DOM 요소 직접 접근)
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// CSS-in-JS 라이브러리 'styled-components' import
import styled from 'styled-components';
import UserInfo from '../components/UserInfo';
import { isLoggedIn } from '../utils/googleAuth';

// --- 스타일 컴포넌트 정의 ---
// 각 HTML 태그에 스타일을 직접 적용한 리액트 컴포넌트를 생성합니다.

// 페이지 전체 레이아웃
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 130px - 317px); /* 전체 높이에서 Header(130px)와 Footer(317px) 높이 제외 */
  align-items: center;
  padding: 80px 20px;
`;


// 페이지 제목과 부제목을 감싸는 컨테이너
const PageTitleContainer = styled.div`
  text-align: center;
  margin-bottom: 30px;
  h2 { font-size: 2rem; font-weight: 600; margin-bottom: 12px; }
  p { color: #555; font-size: 1rem; }
`;

// 메인 콘텐츠 영역
const SettingsMain = styled.main`
  width: 100%;
  display: flex;
  justify-content: center;
`;

// 초록색 배경의 폼 박스
const SettingsBox = styled.form`
  background-color: #91D0A6;
  border-radius: 20px;
  padding: 40px 50px;
  width: 100%;
  max-width: 650px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);

  // 폼 박스 내의 모든 label에 대한 공통 스타일
  & > .form-group > label, & > label {
    display: block;
    margin-bottom: 14px; /* 라벨과 입력 박스 간격을 넉넉하게 */
    font-weight: 700; /* 라벨 굵게 */
    font-size: 0.9rem;
    color: #444;
  }
`;

// 폼 내의 각 입력 필드를 그룹화 (레이블 + 입력창)
const FormGroup = styled.div`
    margin-bottom: 28px; /* 그룹 간 간격 소폭 확대 */
`;

// 입력창들을 가로로 나란히 배치하기 위한 행
const FormRow = styled.div`
  display: flex;
  gap: 12px;
`;

// FormRow 내에서 각 항목이 동일한 너비를 갖도록 하는 열
const FormCol = styled.div`
  flex: 1;
`;

// '나이' 입력창과 같은 텍스트 input 스타일
const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border-radius: 8px;
  border: none;
  background-color: #ffffff;
  font-size: 1rem;
  color: #333;
  font-weight: 700; /* 입력값을 굵게 표시 */
  &::placeholder {
    color: #999;
    font-weight: 400; /* 플레이스홀더는 일반 두께로 */
  }
`;

// 나이 입력 컨테이너: 우측에 ▲ ▼ 컨트롤 배치
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
  height: 18px;
  border: none;
  background: #e9f6ee;
  color: #2f8a57;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  &:hover { background: #d8f0e4; }
`;

// 커스텀 드롭다운 관련 스타일 컴포넌트들
const CustomSelectContainer = styled.div`
  position: relative;
`;

const CustomSelectDisplay = styled.div`
  width: 100%; padding: 14px 16px; border-radius: 8px; border: none; background-color: #ffffff; font-size: 1rem; color: #999; cursor: pointer; display: flex; align-items: center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2523555' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  strong {
    color: #333;
    font-weight: bold;
  }
`;

const CustomSelectOptions = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 8px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 20; // 다른 입력창들 위로 올라오도록 z-index 설정
`;

const CheckboxLabel = styled.label`
  display: flex; align-items: center; padding: 12px; cursor: pointer; border-radius: 6px; transition: background-color 0.2s; color: #333;
  &:hover {
    background-color: #f0f0f0;
  }
  input {
    margin-right: 12px;
    width: 16px;
    height: 16px;
    accent-color: #6DBE89; /* 선택된 체크박스를 초록색으로 표시 */
  }
`;

const ButtonContainer = styled.div`
  text-align: center; margin-top: 30px;
`;

const SubmitButton = styled.button`
  padding: 14px 60px; border-radius: 8px; border: none; background-color: #f0f0f0; color: #555; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s, color 0.2s;
  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;


/**
 * @description 모든 드롭다운 UI를 처리하는 재사용 가능한 커스텀 컴포넌트.
 * @param {string[]} options - 드롭다운에 표시될 옵션 목록 배열.
 * @param {string[]} selectedItems - 현재 선택된 항목들의 배열.
 * @param {function} onSelectionChange - 옵션 선택 시 상태를 업데이트하는 함수.
 * @param {string} placeholder - 선택된 항목이 없을 때 표시될 텍스트.
 * @param {boolean} isSingleSelect - true일 경우 단일 선택(라디오 버튼)으로 동작.
 */
function CustomCheckboxDropdown({ options, selectedItems, onSelectionChange, placeholder, isSingleSelect = false }) {
    // 드롭다운 메뉴의 열림/닫힘 상태를 관리하는 state
    const [isOpen, setIsOpen] = useState(false);
    // 드롭다운 DOM 요소에 접근하기 위한 ref
    const dropdownRef = useRef(null);

    // 외부 클릭 감지 로직: 드롭다운이 열려있을 때 바깥을 클릭하면 닫히도록 함
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 체크박스/라디오 버튼 선택 시 호출되는 함수
    const handleSelection = (option) => {
        let newSelection;
        // 단일 선택 모드일 경우
        if (isSingleSelect) {
            newSelection = [option];
            setIsOpen(false); // 선택 후 바로 닫기
        } 
        // 다중 선택 모드일 경우
        else {
            newSelection = selectedItems.includes(option)
                ? selectedItems.filter(item => item !== option) // 이미 있으면 제거
                : [...selectedItems, option]; // 없으면 추가
        }
        onSelectionChange(newSelection);
    };

    return (
        <CustomSelectContainer ref={dropdownRef}>
            <CustomSelectDisplay onClick={() => setIsOpen(!isOpen)}>
                {selectedItems.length > 0 ? <strong>{selectedItems.join(', ')}</strong> : <span>{placeholder}</span>}
            </CustomSelectDisplay>
            {isOpen && (
                <CustomSelectOptions>
                    {options.map(option => (
                        <CheckboxLabel key={option}>
                            <input 
                                type={isSingleSelect ? "radio" : "checkbox"} 
                                name={placeholder} // 라디오 버튼 그룹화를 위해 name 속성 사용
                                checked={selectedItems.includes(option)} 
                                onChange={() => handleSelection(option)} 
                            />
                            {option}
                        </CheckboxLabel>
                    ))}
                </CustomSelectOptions>
            )}
        </CustomSelectContainer>
    );
}


// --- 메인 설정 페이지 리액트 컴포넌트 ---
function SettingsPage() {
    const navigate = useNavigate();
    
    // 로그인 상태 확인 (더 관대한 조건)
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const userInfo = localStorage.getItem('user_info');
        
        // 토큰이나 사용자 정보가 없을 때만 로그인 페이지로 리다이렉트
        if (!accessToken && !userInfo) {
            navigate('/LoginPage');
        }
    }, [navigate]);
    // --- 상태 관리(useState) ---
    // 각 폼 필드의 선택된 값을 저장하기 위한 상태 변수들
    const [selectedRegion1, setSelectedRegion1] = useState([]);
    const [selectedRegion2, setSelectedRegion2] = useState([]);
    const [region2Options, setRegion2Options] = useState([]);
    const [age, setAge] = useState('');
    const [selectedGender, setSelectedGender] = useState([]);
    const [selectedLifeCycle, setSelectedLifeCycle] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState([]);
    const [selectedInterest, setSelectedInterest] = useState([]);

    // --- 옵션 데이터 ---
    // 각 드롭다운에 표시될 목록 데이터
    const region1Options = [
        '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
        '경기도', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
    ];

    // 시/군/구 매핑 데이터
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

    // 시/군/구 옵션 갱신: 시/도 변경 시 시/군/구 초기화
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
        '신체건강','정신건강','생활지원','주거','일자리','문화·여가','안전·위기','임신·출산','보육','교육','입양·위탁','보호·돌봄','서민금융','법률','에너지'
    ];

    // 나이 증감 핸들러
    const parseAge = (v) => {
        const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(n) ? n : 0;
    };
    const clampAge = (n) => Math.max(0, Math.min(150, n));
    const incrementAge = () => setAge(prev => String(clampAge(parseAge(prev) + 1)));
    const decrementAge = () => setAge(prev => String(clampAge(parseAge(prev) - 1)));

    const handleSubmit = (e) => {
        e.preventDefault();
        const hasRegion = selectedRegion1.length > 0 && selectedRegion2.length > 0;
        const hasAge = String(age).trim() !== '';
        const hasGender = selectedGender.length > 0;
        const hasLifeCycle = selectedLifeCycle.length > 0;
        if (!(hasRegion && hasAge && hasGender && hasLifeCycle)) {
            alert('필수 항목을 모두 입력해 주세요. (지역, 나이, 성별, 생애주기)');
            return;
        }
        
        // 설정값을 localStorage에 저장
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
        
        // 설정 완료 메시지 표시
        alert('혜택 설정이 완료되었습니다! 마이페이지에서 확인해보세요.');
        
        // 혜택 설정 완료 후 마이페이지로 이동
        navigate('/mypage');
    };

  return (
    <SettingsContainer>

      <PageTitleContainer>
        <h2>혜택 맞춤 설정</h2>
        <p>간단한 정보를 입력하면 나에게 꼭 맞는 혜택을 확인할 수 있습니다.</p>
      </PageTitleContainer>

      <SettingsMain>
        <SettingsBox onSubmit={handleSubmit}>
          <UserInfo />
          <FormGroup>
            <label>지역(필수)</label>
            <FormRow>
              <FormCol>
                {/* 재사용 컴포넌트에 props를 전달하여 '시/도 선택' 드롭다운 렌더링 */}
                <CustomCheckboxDropdown options={region1Options} selectedItems={selectedRegion1} onSelectionChange={setSelectedRegion1} placeholder="시/도 선택" isSingleSelect={true} />
              </FormCol>
              <FormCol>
                <CustomCheckboxDropdown options={region2Options} selectedItems={selectedRegion2} onSelectionChange={setSelectedRegion2} placeholder="시/군/구 선택" isSingleSelect={true} />
              </FormCol>
            </FormRow>
          </FormGroup>
          
          <FormGroup>
            <FormRow>
              <FormCol>
                <label>나이(필수)</label>
                <AgeInputContainer>
                  <StyledInput type="text" placeholder="나이를 입력하세요" value={age} onChange={(e) => setAge(e.target.value)} style={{ paddingRight: '50px' }} />
                  <AgeSpinGroup>
                    <AgeSpinButton type="button" onClick={incrementAge}>▲</AgeSpinButton>
                    <AgeSpinButton type="button" onClick={decrementAge}>▼</AgeSpinButton>
                  </AgeSpinGroup>
                </AgeInputContainer>
              </FormCol>
              <FormCol>
                <label>성별(필수)</label>
                {/* isSingleSelect prop을 true로 주어 단일 선택으로 동작하도록 함 */}
                <CustomCheckboxDropdown options={genderOptions} selectedItems={selectedGender} onSelectionChange={setSelectedGender} placeholder="성별을 선택하세요" isSingleSelect={true} />
              </FormCol>
            </FormRow>
          </FormGroup>

          <FormGroup>
            <label>생애주기(필수)</label>
            <CustomCheckboxDropdown options={lifeCycleOptions} selectedItems={selectedLifeCycle} onSelectionChange={setSelectedLifeCycle} placeholder="생애주기를 선택하세요" />
          </FormGroup>

          <FormGroup>
            <label>가구상황(선택)</label>
            <CustomCheckboxDropdown options={householdOptions} selectedItems={selectedHousehold} onSelectionChange={setSelectedHousehold} placeholder="가구상황을 선택하세요" />
          </FormGroup>

          <FormGroup>
            <label>관심주제(선택)</label>
            <CustomCheckboxDropdown options={interestOptions} selectedItems={selectedInterest} onSelectionChange={setSelectedInterest} placeholder="관심주제를 선택하세요" />
          </FormGroup>

          <ButtonContainer>
            <SubmitButton type="submit">확인</SubmitButton>
          </ButtonContainer>
        </SettingsBox>
      </SettingsMain>
      
      
    </SettingsContainer>
  );
}

export default SettingsPage;