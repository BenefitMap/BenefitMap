import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserInfo, logout } from '../utils/googleAuth';

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // localStorage에서 사용자 정보 가져오기
        const storedUserInfo = localStorage.getItem('user_info');
        if (storedUserInfo) {
          const parsedInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedInfo);
        } else {
          // googleAuth에서 정보 가져오기
          const googleUserInfo = getUserInfo();
          setUserInfo(googleUserInfo);
        }
      } catch (error) {
        console.error('사용자 정보를 가져오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    logout();
    // 페이지 새로고침하여 상태 초기화
    window.location.reload();
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

  // 사용자 정보가 없으면 기본 정보 표시
  if (!userInfo) {
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
      <UserAvatar src={userInfo.picture || userInfo.photoURL || "https://via.placeholder.com/40"} alt="프로필" />
      <UserDetails>
        <UserName>{userInfo.name || userInfo.displayName || 'Google User'}</UserName>
        <UserEmail>{userInfo.email || userInfo.emailAddress || 'user@google.com'}</UserEmail>
      </UserDetails>
      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
    </UserInfoContainer>
  );
}

export default UserInfo;

