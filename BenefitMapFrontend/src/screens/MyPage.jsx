import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// ✅ 추가: 전역 auth 상태 비우려고 useAuth 가져옴
import { useAuth } from "../hooks/useAuth";

/* =========================
 * 1) 태그 옵션 목록
 * ========================= */
const LIFECYCLE_OPTIONS = [
    { id: 1, code: "PREGNANCY_BIRTH", label: "임신·출산" },
    { id: 2, code: "INFANT", label: "영유아" },
    { id: 3, code: "CHILD", label: "아동" },
    { id: 4, code: "TEEN", label: "청소년" },
    { id: 5, code: "YOUTH", label: "청년" },
    { id: 6, code: "MIDDLE_AGED", label: "중장년" },
    { id: 7, code: "SENIOR", label: "노년" },
];

const HOUSEHOLD_OPTIONS = [
    { id: 1, code: "LOW_INCOME", label: "저소득" },
    { id: 2, code: "DISABLED", label: "장애인" },
    { id: 3, code: "SINGLE_PARENT", label: "한부모·조손" },
    { id: 4, code: "MULTI_CHILDREN", label: "다자녀" },
    { id: 5, code: "MULTICULTURAL_NK", label: "다문화·탈북민" },
    { id: 6, code: "PROTECTED", label: "보호대상자" },
    { id: 7, code: "NONE", label: "해당사항 없음" },
];

const INTEREST_OPTIONS = [
    { id: 1, code: "PHYSICAL_HEALTH", label: "신체건강" },
    { id: 2, code: "MENTAL_HEALTH", label: "정신건강" },
    { id: 3, code: "LIVING_SUPPORT", label: "생활지원" },
    { id: 4, code: "HOUSING", label: "주거" },
    { id: 5, code: "JOBS", label: "일자리" },
    { id: 6, code: "CULTURE_LEISURE", label: "문화·여가" },
    { id: 7, code: "SAFETY_CRISIS", label: "안전·위기" },
    { id: 8, code: "PREGNANCY_BIRTH", label: "임신·출산" },
    { id: 9, code: "CHILDCARE", label: "보육" },
    { id: 10, code: "EDUCATION", label: "교육" },
    { id: 11, code: "ADOPTION_TRUST", label: "입양·위탁" },
    { id: 12, code: "CARE_PROTECT", label: "보호·돌봄" },
    { id: 13, code: "MICRO_FINANCE", label: "서민금융" },
    { id: 14, code: "LAW", label: "법률" },
    { id: 15, code: "ENERGY", label: "에너지" },
];

/* =========================
 * 2) API 유틸
 * ========================= */

// 마이페이지 조회
async function apiGetMyPage() {
    const res = await fetch("/user/me", {
        method: "GET",
        credentials: "include",
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "조회 실패");
    return json.data;
}

// 마이페이지 수정
async function apiPatchMyPage(patchBody) {
    const res = await fetch("/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patchBody),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "수정 실패");
    return json.data;
}

// 회원탈퇴
async function apiDeleteAccount() {
    // ⚠ 실제 UserController에서 쓰는 URL/메서드에 맞춰 바꿔
    // 예: DELETE /user/me,  /user/delete  등
    const res = await fetch("/user/me", {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error("회원탈퇴 실패");
    }
}

// 로그아웃
async function apiLogout() {
    // ⚠ AuthController에서 쓰는 URL/메서드에 맞춰 바꿔
    // 예: POST /auth/logout  or  GET /auth/logout
    const res = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        console.warn("로그아웃 요청 실패 상태코드:", res.status);
    }
}

/* =========================
 * 3) 스타일
 * ========================= */

const PageBg = styled.div`
    min-height: calc(100vh - 130px - 317px);
    background-color: #f5f6f8;
    display: flex;
    justify-content: center;
    padding: 24px;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #111;
`;

const Card = styled.div`
    width: 100%;
    max-width: 960px;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const ProfileSection = styled.section`
    background: linear-gradient(
            to right,
            rgba(74, 157, 95, 0.08),
            rgba(255, 255, 255, 0)
    );
    padding: 24px 24px 20px 24px;
    display: flex;
    flex-wrap: wrap;
    row-gap: 16px;
    column-gap: 20px;
    align-items: center;
    position: relative;
`;

const Avatar = styled.img`
    width: 72px;
    height: 72px;
    border-radius: 999px;
    object-fit: cover;
    background-color: #d1d5db;
    border: 2px solid #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
`;

const ProfileTextCol = styled.div`
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const ProfileName = styled.div`
    font-size: 1.125rem;
    font-weight: 600;
    color: #111;
    line-height: 1.3;
`;

const ProfileEmail = styled.div`
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.4;
    word-break: break-all;
`;

/* 우상단 수정/저장 버튼 */
const FloatingEditButton = styled.button`
    position: absolute;
    top: 24px;
    right: 24px;

    background-color: #4a9d5f;
    color: #fff;
    border: 0;
    border-radius: 999px;
    padding: 8px 14px;
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.2;

    box-shadow: 0 8px 16px rgba(74, 157, 95, 0.3);
    cursor: pointer;
    transition: all 0.15s ease;

    display: inline-flex;
    align-items: center;
    gap: 6px;

    &:hover {
        filter: brightness(0.95);
        box-shadow: 0 10px 20px rgba(74, 157, 95, 0.4);
    }
`;

const Section = styled.section`
    padding: 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    row-gap: 20px;

    @media (min-width: 768px) {
        padding: 28px 32px;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 4px;
`;

const SectionTitle = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: #111;
`;

const SectionSub = styled.div`
    font-size: 0.8rem;
    font-weight: 400;
    color: #6b7280;
`;

const TwoColGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
        column-gap: 32px;
    }
`;

const FieldBlock = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 8px;
`;

const FieldLabelRow = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
`;

const FieldLabel = styled.label`
    font-size: 0.85rem;
    font-weight: 500;
    color: #374151;
`;

const FieldReadonlyMark = styled.span`
    font-size: 0.7rem;
    color: #9ca3af;
`;

const InputBase = styled.input`
    width: 100%;
    min-width: 0;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    background-color: ${({ $readonly }) => ($readonly ? "#f9fafb" : "#fff")};
    font-size: 0.9rem;
    line-height: 1.4;
    color: #111;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

    &:focus {
        outline: 2px solid rgba(74, 157, 95, 0.4);
        outline-offset: 0;
        border-color: #4a9d5f;
    }

    &:disabled {
        color: #111;
        opacity: 1;
        cursor: default;
    }
`;

const AgeWrapper = styled.div`
    position: relative;
`;

const AgeSpinner = styled.div`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const AgeSpinBtn = styled.button`
    width: 20px;
    height: 14px;
    border-radius: 4px;
    background: #e5e7eb;
    border: 1px solid #cbd5e1;
    font-size: 10px;
    line-height: 1;
    color: #374151;
    cursor: pointer;

    &:hover {
        background: #d1d5db;
    }
`;

const SelectBase = styled.select`
    width: 100%;
    min-width: 0;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    background-color: ${({ disabled }) => (disabled ? "#f9fafb" : "#fff")};
    font-size: 0.9rem;
    line-height: 1.4;
    color: #111;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

    &:focus {
        outline: 2px solid rgba(74, 157, 95, 0.4);
        outline-offset: 0;
        border-color: #4a9d5f;
    }
`;

const TagGroup = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 8px;
`;

const TagGroupTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 500;
    color: #374151;
`;

const TagChipsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;

const TagChip = styled.span`
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background-color: rgba(74, 157, 95, 0.08);
    border: 1px solid rgba(74, 157, 95, 0.28);
    color: #2e463a;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.2;
    padding: 6px 10px;
    box-shadow: 0 2px 4px rgba(74, 157, 95, 0.15);
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
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 0.8rem;
        line-height: 1.2;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    input[type="checkbox"] {
        cursor: pointer;
    }
`;

/* 하단 버튼 행: 왼쪽(탈퇴) ↔ 오른쪽(수정/저장) */
const BottomRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
`;

/* 왼쪽 하단 회원탈퇴 버튼 */
const DeleteAccountButton = styled.button`
    background-color: #fff;
    color: #dc2626;
    border: 1px solid #dc2626;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 10px 16px;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(220, 38, 38, 0.15);
    line-height: 1.2;

    &:hover {
        background-color: #dc2626;
        color: #fff;
        box-shadow: 0 10px 20px rgba(220, 38, 38, 0.3);
    }
`;

/* 오른쪽 하단 수정/저장 버튼 */
const SaveButton = styled.button`
    background-color: #4a9d5f;
    color: #fff;
    border: 0;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 10px 16px;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(74, 157, 95, 0.3);

    &:hover {
        filter: brightness(0.95);
        box-shadow: 0 10px 20px rgba(74, 157, 95, 0.4);
    }
`;

const LoadingText = styled.div`
    padding: 60px 0;
    text-align: center;
    color: #6b7280;
    font-size: 0.9rem;
    font-style: italic;
`;

/* =========================
 * 4) 정렬 관련 헬퍼
 * ========================= */
function sortKorean(arr) {
    return [...arr].sort((a, b) => a.localeCompare(b, "ko"));
}

function sortRegionMap(mapObj) {
    const sortedDoList = Object.keys(mapObj).sort((a, b) =>
        a.localeCompare(b, "ko")
    );
    const newMap = {};
    for (const regionDo of sortedDoList) {
        newMap[regionDo] = sortKorean(mapObj[regionDo] || []);
    }
    return { newMap, sortedDoList };
}

/* =========================
 * 5) 태그 멀티선택 섹션
 * ========================= */
function TagMultiSelectSection({
                                   title,
                                   options,
                                   selectedCodes,
                                   onToggle,
                                   readOnly,
                               }) {
    return (
        <TagGroup>
            <TagGroupTitle>{title}</TagGroupTitle>

            {readOnly ? (
                selectedCodes?.length ? (
                    <TagChipsRow>
                        {selectedCodes.map((code) => {
                            const item = options.find((o) => o.code === code);
                            return (
                                <TagChip key={code}>{item ? item.label : code}</TagChip>
                            );
                        })}
                    </TagChipsRow>
                ) : (
                    <div
                        style={{
                            color: "#9ca3af",
                            fontSize: "0.8rem",
                            fontStyle: "italic",
                        }}
                    >
                        선택된 항목이 없습니다
                    </div>
                )
            ) : (
                <CheckWrap>
                    {options.map((opt) => (
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
        </TagGroup>
    );
}

/* =========================
 * 6) 본체 컴포넌트
 * ========================= */
function MyPage() {
    const navigate = useNavigate();

    // ✅ useAuth에서 clearAuthState 받아온다
    const { clearAuthState } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [serverData, setServerData] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        imageUrl: "",
        age: "",
        gender: "",
        regionDo: "",
        regionSi: "",
        lifecycleTagCodes: [],
        householdTagCodes: [],
        interestTagCodes: [],
    });

    // 지역 데이터
    const regionMapRaw = {
        서울특별시: [
            "종로구",
            "중구",
            "용산구",
            "성동구",
            "광진구",
            "동대문구",
            "중랑구",
            "성북구",
            "강북구",
            "도봉구",
            "노원구",
            "은평구",
            "서대문구",
            "마포구",
            "양천구",
            "강서구",
            "구로구",
            "금천구",
            "영등포구",
            "동작구",
            "관악구",
            "서초구",
            "강남구",
            "송파구",
            "강동구",
        ],
        부산광역시: [
            "중구",
            "서구",
            "동구",
            "영도구",
            "부산진구",
            "동래구",
            "남구",
            "북구",
            "해운대구",
            "사하구",
            "금정구",
            "강서구",
            "연제구",
            "수영구",
            "사상구",
            "기장군",
        ],
        대구광역시: [
            "중구",
            "동구",
            "서구",
            "남구",
            "북구",
            "수성구",
            "달서구",
            "달성군",
            "군위군",
        ],
        인천광역시: [
            "중구",
            "동구",
            "미추홀구",
            "연수구",
            "남동구",
            "부평구",
            "계양구",
            "서구",
            "강화군",
            "옹진군",
        ],
        광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
        대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
        울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
        세종특별자치시: ["세종시"],
        경기도: [
            "수원시",
            "성남시",
            "의정부시",
            "안양시",
            "부천시",
            "광명시",
            "평택시",
            "동두천시",
            "안산시",
            "고양시",
            "과천시",
            "구리시",
            "남양주시",
            "오산시",
            "시흥시",
            "군포시",
            "의왕시",
            "하남시",
            "용인시",
            "파주시",
            "이천시",
            "안성시",
            "김포시",
            "화성시",
            "광주시",
            "양주시",
            "포천시",
            "여주시",
            "연천군",
            "가평군",
            "양평군",
        ],
        강원도: [
            "춘천시",
            "원주시",
            "강릉시",
            "동해시",
            "태백시",
            "속초시",
            "삼척시",
            "홍천군",
            "횡성군",
            "영월군",
            "평창군",
            "정선군",
            "철원군",
            "화천군",
            "양구군",
            "인제군",
            "고성군",
            "양양군",
        ],
        충청북도: [
            "청주시",
            "충주시",
            "제천시",
            "보은군",
            "옥천군",
            "영동군",
            "증평군",
            "진천군",
            "괴산군",
            "음성군",
            "단양군",
        ],
        충청남도: [
            "천안시",
            "공주시",
            "보령시",
            "아산시",
            "서산시",
            "논산시",
            "계룡시",
            "당진시",
            "금산군",
            "부여군",
            "서천군",
            "청양군",
            "홍성군",
            "예산군",
            "태안군",
        ],
        전라북도: [
            "전주시",
            "군산시",
            "익산시",
            "정읍시",
            "남원시",
            "김제시",
            "완주군",
            "진안군",
            "무주군",
            "장수군",
            "임실군",
            "순창군",
            "고창군",
            "부안군",
        ],
        전라남도: [
            "목포시",
            "여수시",
            "순천시",
            "나주시",
            "광양시",
            "담양군",
            "곡성군",
            "구례군",
            "고흥군",
            "보성군",
            "화순군",
            "장흥군",
            "강진군",
            "해남군",
            "영암군",
            "무안군",
            "함평군",
            "영광군",
            "장성군",
            "완도군",
            "진도군",
            "신안군",
        ],
        경상북도: [
            "포항시",
            "경주시",
            "김천시",
            "안동시",
            "구미시",
            "영주시",
            "영천시",
            "상주시",
            "문경시",
            "경산시",
            "군위군",
            "의성군",
            "청송군",
            "영양군",
            "영덕군",
            "청도군",
            "고령군",
            "성주군",
            "칠곡군",
            "예천군",
            "봉화군",
            "울진군",
            "울릉군",
        ],
        경상남도: [
            "창원시",
            "진주시",
            "통영시",
            "사천시",
            "김해시",
            "밀양시",
            "거제시",
            "양산시",
            "의령군",
            "함안군",
            "창녕군",
            "고성군",
            "남해군",
            "하동군",
            "산청군",
            "함양군",
            "거창군",
            "합천군",
        ],
        제주특별자치도: ["제주시", "서귀포시"],
    };

    const { newMap: regionMapSorted, sortedDoList } = useMemo(() => {
        return sortRegionMap(regionMapRaw);
    }, []);

    const region1Options = sortedDoList;
    const region2Options = formData.regionDo
        ? regionMapSorted[formData.regionDo] || []
        : [];

    // 공통 state 업데이트
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

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

    // household: "NONE" 단독 선택 규칙
    const toggleHousehold = (code) => {
        setFormData((prev) => {
            const exists = prev.householdTagCodes.includes(code);

            if (code === "NONE") {
                if (exists) {
                    return {
                        ...prev,
                        householdTagCodes: prev.householdTagCodes.filter(
                            (c) => c !== "NONE"
                        ),
                    };
                } else {
                    return {
                        ...prev,
                        householdTagCodes: ["NONE"],
                    };
                }
            }

            if (exists) {
                const filtered = prev.householdTagCodes.filter((c) => c !== code);
                return {
                    ...prev,
                    householdTagCodes: filtered,
                };
            } else {
                const cleaned = prev.householdTagCodes.filter((c) => c !== "NONE");
                return {
                    ...prev,
                    householdTagCodes: [...cleaned, code],
                };
            }
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

    // 수정/저장 버튼 클릭
    const handleEditClick = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }
        await handleSave();
    };

    // PATCH 저장 로직
    const handleSave = async () => {
        if (formData.lifecycleTagCodes.length === 0) {
            alert("생애주기는 최소 1개 이상 선택해 주세요.");
            return;
        }
        if (formData.householdTagCodes.length === 0) {
            alert("가구상황은 최소 1개 이상 선택해 주세요.");
            return;
        }
        const hasNone = formData.householdTagCodes.includes("NONE");
        if (hasNone && formData.householdTagCodes.length > 1) {
            alert("가구상황은 '해당사항 없음'을 다른 항목과 함께 선택할 수 없어요.");
            return;
        }

        try {
            const genderEnum =
                formData.gender === "남성"
                    ? "MALE"
                    : formData.gender === "여성"
                        ? "FEMALE"
                        : "";

            const lifecycleTagIds = LIFECYCLE_OPTIONS.filter((opt) =>
                formData.lifecycleTagCodes.includes(opt.code)
            ).map((opt) => opt.id);

            const householdTagIds = HOUSEHOLD_OPTIONS.filter((opt) =>
                formData.householdTagCodes.includes(opt.code)
            ).map((opt) => opt.id);

            const interestTagIds = INTEREST_OPTIONS.filter((opt) =>
                formData.interestTagCodes.includes(opt.code)
            ).map((opt) => opt.id);

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
                name: updated.basic?.name || "",
                email: updated.basic?.email || "",
                imageUrl: updated.basic?.imageUrl || "",
                age: updated.basic?.age?.toString() || "",
                gender:
                    updated.basic?.gender === "MALE"
                        ? "남성"
                        : updated.basic?.gender === "FEMALE"
                            ? "여성"
                            : updated.basic?.gender || "",
                regionDo: updated.profile?.regionDo || "",
                regionSi: updated.profile?.regionSi || "",
                lifecycleTagCodes: updated.tags?.lifecycleCodes || [],
                householdTagCodes: updated.tags?.householdCodes || [],
                interestTagCodes: updated.tags?.interestCodes || [],
            });

            setIsEditing(false);
            alert("수정이 완료되었습니다!");
        } catch (err) {
            console.error("PATCH /user/me 실패:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    // 회원탈퇴 버튼 핸들러
    const handleDeleteAccount = async () => {
        const ok = window.confirm(
            "정말 탈퇴하시겠습니까?\n저장된 캘린더 일정, 관심태그 등 모든 정보가 삭제되고 복구할 수 없습니다."
        );
        if (!ok) return;

        try {
            // 1) 서버에서 실제 계정 삭제
            await apiDeleteAccount();

            // 2) 서버 쪽 세션 / 쿠키 만료 (로그아웃)
            await apiLogout();

            // 3) ✅ 프론트 전역 인증상태/스토리지 강제 초기화
            clearAuthState();

            alert("회원탈퇴가 완료되었습니다.");

            // 4) ✅ 전체 리로드하면서 홈으로 이동
            //    navigate("/") 만 쓰면 SPA 상태가 남을 수 있어서 새로고침이 더 안전
            window.location.href = "/";
        } catch (err) {
            console.error("회원탈퇴 실패:", err);
            alert("회원탈퇴 중 오류가 발생했습니다.");
        }
    };

    // 처음 로딩
    useEffect(() => {
        (async () => {
            try {
                const data = await apiGetMyPage();
                setServerData(data);
                setFormData({
                    name: data.basic?.name || "",
                    email: data.basic?.email || "",
                    imageUrl: data.basic?.imageUrl || "",
                    age: data.basic?.age?.toString() || "",
                    gender:
                        data.basic?.gender === "MALE"
                            ? "남성"
                            : data.basic?.gender === "FEMALE"
                                ? "여성"
                                : data.basic?.gender || "",
                    regionDo: data.profile?.regionDo || "",
                    regionSi: data.profile?.regionSi || "",
                    lifecycleTagCodes: data.tags?.lifecycleCodes || [],
                    householdTagCodes: data.tags?.householdCodes || [],
                    interestTagCodes: data.tags?.interestCodes || [],
                });
            } catch (err) {
                console.error("GET /user/me 실패:", err);
                alert("사용자 정보를 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <PageBg>
                <Card>
                    <Section>
                        <SectionHeader>
                            <SectionTitle>마이페이지</SectionTitle>
                            <LoadingText>데이터를 불러오는 중...</LoadingText>
                        </SectionHeader>
                    </Section>
                </Card>
            </PageBg>
        );
    }

    return (
        <PageBg>
            <Card>
                {/* 상단 프로필 영역 */}
                <ProfileSection>
                    {/* 우상단 수정/저장 버튼 (floating) */}
                    <FloatingEditButton onClick={handleEditClick}>
                        {isEditing ? "저장" : "수정"}
                    </FloatingEditButton>

                    <Avatar
                        src={formData.imageUrl || "/src/assets/mypage.png"}
                        alt="프로필 이미지"
                        onError={(e) => {
                            e.target.src = "/src/assets/mypage.png";
                        }}
                    />

                    <ProfileTextCol>
                        <ProfileName>{formData.name || "이름 없음"}</ProfileName>
                        <ProfileEmail>{formData.email || "이메일 없음"}</ProfileEmail>
                    </ProfileTextCol>
                </ProfileSection>

                {/* 개인정보 섹션 */}
                <Section>
                    <SectionHeader>
                        <SectionTitle>개인 정보</SectionTitle>
                        <SectionSub>계정 기본 정보와 나이 / 성별</SectionSub>
                    </SectionHeader>

                    <TwoColGrid>
                        {/* 이름 */}
                        <FieldBlock>
                            <FieldLabelRow>
                                <FieldLabel>이름</FieldLabel>
                                <FieldReadonlyMark>수정 불가</FieldReadonlyMark>
                            </FieldLabelRow>
                            <InputBase value={formData.name} disabled={true} $readonly={true} />
                        </FieldBlock>

                        {/* 이메일 */}
                        <FieldBlock>
                            <FieldLabelRow>
                                <FieldLabel>이메일</FieldLabel>
                                <FieldReadonlyMark>수정 불가</FieldReadonlyMark>
                            </FieldLabelRow>
                            <InputBase
                                type="email"
                                value={formData.email}
                                disabled={true}
                                $readonly={true}
                            />
                        </FieldBlock>

                        {/* 나이 */}
                        <FieldBlock>
                            <FieldLabelRow>
                                <FieldLabel>나이</FieldLabel>
                                {!isEditing && (
                                    <FieldReadonlyMark>편집하려면 수정 버튼</FieldReadonlyMark>
                                )}
                            </FieldLabelRow>

                            <AgeWrapper>
                                <InputBase
                                    value={formData.age}
                                    onChange={(e) =>
                                        isEditing && handleInputChange("age", e.target.value)
                                    }
                                    disabled={!isEditing}
                                    $readonly={!isEditing}
                                    style={{ paddingRight: "32px" }}
                                />
                                <AgeSpinner>
                                    <AgeSpinBtn
                                        type="button"
                                        onClick={() => {
                                            if (!isEditing) return;
                                            const currentAge = parseInt(formData.age) || 0;
                                            handleInputChange(
                                                "age",
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
                                                "age",
                                                Math.max(0, Math.min(150, currentAge - 1)).toString()
                                            );
                                        }}
                                    >
                                        ▼
                                    </AgeSpinBtn>
                                </AgeSpinner>
                            </AgeWrapper>
                        </FieldBlock>

                        {/* 성별 */}
                        <FieldBlock>
                            <FieldLabelRow>
                                <FieldLabel>성별</FieldLabel>
                            </FieldLabelRow>

                            <SelectBase
                                value={formData.gender}
                                onChange={(e) => {
                                    if (!isEditing) return;
                                    handleInputChange("gender", e.target.value);
                                }}
                                disabled={!isEditing}
                            >
                                <option value="남성">남성</option>
                                <option value="여성">여성</option>
                            </SelectBase>
                        </FieldBlock>
                    </TwoColGrid>
                </Section>

                {/* 맞춤 설정 섹션 */}
                <Section>
                    <SectionHeader>
                        <SectionTitle>맞춤 설정</SectionTitle>
                        <SectionSub>
                            지역 / 가구상황 / 관심주제 등을 선택해 주세요
                        </SectionSub>
                    </SectionHeader>

                    <TwoColGrid>
                        {/* 지역 (시/도) */}
                        <FieldBlock>
                            <FieldLabelRow>
                                <FieldLabel>지역 (시/도)</FieldLabel>
                            </FieldLabelRow>
                            <SelectBase
                                value={formData.regionDo}
                                onChange={(e) => {
                                    if (!isEditing) return;
                                    handleInputChange("regionDo", e.target.value);
                                    handleInputChange("regionSi", "");
                                }}
                                disabled={!isEditing}
                            >
                                <option value="">선택</option>
                                {region1Options.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </SelectBase>
                        </FieldBlock>

                        {/* 지역 (시/군/구) */}
                        <FieldBlock>
                            <FieldLabelRow>
                                <FieldLabel>지역 (시/군/구)</FieldLabel>
                            </FieldLabelRow>
                            <SelectBase
                                value={formData.regionSi}
                                onChange={(e) => {
                                    if (!isEditing) return;
                                    handleInputChange("regionSi", e.target.value);
                                }}
                                disabled={!isEditing || !formData.regionDo}
                            >
                                <option value="">선택</option>
                                {region2Options.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </SelectBase>
                        </FieldBlock>

                        {/* 생애주기 */}
                        <FieldBlock style={{ gridColumn: "1 / -1" }}>
                            <TagMultiSelectSection
                                title="생애주기 (필수 선택)"
                                options={LIFECYCLE_OPTIONS}
                                selectedCodes={formData.lifecycleTagCodes}
                                onToggle={(code) => {
                                    if (isEditing) toggleLifecycle(code);
                                }}
                                readOnly={!isEditing}
                            />
                        </FieldBlock>

                        {/* 가구상황 */}
                        <FieldBlock style={{ gridColumn: "1 / -1" }}>
                            <TagMultiSelectSection
                                title="가구상황 (필수 선택)"
                                options={HOUSEHOLD_OPTIONS}
                                selectedCodes={formData.householdTagCodes}
                                onToggle={(code) => {
                                    if (isEditing) toggleHousehold(code);
                                }}
                                readOnly={!isEditing}
                            />
                        </FieldBlock>

                        {/* 관심주제 */}
                        <FieldBlock style={{ gridColumn: "1 / -1" }}>
                            <TagMultiSelectSection
                                title="관심주제 (선택 사항)"
                                options={INTEREST_OPTIONS}
                                selectedCodes={formData.interestTagCodes}
                                onToggle={(code) => {
                                    if (isEditing) toggleInterest(code);
                                }}
                                readOnly={!isEditing}
                            />
                        </FieldBlock>
                    </TwoColGrid>

                    {/* 하단 좌우 버튼 영역 */}
                    <BottomRow>
                        {/* ⬅ 왼쪽 하단: 회원탈퇴 */}
                        <DeleteAccountButton onClick={handleDeleteAccount}>
                            회원탈퇴
                        </DeleteAccountButton>

                        {/* ➡ 오른쪽 하단: 수정 / 저장 */}
                        <SaveButton onClick={handleEditClick}>
                            {isEditing ? "저장" : "수정"}
                        </SaveButton>
                    </BottomRow>
                </Section>
            </Card>
        </PageBg>
    );
}

export default MyPage;
