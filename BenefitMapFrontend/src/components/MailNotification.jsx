import { useState } from 'react';
import styled from 'styled-components';

const MailContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin: 20px 0;
`;

const MailTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
`;

const MailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #91D0A6;
    box-shadow: 0 0 0 2px rgba(145, 208, 166, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TestButton = styled(Button)`
  background-color: #91D0A6;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #7bc085;
  }
`;

const HtmlTestButton = styled(Button)`
  background-color: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
  }
`;

const D3TestButton = styled(Button)`
  background-color: #e74c3c;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #c0392b;
  }
`;

const Message = styled.div`
  padding: 10px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled(Message)`
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
`;

const ErrorMessage = styled(Message)`
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
`;

function MailNotification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMailTest = async (type) => {
    if (!email) {
      setMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const endpoint = type === 'text' ? '/api/mail/test' : 
                      type === 'html' ? '/api/mail/test-html' : '/api/mail/test-d3';
      
      const response = await fetch(`${BACKEND_URL}${endpoint}?to=${encodeURIComponent(email)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.text();
        setMessage(`✅ 메일 발송 성공: ${result}`);
      } else {
        setMessage('❌ 메일 발송 실패');
      }
    } catch (error) {
      console.error('메일 발송 오류:', error);
      setMessage('❌ 메일 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MailContainer>
      <MailTitle>📧 메일 알림 테스트</MailTitle>
      <MailForm onSubmit={(e) => e.preventDefault()}>
        <InputGroup>
          <Label htmlFor="email">테스트 이메일 주소</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            required
          />
        </InputGroup>
        
        <ButtonGroup>
          <TestButton 
            type="button" 
            onClick={() => handleMailTest('text')}
            disabled={loading}
          >
            텍스트 메일 테스트
          </TestButton>
          
          <HtmlTestButton 
            type="button" 
            onClick={() => handleMailTest('html')}
            disabled={loading}
          >
            HTML 메일 테스트
          </HtmlTestButton>
          
          <D3TestButton 
            type="button" 
            onClick={() => handleMailTest('d3')}
            disabled={loading}
          >
            D-3 알림 테스트
          </D3TestButton>
        </ButtonGroup>
        
        {message && (
          message.includes('✅') ? (
            <SuccessMessage>{message}</SuccessMessage>
          ) : (
            <ErrorMessage>{message}</ErrorMessage>
          )
        )}
      </MailForm>
    </MailContainer>
  );
}

export default MailNotification;
