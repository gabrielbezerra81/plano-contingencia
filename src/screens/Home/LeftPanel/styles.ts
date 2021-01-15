import { ActiveAppTab } from "context/System/systemContext";
import styled, { css } from "styled-components";

interface ContainerProps {
  isOpen: boolean;
  activeAppTab: ActiveAppTab;
}

export const Container = styled.div<ContainerProps>`
  background-color: #212121;
  min-height: calc(100vh - 24px);
  width: 300px;
  transition: width 0.2s;

  ${({ activeAppTab }) => {
    let tabNumber = 1;

    if (activeAppTab === "searchPlan") {
      tabNumber = 2;
    } else if (activeAppTab === "createPlan") {
      tabNumber = 3;
    }

    return css`
      .menuItem:nth-child(${tabNumber}) {
        h6 {
          color: #ff7802;
        }
      }
    `;
  }}

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
    pointer-events: none;

    ${({ isOpen }) =>
      isOpen &&
      css`
        pointer-events: auto;
      `}

    .menuItemsContainer {
      transition: opacity 0.25s;
    }

    .menuItem {
      padding: 12px;
      border-bottom: 1px solid #919191;
      width: 100%;
      text-align: left;
      transition: opacity 0.2s;

      ${({ isOpen }) =>
        isOpen &&
        css`
          &:hover {
            opacity: 0.6;
          }
        `}

      h6 {
        color: #a8a8a8;
        font-weight: 400;
        transition: color 0.2s;
      }
    }

    > .menuItem:first-child {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      pointer-events: auto;

      &:hover {
        opacity: 1;
      }

      button.logoutButton {
        position: absolute;
        left: 8px;

        &:hover {
          opacity: 0.6;
        }

        img {
          height: 30px;
        }
      }

      button.menuButton {
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
        z-index: 1030;
      }

      > div {
        position: fixed;
        width: 296px;
        margin-top: 72px;
        border-top: 1px solid #919191;
        z-index: 1030;

        .menuItem {
          background-color: #fff;

          h6 {
            color: #555656;
          }
        }
      }
    `}
`;
