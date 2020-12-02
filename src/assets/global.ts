import { css, createGlobalStyle } from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import colors from "./colors";
import { shade } from "polished";

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
      transition: opacity 0.2s;

      &:focus {
        outline: none !important;
      }
    }

    button.darkBlueButton {
      background-color: ${colors.darkBlue};
      border-color: ${colors.darkBlue};

      &:focus {
        background-color: ${colors.darkBlue};
      }

      &:hover {
        background-color: ${shade(0.2, colors.darkBlue)} !important;
      }

      &:active {
        background-color: ${shade(0.3, colors.darkBlue)} !important;
      }
    }

    .addVehicleModalWrapper {
      z-index: 1055;
    }

    .addToGroupModalWrapper {
      z-index: 1055;
    }

    .addUserModalWrapper {
      z-index: 1065;
    }

    .createResourceModalWrapper {
      z-index: 1055;
    }

    .addAddressModalWrapper {
      z-index: 1065;
    }
  `}



`;

export default GlobalStyle;
