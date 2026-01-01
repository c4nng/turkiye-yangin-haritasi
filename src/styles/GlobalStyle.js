import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`

  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background-color: #f9fafb;
    color: #1e1e1e;
    min-height: 100vh;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  #root {
    width: 100%;
    height: 100%;
  }
`;

export default GlobalStyle;
