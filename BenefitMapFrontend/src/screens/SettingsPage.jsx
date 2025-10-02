// 리액트 훅 import: useState(상태관리), useEffect(컴포넌트 생명주기관리), useRef(DOM 요소 직접 접근)
import { useState, useEffect, useRef } from 'react';
// CSS-in-JS 라이브러리 'styled-components' import
import styled from 'styled-components';

// --- 스타일 컴포넌트 정의 ---
// 각 HTML 태그에 스타일을 직접 적용한 리액트 컴포넌트를 생성합니다.

// 페이지 전체 레이아웃
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  padding: 80px 20px;
`;

// 공통 헤더
const Header = styled.header`
  position: absolute;
  top: 40px;
  left: 40px;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
`;

// 공통 푸터
const Footer = styled.footer`
  position: absolute;
  bottom: 20px;
  left: 40px;
  font-size: 0.75rem;
  color: #888;
  
  p {
    margin: 4px 0;
  }
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
    margin-bottom: 10px;
    font-weight: 500;
    font-size: 0.9rem;
    color: #444;
  }
`;

// 폼 내의 각 입력 필드를 그룹화 (레이블 + 입력창)
const FormGroup = styled.div`
    margin-bottom: 24px;
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
  &::placeholder {
    color: #999;
  }
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
    // --- 상태 관리(useState) ---
    // 각 폼 필드의 선택된 값을 저장하기 위한 상태 변수들
    const [selectedRegion1, setSelectedRegion1] = useState([]);
    const [selectedRegion2, setSelectedRegion2] = useState([]);
    const [age, setAge] = useState('');
    const [selectedGender, setSelectedGender] = useState([]);
    const [selectedLifeCycle, setSelectedLifeCycle] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState([]);
    const [selectedInterest, setSelectedInterest] = useState([]);

    // --- 옵션 데이터 ---
    // 각 드롭다운에 표시될 목록 데이터
    const region1Options = ['서울특별시', '경기도', '인천광역시', '강원도', '충청북도', '충청남도'];
    const region2Options = ['안양시', '수원시', '용인시', '성남시', '고양시'];
    const genderOptions = ['남성', '여성'];
    const lifeCycleOptions = ['임신 및 출산', '영유아', '아동', '청소년', '청년', '중장년', '노년'];
    const householdOptions = ['저소득', '장애인', '한부모 및 조손', '다자녀', '다문화', '탈북민', '보훈대상자', '해당사항 없음'];
    const interestOptions = ['주거', '건강', '교육', '금융', '문화'];

  return (
    <SettingsContainer>
      <Header>BENEFIT MAP</Header>

      <PageTitleContainer>
        <h2>혜택 맞춤 설정</h2>
        <p>간단한 정보를 입력하면 나에게 꼭 맞는 혜택을 확인할 수 있습니다.</p>
      </PageTitleContainer>

      <SettingsMain>
        <SettingsBox>
          <FormGroup>
            <label>지역(필수)</label>
            <FormRow>
              <FormCol>
                {/* 재사용 컴포넌트에 props를 전달하여 '시/도 선택' 드롭다운 렌더링 */}
                <CustomCheckboxDropdown options={region1Options} selectedItems={selectedRegion1} onSelectionChange={setSelectedRegion1} placeholder="시/도 선택" />
              </FormCol>
              <FormCol>
                <CustomCheckboxDropdown options={region2Options} selectedItems={selectedRegion2} onSelectionChange={setSelectedRegion2} placeholder="시/군/구 선택" />
              </FormCol>
            </FormRow>
          </FormGroup>
          
          <FormGroup>
            <FormRow>
              <FormCol>
                <label>나이(필수)</label>
                <StyledInput type="text" placeholder="나이를 입력하세요" value={age} onChange={(e) => setAge(e.target.value)} />
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
      
      <Footer>
        <p>주소: 경기도 안양시 동안구 임곡로 29, 대림대학교 전산관</p>
        <p>전화번호: 010-0000-0000</p>
        <p>이메일: GOODDEVELOP@GMAIL.COM</p>
        <p>© 2025 BENEFIT MAP. ALL RIGHTS RESERVED.</p>
      </Footer>
    </SettingsContainer>
  );
}

export default SettingsPage;