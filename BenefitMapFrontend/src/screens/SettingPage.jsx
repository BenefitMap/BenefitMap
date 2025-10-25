// src/screens/SettingPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { saveOnboarding } from '../utils/auth';

// --- 스타일 컴포넌트 정의 ---
const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 130px - 317px);
  align-items: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
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

/* 남겨둔 ProgressSidebar 관련 스타일 */
const SidebarContainer = styled.div`
  position: sticky;
  top: 20px;
  width: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
`;

const ProgressSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  height: 100%;
`;

const ProgressPercentage = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #43a047;
  text-align: center;
  margin-bottom: 10px;
`;

const VerticalProgressBar = styled.div`
  width: 8px;
  height: 500px;
  position: relative;
  margin: 0 auto;
`;

const VerticalProgressFill = styled.div`
  width: 100%;
  background-color: #43a047;
  border-radius: 4px;
  transition: height 0.3s ease;
  position: absolute;
  top: 0;
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

const SearchInput = styled.input`
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

  &::placeholder {
    color: #adb5bd;
  }

  &::after {
    content: '▼';
    color: #43a047;
    font-size: 10px;
    transition: transform 0.2s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  color: #2c3e50;
  background-color: ${props => props.$isSelected ? '#e8f5e9' : 'transparent'};
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.$disabled ? 0.4 : 1};         /* ★ disable 시 흐리게 */
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'}; /* 클릭 막기 */

  &:hover {
    background-color: ${props =>
        props.$isSelected ? '#d4edda' : props.$disabled ? 'transparent' : '#f8f9fa'};
  }
`;

const SelectedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  width: 100%;
`;

const SelectedTag = styled.div`
  background-color: #43a047;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 120px;
`;

const TagText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ClearAllButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 3px;

  &:hover {
    background-color: #f8d7da;
  }
`;

const HelpTooltip = styled.span`
  position: relative;
  display: inline-block;
  margin-left: 8px;
  cursor: help;
  color: #6c757d;
  font-size: 0.9rem;

  &:hover::after {
    content: "${props => props.$tooltip}";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: normal;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    min-width: 200px;
    text-align: center;
  }

  &:hover::before {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(100%);
    border: 5px solid transparent;
    border-top-color: #333;
    z-index: 1000;
  }
`;

const CheckboxContainer = styled.div`
  width: 100%;
`;

const SelectedItemsSummary = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const SummaryTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
`;

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: #ffffff;
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  opacity: ${props => props.$disabled ? 0.4 : 1};          /* ★ 체크박스에서도 흐리게 */
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
`;

const CheckboxInput = styled.input`
  display: none;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
  padding: 4px 0;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const CustomCheckbox = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.$isChecked ? '#43a047' : '#dee2e6'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isChecked ? '#43a047' : 'transparent'};
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  transition: all 0.2s ease;
`;

const CheckboxText = styled.span`
  font-size: 0.9rem;
  color: #2c3e50;
  flex: 1;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
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

/* ---------------------------
   하위 컴포넌트들
----------------------------*/

/**
 * SimpleDropdown
 * - isSingleSelect=true  → 드롭다운 (지역, 성별 등)
 * - isSingleSelect=false → 체크박스 UI (생애주기, 가구상황, 관심주제)
 *
 * fieldName:
 *   - "lifeCycle": 생애주기
 *   - "household": 가구상황 ("해당사항 없음" 특수 로직 O)
 *   - "interest": 관심주제 (이제 제한 없음) ★ 수정
 */
function SimpleDropdown({
                          options,
                          selectedItems,
                          onSelectionChange,
                          placeholder,
                          isSingleSelect = false,
                          nextFieldRef,
                          fieldName = ''
                        }) {
  // 가구상황 전용 상태 로직을 계산해둘게
  const hasNoneSelected =
      fieldName === 'household' && selectedItems.includes('해당사항 없음');
  const hasOtherSelected =
      fieldName === 'household' &&
      selectedItems.some(item => item !== '해당사항 없음');

  const handleOptionChange = (option) => {
    if (isSingleSelect) {
      // 단일 선택 모드 (지역, 성별 등)
      onSelectionChange([option]);
      setTimeout(() => {
        if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
          nextFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
      return;
    }

    // 멀티 선택 모드 (생애주기, 가구상황, 관심주제)
    let newSelection = [...selectedItems];

    if (fieldName === 'household') {
      // ★ 가구상황 전용 처리

      if (option === '해당사항 없음') {
        // "해당사항 없음" 클릭
        if (hasNoneSelected) {
          // 이미 선택돼 있으면 해제
          newSelection = [];
        } else {
          // 단독으로만 활성화
          newSelection = ['해당사항 없음'];
        }
      } else {
        // 다른 옵션 클릭
        if (hasNoneSelected) {
          // 이미 "해당사항 없음"만 선택된 상태라면, 먼저 그걸 빼고 현재 옵션만 선택
          newSelection = [option];
        } else {
          // 토글
          if (newSelection.includes(option)) {
            newSelection = newSelection.filter(item => item !== option);
          } else {
            newSelection = [...newSelection, option];
          }
        }
      }

      onSelectionChange(newSelection);
      return;
    }

    // 생애주기 / 관심주제
    // ★ 관심주제: 이제 최대 3개 제한 없음
    if (newSelection.includes(option)) {
      // 이미 선택된 경우 -> 제거
      newSelection = newSelection.filter(item => item !== option);
    } else {
      // 새로 추가
      newSelection = [...newSelection, option];
    }

    onSelectionChange(newSelection);
  };

  const removeSelectedItem = (itemToRemove) => {
    const newSelection = selectedItems.filter(item => item !== itemToRemove);
    onSelectionChange(newSelection);
  };

  // 단일 선택 모드일 때는 검색형/드롭다운 UI 사용
  if (isSingleSelect) {
    return (
        <SearchableDropdown
            options={options}
            selectedItems={selectedItems}
            onSelectionChange={onSelectionChange}
            placeholder={placeholder}
            nextFieldRef={nextFieldRef}
        />
    );
  }

  // 멀티 선택 모드 → 체크박스 UI
  return (
      <CheckboxContainer>
        {selectedItems.length > 0 && (
            <SelectedItemsSummary>
              <SummaryTitle>
                {fieldName === 'household'
                    ? '가구상황'
                    : fieldName === 'lifeCycle'
                        ? '생애주기'
                        : fieldName === 'interest'
                            ? '관심주제'
                            : '선택된 항목'}{' '}
                선택됨 ({selectedItems.length}개)
              </SummaryTitle>

              <SelectedItemsContainer>
                {selectedItems.map((item, index) => (
                    <SelectedTag key={index}>
                      <TagText>{item}</TagText>
                      <RemoveButton
                          type="button"
                          onClick={() => removeSelectedItem(item)}
                          title="제거"
                      >
                        ×
                      </RemoveButton>
                    </SelectedTag>
                ))}
              </SelectedItemsContainer>

              <ClearAllButton
                  type="button"
                  onClick={() => onSelectionChange([])}
              >
                모두 지우기
              </ClearAllButton>
            </SelectedItemsSummary>
        )}

        {/* 체크박스 목록 */}
        <CheckboxList>
          {options.map(option => {
            // household 전용 disabled 규칙
            const isNone = option === '해당사항 없음';
            const disabledForThisOption =
                fieldName === 'household'
                    ? (isNone && hasOtherSelected) || (!isNone && hasNoneSelected)
                    : false;

            const checked = selectedItems.includes(option);

            return (
                <CheckboxItem
                    key={option}
                    $disabled={disabledForThisOption}
                >
                  <CheckboxInput
                      type="checkbox"
                      id={`checkbox-${fieldName}-${option}`}
                      checked={checked}
                      onChange={() => {
                        if (!disabledForThisOption) {
                          handleOptionChange(option);
                        }
                      }}
                  />
                  <CheckboxLabel htmlFor={`checkbox-${fieldName}-${option}`}>
                    <CustomCheckbox $isChecked={checked}>
                      {checked && '✓'}
                    </CustomCheckbox>
                    <CheckboxText>{option}</CheckboxText>
                  </CheckboxLabel>
                </CheckboxItem>
            );
          })}
        </CheckboxList>
      </CheckboxContainer>
  );
}

function SearchableDropdown({
                              options,
                              selectedItems,
                              onSelectionChange,
                              placeholder,
                              nextFieldRef
                            }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option =>
      option.toLowerCase().includes((searchTerm || inputValue).toLowerCase())
  );

  useEffect(() => {
    if (selectedItems.length > 0) {
      setInputValue(selectedItems[0]);
    } else {
      setInputValue('');
    }
  }, [selectedItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);

        if (selectedItems.length > 0) {
          setInputValue(selectedItems[0]);
        } else {
          setInputValue('');
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedItems]);

  const handleOptionClick = (option) => {
    onSelectionChange([option]);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
    setInputValue(option);
    setTimeout(() => {
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
        nextFieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 50);

    if (value && !isOpen) {
      setIsOpen(true);
    }

    const exactMatch = options.find(option => option === value);
    if (exactMatch) {
      onSelectionChange([exactMatch]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      setTimeout(() => {
        if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
          nextFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setSearchTerm('');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setSearchTerm('');
      } else if (e.key === 'Tab') {
        if (nextFieldRef && nextFieldRef.current) {
          e.preventDefault();
          nextFieldRef.current.focus();
          nextFieldRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        if (selectedItems.length > 0) {
          setInputValue(selectedItems[0]);
        } else {
          setInputValue('');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1) {
          handleOptionClick(filteredOptions[0]);
        }
        break;
      case 'Tab':
        if (filteredOptions.length === 1) {
          e.preventDefault();
          handleOptionClick(filteredOptions[0]);
        }
        break;
      default:
        break;
    }
  };

  return (
      <DropdownContainer ref={dropdownRef}>
        <SearchInput
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={() => setIsOpen(true)}
            $hasValue={inputValue.length > 0}
            $isOpen={isOpen}
        />

        {isOpen && (
            <DropdownMenu>
              <div
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
              >
                <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                        <DropdownItem
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            $isSelected={selectedItems.includes(option)}
                        >
                          {option}
                        </DropdownItem>
                    ))
                ) : (
                    <DropdownItem style={{ color: '#999', cursor: 'default' }}>
                      검색 결과가 없습니다
                    </DropdownItem>
                )}
              </div>
            </DropdownMenu>
        )}
      </DropdownContainer>
  );
}

// SingleSelectDropdown 남겨둔 상태 (지금은 안 씀)
function SingleSelectDropdown({
                                options,
                                selectedItems,
                                onSelectionChange,
                                placeholder,
                                nextFieldRef
                              }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option) => {
    onSelectionChange([option]);
    setIsOpen(false);
    setTimeout(() => {
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
        nextFieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
      <DropdownContainer ref={dropdownRef}>
        <DropdownButton
            onClick={toggleDropdown}
            $hasValue={selectedItems.length > 0}
            $isOpen={isOpen}
            type="button"
            tabIndex={0}
        >
          {selectedItems.length > 0 ? selectedItems[0] : placeholder}
        </DropdownButton>

        {isOpen && (
            <DropdownMenu>
              <div
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
              >
                <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
                {options.map(option => (
                    <DropdownItem
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        $isSelected={selectedItems.includes(option)}
                    >
                      {option}
                    </DropdownItem>
                ))}
              </div>
            </DropdownMenu>
        )}
      </DropdownContainer>
  );
}

/* ---------------------------
   메인 SettingsPage 컴포넌트
----------------------------*/

function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const region1Ref = useRef(null);
  const region2Ref = useRef(null);
  const ageRef = useRef(null);
  const genderRef = useRef(null);
  const lifeCycleRef = useRef(null);
  const householdRef = useRef(null);
  const interestRef = useRef(null);
  const submitRef = useRef(null);

  // 신규 유저(쿠키만 있고 localStorage는 아직 없음)는 그냥 통과
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('user_info');

    if (accessToken || userInfo) {
      return;
    }

    if (location.state && location.state.from === 'oauth') {
      return;
    }

    navigate('/LoginPage', { replace: true });
  }, [navigate, location]);

  // 상태값들
  const [selectedRegion1, setSelectedRegion1] = useState([]);
  const [selectedRegion2, setSelectedRegion2] = useState([]);
  const [region2Options, setRegion2Options] = useState([]);

  const [age, setAge] = useState('');
  const [selectedGender, setSelectedGender] = useState([]);

  const [selectedLifeCycle, setSelectedLifeCycle] = useState([]); // 복수 선택
  const [selectedHousehold, setSelectedHousehold] = useState([]); // 복수 선택
  const [selectedInterest, setSelectedInterest] = useState([]);   // 복수 선택

  const [loading, setLoading] = useState(true);
  const [ageError, setAgeError] = useState(null);

  // 지역1 → 지역2 연결
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

  const genderOptions = ['남성', '여성'];

  // 지역1 바뀌면 지역2 갱신
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

  // 옵션 (생애주기/가구상황/관심주제)
  const [lifeCycleOptions, setLifeCycleOptions] = useState([]);
  const [householdOptions, setHouseholdOptions] = useState([]);
  const [interestOptions, setInterestOptions] = useState([]);

  useEffect(() => {
    setLoading(true);

    // 생애주기: '해당사항 없음' 없음  ★ 수정
    setLifeCycleOptions([
      '임신·출산',
      '영유아',
      '아동',
      '청소년',
      '청년',
      '중장년',
      '노년'
    ]);

    // 가구상황: '해당사항 없음' 유지
    setHouseholdOptions([
      '저소득',
      '장애인',
      '한부모·조손',
      '다자녀',
      '다문화·탈북민',
      '보호대상자',
      '해당사항 없음'
    ]);

    // 관심주제: 그대로, 제한은 JS 로직에서 해제됨
    setInterestOptions([
      '신체건강',
      '정신건강',
      '생활지원',
      '주거',
      '일자리',
      '문화·여가',
      '안전·위기',
      '임신·출산',
      '보육',
      '교육',
      '입양·위탁',
      '보호·돌봄',
      '서민금융',
      '법률',
      '에너지'
    ]);

    setLoading(false);
  }, []);

  // draft 저장
  useEffect(() => {
    const autoSaveData = {
      selectedRegion1,
      selectedRegion2,
      age,
      selectedGender,
      selectedLifeCycle,
      selectedHousehold,
      selectedInterest
    };
    localStorage.setItem('onboardingDraft', JSON.stringify(autoSaveData));
  }, [
    selectedRegion1,
    selectedRegion2,
    age,
    selectedGender,
    selectedLifeCycle,
    selectedHousehold,
    selectedInterest
  ]);

  // draft 복원
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.selectedRegion1) setSelectedRegion1(parsed.selectedRegion1);
        if (parsed.selectedRegion2) setSelectedRegion2(parsed.selectedRegion2);
        if (parsed.age) setAge(parsed.age);
        if (parsed.selectedGender) setSelectedGender(parsed.selectedGender);
        if (parsed.selectedLifeCycle) setSelectedLifeCycle(parsed.selectedLifeCycle);
        if (parsed.selectedHousehold) setSelectedHousehold(parsed.selectedHousehold);
        if (parsed.selectedInterest) setSelectedInterest(parsed.selectedInterest);
      } catch (error) {
        console.error('저장된 데이터 복원 실패:', error);
      }
    }
  }, []);

  // 나이 컨트롤
  const handleAgeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numAge = parseInt(value);

    setTimeout(() => {
      if (ageRef.current) {
        ageRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 50);

    if (value === '') {
      setAge('');
      setAgeError(null);
    } else if (numAge >= 0 && numAge <= 150) {
      setAge(value);
      setAgeError(null);
    } else {
      setAge(value);
      if (numAge < 0) {
        setAgeError('나이는 0세 이상이어야 합니다.');
      } else if (numAge > 150) {
        setAgeError('나이는 150세 이하여야 합니다.');
      }
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

  // 진행률 계산
  const calculateProgress = () => {
    const requiredFields = [
      selectedRegion1.length > 0 && selectedRegion2.length > 0,
      age !== '',
      selectedGender.length > 0,
      selectedLifeCycle.length > 0, // 생애주기 필수
      selectedHousehold.length > 0  // 가구상황 필수
    ];

    const completedRequired = requiredFields.filter(Boolean).length;
    return Math.round((completedRequired / 5) * 100);
  };

  const progress = calculateProgress();

  const isRegionCompleted =
      selectedRegion1.length > 0 && selectedRegion2.length > 0;
  const isAgeCompleted = age !== '';
  const isGenderCompleted = selectedGender.length > 0;
  const isLifeCycleCompleted = selectedLifeCycle.length > 0;
  const isHouseholdCompleted = selectedHousehold.length > 0;

  // 제출
  const handleSubmit = async (e) => {
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
      alert('생애주기를 최소 1개 이상 선택해주세요.');
      if (lifeCycleRef.current) lifeCycleRef.current.focus();
      return;
    }
    if (!isHouseholdCompleted) {
      alert('가구상황을 최소 1개 이상 선택해주세요.');
      if (householdRef.current) householdRef.current.focus();
      return;
    }

    try {
      // 서버로 보낼 온보딩 데이터
      const onboardingData = {
        profile: {
          gender: selectedGender[0] === '남성' ? 'MALE' : 'FEMALE',
          age: parseInt(age, 10),
          regionDo: selectedRegion1[0] || '',
          regionSi: selectedRegion2[0] || ''
        },
        lifecycleCodes: selectedLifeCycle.map(name => {
          const codeMap = {
            '임신·출산': 'PREGNANCY_BIRTH',
            '영유아': 'INFANT',
            '아동': 'CHILD',
            '청소년': 'TEEN',
            '청년': 'YOUTH',
            '중장년': 'MIDDLE_AGED',
            '노년': 'SENIOR'
          };
          return codeMap[name] || name.toUpperCase().replace(/\s+/g, '_');
        }),
        householdCodes: selectedHousehold.map(name => {
          const codeMap = {
            '저소득': 'LOW_INCOME',
            '장애인': 'DISABLED',
            '한부모·조손': 'SINGLE_PARENT',
            '다자녀': 'MULTI_CHILDREN',
            '다문화·탈북민': 'MULTICULTURAL_NK',
            '보호대상자': 'PROTECTED',
            '해당사항 없음': 'NONE'
          };
          return codeMap[name] || name.toUpperCase().replace(/\s+/g, '_');
        }),
        interestCodes: selectedInterest.map(name => {
          const codeMap = {
            '신체건강': 'PHYSICAL_HEALTH',
            '정신건강': 'MENTAL_HEALTH',
            '생활지원': 'LIVING_SUPPORT',
            '주거': 'HOUSING',
            '일자리': 'JOBS',
            '문화·여가': 'CULTURE_LEISURE',
            '안전·위기': 'SAFETY_CRISIS',
            '임신·출산': 'PREGNANCY_BIRTH',
            '보육': 'CHILDCARE',
            '교육': 'EDUCATION',
            '입양·위탁': 'ADOPTION_TRUST',
            '보호·돌봄': 'CARE_PROTECT',
            '서민금융': 'MICRO_FINANCE',
            '법률': 'LAW',
            '에너지': 'ENERGY'
          };
          return codeMap[name] || name.toUpperCase().replace(/\s+/g, '_');
        })
      };

      console.log('전송할 온보딩 데이터:', onboardingData);

      await saveOnboarding(onboardingData);

      // localStorage에도 저장
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
      localStorage.setItem('onboardingCompleted', 'true');

      // draft 제거
      localStorage.removeItem('onboardingDraft');

      console.log('온보딩 완료! localStorage에 저장됨:', {
        onboardingCompleted: localStorage.getItem('onboardingCompleted'),
        userSettings: localStorage.getItem('userSettings')
      });

      // 완료 페이지로 이동
      window.location.href = '/signup-complete?loggedIn=true';
    } catch (error) {
      console.error('온보딩 저장 실패:', error);
      alert('설정 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
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
                {loading
                    ? '데이터 로딩 중...'
                    : progress === 0
                        ? '정보 입력 시작하기'
                        : progress < 50
                            ? '기본 정보 입력 중'
                            : progress < 100
                                ? '거의 완료되었습니다'
                                : '모든 정보 입력 완료'}
              </ProgressTitle>

              <ProgressBar>
                <ProgressFill style={{ width: `${progress}%` }} />
              </ProgressBar>

              <ProgressText>
                {loading
                    ? ''
                    : progress === 0
                        ? '정확한 혜택 추천을 위해 기본 정보를 입력해주세요'
                        : progress < 100
                            ? `진행률 ${progress}% - 필수 정보 입력 중`
                            : '모든 필수 정보 입력이 완료되었습니다'}
              </ProgressText>
            </ProgressContainer>

            {/* 거주 지역 */}
            <RequiredFormGroup>
              <Label>
                거주 지역
                <HelpTooltip $tooltip="현재 거주하고 계신 지역을 선택해주세요. 정확한 지역 정보를 통해 해당 지역의 복지 혜택을 추천해드립니다.">
                  ⓘ
                </HelpTooltip>
              </Label>
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

            {/* 나이 / 성별 */}
            <RequiredFormGroup>
              <FormRow>
                <FormCol>
                  <Label>
                    나이
                    <HelpTooltip $tooltip="현재 나이를 입력해주세요. 나이에 따라 받을 수 있는 복지 혜택이 달라집니다.">
                      ⓘ
                    </HelpTooltip>
                  </Label>
                  <AgeInputContainer>
                    <StyledInput
                        ref={ageRef}
                        type="text"
                        placeholder="나이 입력"
                        value={age}
                        onChange={handleAgeChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            e.preventDefault();
                            if (genderRef.current) {
                              genderRef.current.focus();
                              genderRef.current.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                              });
                            }
                          }
                        }}
                        style={{ paddingRight: '40px' }}
                        tabIndex={0}
                    />
                    {ageError && (
                        <ErrorMessage>⚠️ {ageError}</ErrorMessage>
                    )}
                    <AgeSpinGroup>
                      <AgeSpinButton
                          type="button"
                          onClick={incrementAge}
                          tabIndex={-1}
                      >
                        ▲
                      </AgeSpinButton>
                      <AgeSpinButton
                          type="button"
                          onClick={decrementAge}
                          tabIndex={-1}
                      >
                        ▼
                      </AgeSpinButton>
                    </AgeSpinGroup>
                  </AgeInputContainer>
                </FormCol>

                <FormCol>
                  <Label>
                    성별
                    <HelpTooltip $tooltip="성별에 따라 제공되는 복지 혜택이 다를 수 있습니다.">
                      ⓘ
                    </HelpTooltip>
                  </Label>
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

            {/* 생애주기 (필수, 복수선택, '해당사항 없음' 없음) */}
            <RequiredFormGroup ref={lifeCycleRef}>
              <Label>
                생애주기 (복수 선택 가능)
                <HelpTooltip $tooltip="현재 나이 또는 상황에 맞는 생애주기를 선택해주세요. 여러 항목을 동시에 선택할 수 있어요.">
                  ⓘ
                </HelpTooltip>
              </Label>
              <SimpleDropdown
                  options={lifeCycleOptions}
                  selectedItems={selectedLifeCycle}
                  onSelectionChange={setSelectedLifeCycle}
                  placeholder="생애주기 선택"
                  nextFieldRef={householdRef}
                  fieldName="lifeCycle"
              />
            </RequiredFormGroup>

            {/* 가구상황 (필수, 복수선택, '해당사항 없음' 단독 선택 제약) */}
            <RequiredFormGroup ref={householdRef}>
              <Label>
                가구상황 (복수 선택 가능)
                <HelpTooltip $tooltip="가구의 특수한 상황을 선택해주세요. 여러 상황이 해당되면 모두 선택할 수 있어요. '해당사항 없음'을 고르면 다른 항목은 선택할 수 없어요.">
                  ⓘ
                </HelpTooltip>
              </Label>
              <SimpleDropdown
                  options={householdOptions}
                  selectedItems={selectedHousehold}
                  onSelectionChange={setSelectedHousehold}
                  placeholder="가구상황을 선택해주세요 (복수 선택 가능)"
                  nextFieldRef={interestRef}
                  fieldName="household"
              />
            </RequiredFormGroup>

            {/* 관심주제 (선택, 제한 없음) */}
            <OptionalFormGroup ref={interestRef}>
              <Label>
                관심주제 (복수 선택 가능, 선택사항)
                <HelpTooltip $tooltip="관심 있는 복지 분야를 선택해주세요. 선택하지 않아도 됩니다.">
                  ⓘ
                </HelpTooltip>
              </Label>
              <SimpleDropdown
                  options={interestOptions}
                  selectedItems={selectedInterest}
                  onSelectionChange={setSelectedInterest}
                  placeholder="관심주제를 선택해주세요"
                  nextFieldRef={submitRef}
                  fieldName="interest"
              />
            </OptionalFormGroup>

            <ButtonContainer>
              <SubmitButton
                  ref={submitRef}
                  type="submit"
                  tabIndex={0}
              >
                설정 완료하기
              </SubmitButton>
            </ButtonContainer>
          </SettingsBox>
        </SettingsMain>
      </SettingsContainer>
  );
}

export default SettingsPage;
