import styled, { css } from "styled-components";
import colors from "assets/colors";
import { shade } from "polished";

interface ContainerProps {
  isOpen: boolean;
  activeItemNumber: number;
}

export const Container = styled.div<ContainerProps>`
  min-height: calc(100vh - 24px);
  transition: width 0.2s;
  overflow: hidden;
  min-width: 80px;
  width: 80px;
  pointer-events: none;
  z-index: 1;

  ${({ isOpen }) =>
    isOpen &&
    css`
      width: 300px;
      pointer-events: all;
      box-shadow: -1px 0 8px 0px #222;
    `}

  header {
    background-color: ${colors.orangePrimary};
    display: flex;
    height: 30px;
    align-items: center;
    justify-content: center;
    pointer-events: all;
    position: relative;

    > button {
      width: 100%;
      height: 100%;

      &:hover {
        opacity: 0.8;
      }

      svg {
        position: absolute;
        left: 31px;
        top: 6px;
        transition: left 0.2s;

        ${({ isOpen }) =>
          isOpen &&
          css`
            left: 6px;
          `}
      }

      h6 {
        color: #fff;
      }
    }
  }

  div.main {
    background-color: #212121;
    height: 100%;
    padding-top: 4px;
    display: flex;

    aside {
      width: 80px;
      height: 100%;
      background-color: ${colors.darkBlue};
      pointer-events: all;

      button {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 20px 0;
        border-bottom: 1px solid #a8a8a8;
        transition: background-color 0.3s;

        ${({ activeItemNumber }) =>
          activeItemNumber !== -1 &&
          css`
            &:nth-child(${activeItemNumber}) {
              background-color: #ff7802;

              &:hover {
                opacity: 1;
              }
            }
          `}

        &:hover {
          opacity: 0.6;
        }

        img {
        }

        span {
          color: #fff;
          font-size: 10px;
          margin-top: 8px;
        }
      }
    }

    div.rightMenuContent {
      flex: 1;
      opacity: 0;
      transition: opacity 0.2s;
      width: 0;
      overflow: hidden;

      ${({ isOpen }) =>
        isOpen &&
        css`
          opacity: 1;
          width: unset;
        `}

      .resourceCrudButtonsRow {
        display: flex;
        justify-content: space-between;

        > button {
          background: #363535;
          border: 1px solid #8d8d8d;
          color: #ff7802 !important;
          border-radius: 1px;
          flex: 1;
          margin-left: 8px;

          &:hover {
            background: ${shade(0.3, "#363535")};
          }
        }
      }

      .filterInput {
        margin-top: 8px;

        span {
          color: #c6c6c6;
        }

        input {
          color: #c6c6c6;
        }

        svg {
          path {
            stroke: #c6c6c6;
          }
        }
      }

      .resourceItemList {
        background: #555656;
        border-radius: 5px;
        min-height: 45px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin-top: 16px;
        margin-left: 6px;
        padding: 0 12px;

        h6 {
          color: #d4d9e1;
          font-size: 11px;
          line-height: 13px;
          font-weight: 400;
        }
      }
    }
  }
`;
