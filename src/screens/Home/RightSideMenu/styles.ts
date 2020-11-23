import styled, { css } from "styled-components";
import colors from "assets/colors";

interface ContainerProps {
  isOpen: boolean;
}

export const Container = styled.div<ContainerProps>`
  height: 100%;
  transition: width 0.2s;
  overflow: hidden;
  width: 80px;
  pointer-events: none;

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

  main {
    background-color: #212121;
    height: 100%;
    padding-top: 3px;
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

      ${({ isOpen }) =>
        isOpen &&
        css`
          opacity: 1;
          width: unset;
        `}

      .filterInput {
        input {
          color: #c6c6c6;
        }

        svg {
          path {
            stroke: #c6c6c6;
          }
        }
      }
    }
  }
`;
