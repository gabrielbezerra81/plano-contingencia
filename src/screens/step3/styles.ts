import colors from "assets/colors";
import styled from "styled-components";
import { shade } from "polished";

export const Container = styled.div`
  padding: 8px 0 16px;

  > h6:first-child {
    color: #8c8c8c;
    text-align: center;
    font-size: 14px;
  }

  > main {
    margin-top: 32px;
    display: flex;
  }
`;

export const MapAndAddressListContainer = styled.div`
  > div:last-child {
    margin-top: 24px;
    border-top: 1px solid #a8a8a8;
    position: relative;
    padding-top: 16px;

    > label {
      color: #000;
      font-size: 10px;
      line-height: 12px;
      margin-bottom: 0px;
      position: absolute;
      top: -8px;
      left: 16px;
      padding: 0 4px;
      background-color: #fff;
    }
  }

  > div {
    .addressItem {
      display: flex;
      align-items: flex-start;

      & + .addressItem {
        margin-top: 4px;
      }
    }

    svg {
      fill: ${colors.darkBlue};
      stroke: #fff;
      stroke-width: 3px;
    }
  }
`;

export const AddLocationContainer = styled.div`
  flex: 1;
  padding-left: 8px;

  > main {
    padding-left: 8px;

    > label {
      color: #3d3d3d;
      font-size: 14px;
      margin-top: 40px;
      margin-bottom: 0px;
    }

    span {
      color: #3d3d3d;
    }

    input {
      color: #3d3d3d;
    }

    .inputContainer {
      margin-top: 12px;

      input {
        flex: 1;
      }
    }

    .latLongInputGroup {
      display: flex;
      margin-top: 16px;
    }

    .buttonsContainer {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;

      button:first-child {
        background-color: ${colors.darkBlue};
        font-weight: 500;
        margin-right: 16px;
        border-color: ${colors.darkBlue};

        &:hover {
          background-color: ${shade(0.2, colors.darkBlue)};
        }

        &:active {
          background-color: ${shade(0.3, colors.darkBlue)};
        }
      }
    }
  }
`;
