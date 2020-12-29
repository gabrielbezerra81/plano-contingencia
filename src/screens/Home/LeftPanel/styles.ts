import styled, { css } from "styled-components";

interface ContainerProps {
  isOpen: boolean;
}

export const Container = styled.div<ContainerProps>`
  background-color: #212121;
  min-height: calc(100vh - 24px);
  width: 300px;
  transition: width 0.2s;

  header {
    background-color: #fff;
    height: 80px;
    margin-right: 4px;
    padding: 0 12px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    img {
      width: 50px;
    }
  }

  > div {
    > .menuItem {
      padding: 12px;
      border-bottom: 1px solid #919191;
      width: 100%;
      text-align: left;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.6;
      }

      h6 {
        color: #a8a8a8;
        font-weight: 400;
      }
    }

    > .menuItem:first-child {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:hover {
        opacity: 1;
      }

      button {
        position: absolute;
        left: 8px;

        &:hover {
          opacity: 0.6;
        }

        img {
          height: 30px;
        }
      }
    }
  }

  ${({ isOpen }) =>
    !isOpen &&
    css`
      width: 0;
      overflow: hidden;

      header {
        width: 296px;
        position: fixed;
        z-index: 99999;
      }

      > div {
        position: fixed;
        width: 296px;
        margin-top: 72px;
        border-top: 1px solid #919191;
        z-index: 99999;

        .menuItem {
          background-color: #fff;

          h6 {
            color: #555656;
          }
        }
      }
    `}
`;
