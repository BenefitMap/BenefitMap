import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* 구글 폰트 - Noto Sans KR */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

  /* 로컬 폰트 - GowunBatang (public/fonts 안에 있어야 함) */
  @font-face {
    font-family: 'GowunBatang';
    src: url('/fonts/GowunBatang.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    /* 기본 폰트를 GowunBatang으로 설정, 폴백으로 Noto Sans KR */
    font-family: 'GowunBatang', 'Noto Sans KR', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #fff;
    color: #333;
    line-height: 1.5;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }
`;

export default GlobalStyle;
