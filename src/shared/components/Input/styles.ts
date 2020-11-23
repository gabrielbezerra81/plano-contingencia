import styled, { css } from "styled-components";

interface ContainerProps {
  rightIcon: boolean;
  bordered: boolean;
  labelOnInput: boolean;
  borderBottomOnly: boolean;
}

export const Container = styled.div<ContainerProps>`
  position: relative;
  display: flex;
  align-items: center;

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
      border-bottom: 1px solid #a8a8a8;
      border-radius: 0;
    `}

  ${({ labelOnInput }) =>
    labelOnInput &&
    css`
      padding-left: 4px;
      /* box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); */
      /* border-radius: 4px; */

      span {
        color: #c6c6c6;
      }

      input {
        box-shadow: none !important;
        padding-left: 4px;
      }
    `}


>input {
    background-color: transparent;
    border: none;
    color: #3d3d3d;
    box-shadow: none !important;

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
    }

    ${({ rightIcon }) =>
      rightIcon &&
      css`
        padding-right: 40px;
      `}
  }
`;
