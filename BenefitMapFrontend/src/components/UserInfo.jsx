import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserInfo, logout } from '../utils/auth';

const UserInfoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    background-color: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const UserAvatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #43a047;
`;

const UserDetails = styled.div`
    flex: 1;
`;

const UserName = styled.div`
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 2px;
    font-size: 0.95rem;
`;

const UserEmail = styled.div`
    font-size: 0.85rem;
    color: #7f8c8d;
`;

const LogoutButton = styled.button`
    padding: 8px 16px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #c0392b;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.3);
    }
`;

function UserInfo() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // 최초 마운트 시 localStorage에서 유저 정보 읽어옴
    useEffect(() => {
        try {
            const storedUserInfo = getUserInfo(); // utils/auth에서 읽음
            if (storedUserInfo) {
                setUserInfo(storedUserInfo);
            }
        } catch (error) {
            console.error('사용자 정보를 가져오는데 실패했습니다:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        // 여기서는 react-router의 navigate 없으니까 그냥 logout()만 호출
        // logout()이 알아서 /LoginPage 로 이동시켜줌 (navigate 없으면 href fallback)
        logout();
    };

    if (loading) {
        return (
            <UserInfoContainer>
                <UserAvatar src="https://via.placeholder.com/40" alt="프로필" />
                <UserDetails>
                    <UserName>로딩 중...</UserName>
                    <UserEmail>사용자 정보를 불러오는 중입니다</UserEmail>
                </UserDetails>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </UserInfoContainer>
        );
    }

    if (!userInfo) {
        // 로그인은 되어 있는데 user_info가 아직 안 채워진 경우 등
        return (
            <UserInfoContainer>
                <UserAvatar src="https://via.placeholder.com/40" alt="프로필" />
                <UserDetails>
                    <UserName>Google User</UserName>
                    <UserEmail>user@google.com</UserEmail>
                </UserDetails>
                <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </UserInfoContainer>
        );
    }

    return (
        <UserInfoContainer>
            <UserAvatar
                src={
                    userInfo.picture ||
                    userInfo.photoURL ||
                    'https://via.placeholder.com/40'
                }
                alt="프로필"
            />
            <UserDetails>
                <UserName>
                    {userInfo.name || userInfo.displayName || 'Google User'}
                </UserName>
                <UserEmail>
                    {userInfo.email || userInfo.emailAddress || 'user@google.com'}
                </UserEmail>
            </UserDetails>
            <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </UserInfoContainer>
    );
}

export default UserInfo;
