import styled from 'styled-components';
import { getUserInfo, logout } from '../utils/googleAuth';

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #91D0A6;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const LogoutButton = styled.button`
  padding: 6px 12px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: #c0392b;
  }
`;

function UserInfo() {
  const userInfo = getUserInfo();

  // 사용자 정보가 없으면 기본 정보 표시
  if (!userInfo) {
    return (
      <UserInfoContainer>
        <UserAvatar src="https://via.placeholder.com/40" alt="프로필" />
        <UserDetails>
          <UserName>Google User</UserName>
          <UserEmail>user@google.com</UserEmail>
        </UserDetails>
        <LogoutButton onClick={logout}>로그아웃</LogoutButton>
      </UserInfoContainer>
    );
  }

  return (
    <UserInfoContainer>
      <UserAvatar src={userInfo.picture} alt="프로필" />
      <UserDetails>
        <UserName>{userInfo.name}</UserName>
        <UserEmail>{userInfo.email}</UserEmail>
      </UserDetails>
      <LogoutButton onClick={logout}>로그아웃</LogoutButton>
    </UserInfoContainer>
  );
}

export default UserInfo;

