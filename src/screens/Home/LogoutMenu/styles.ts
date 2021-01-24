import styled, { css } from "styled-components";

interface ContainerProps {
  isOpen: boolean;
}

export const Container = styled.div<ContainerProps>`
  background-color: #212121;
  min-height: calc(100vh - 24px);
  width: 132px;
  transition: 0.2s;
  transition-property: opacity width;
  overflow: hidden;
  border-right: 1px solid #919191;

  ${({ isOpen }) =>
    !isOpen &&
    css`
      width: 0;
      opacity: 0;
    `}

  div.menuItem,
  button.menuItem {
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-direction: column;
    text-align: center;

    &:nth-child(odd) {
      background-color: #333;
    }

    h6 {
      color: #ddd;
    }
  }

  button.menuItem {
    &:hover {
      opacity: 0.6;
    }

    div {
      display: flex;
      align-items: center;

      span {
        font-size: 9px;
        color: #ddd;
      }

      span.connectedCircle {
        background-color: #0f0;
        height: 6px;
        width: 6px;
        border-radius: 5px;
        display: block;
        margin-right: 6px;
      }

      svg {
        margin-right: 6px;
        color: #ddd;
        stroke-width: 3px;
      }
    }
  }
`;

// #333
