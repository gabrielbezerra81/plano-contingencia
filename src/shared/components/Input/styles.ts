import styled, { css } from "styled-components";

interface ContainerProps {
  rightIcon: boolean;
  bordered: boolean;
  labelOnInput: boolean;
  borderBottomOnly: boolean;
  size: "small" | "normal";
}

export const Container = styled.div<ContainerProps>`
  position: relative;
  display: flex;
  align-items: center;

  ${({ size }) =>
    size === "small" &&
    css`
      height: 25px;
    `}

  ${({ rightIcon }) =>
    rightIcon &&
    css`
      svg {
        position: absolute;
        right: 8px;
        transform: rotateZ(90deg);
        height: 18px;
        width: 18px;
        top: 0;
        bottom: 0;
        margin: auto 0;

        path {
          stroke: #000000;
        }
      }
    `}

  ${({ bordered }) =>
    bordered &&
    css`
      border: 1px solid #ced4da;
    `}

  ${({ borderBottomOnly }) =>
    borderBottomOnly &&
    css`
      border-bottom: 1px solid #000;
      border-radius: 0;
    `}

  ${({ labelOnInput }) =>
    labelOnInput &&
    css`
      padding-left: 4px;
      /* box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); */
      /* border-radius: 4px; */

      span {
        color: #3d3d3d;
      }

      input {
        box-shadow: none !important;
        padding-left: 6px;
      }
    `}

    > select {
    background-color: transparent;
    border: none;
    color: #3d3d3d;
    box-shadow: none !important;
    height: 100%;
    padding: 0 12px 0 6px;

    &:focus {
      background-color: transparent;
    }
  }

  > input {
    background-color: transparent;
    border: none;
    color: #3d3d3d;
    box-shadow: none !important;
    flex: 1;

    &.form-control::-webkit-input-placeholder {
      color: #8c8c8c;
    } /* WebKit, Blink, Edge */
    &.form-control:-moz-placeholder {
      color: #8c8c8c;
    } /* Mozilla Firefox 4 to 18 */
    &.form-control::-moz-placeholder {
      color: #8c8c8c;
    } /* Mozilla Firefox 19+ */
    &.form-control:-ms-input-placeholder {
      color: #8c8c8c;
    } /* Internet Explorer 10-11 */
    &.form-control::-ms-input-placeholder {
      color: #8c8c8c;
    } /* Microsoft Edge */

    &:focus {
      background-color: transparent;
      outline: none;
    }

    ${({ rightIcon }) =>
      rightIcon &&
      css`
        padding-right: 40px;
      `}
  }
`;
