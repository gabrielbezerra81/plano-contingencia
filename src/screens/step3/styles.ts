import colors from "assets/colors";
import styled, { css } from "styled-components";
import { shade } from "polished";
import { Form } from "react-bootstrap";

interface ContainerProps {
  highlightInputText: boolean;
}

export const Container = styled.div<ContainerProps>`
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

  ${({ highlightInputText }) =>
    highlightInputText &&
    css`
      .inputContainer.hightlightInputOnSearch {
        input {
          color: ${shade(0.2, "#80bdff")};
        }
      }
    `}
`;

export const MapAndAddressListContainer = styled.div`
  flex: 1;

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

  > .attributeListContainer {
    small {
      background-color: #fff;
    }
  }
`;

export const AddLocationContainer = styled(Form)`
  flex: 1;
  padding-left: 8px;
  max-width: 420px;

  > .inputContainer {
    padding-right: 56px;
  }

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

      .inputContainer {
        flex: 1;
      }
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

      label {
        height: 38px;
        margin-bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;

        background-color: #6c757d;
        border-color: #6c757d;
        color: #fff;
        border-radius: 0.2rem;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: #5a6268;
          border-color: #545b62;
        }

        &:focus {
          box-shadow: 0 0 0 0.2rem rgba(130, 138, 145, 0.5);
        }

        &:active {
          background-color: #545b62;
          border-color: #4e555b;
        }
      }

      input {
        display: none;
      }
    }
  }
`;
