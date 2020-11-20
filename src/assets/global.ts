import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`
${css`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
      "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #1f1f1f !important;

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0;
    }
  }

  button {
    border: none;
    background-color: transparent;
    line-height: normal;

    &:focus {
      outline: none !important;
    }
  }
`}
`;

export default GlobalStyle;
