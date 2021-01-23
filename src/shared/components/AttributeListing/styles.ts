import colors from "assets/colors";
import styled, { css } from "styled-components";

interface ContainerProps {
  size: "small" | "normal";
}

export const Container = styled.div<ContainerProps>`
  position: relative;
  border-top: 1px solid #a8a8a8;
  padding-top: 4px;
  margin-top: 12px;

  > small {
    font-size: 10px;
    line-height: 12px;
    color: #000000;
    position: absolute;
    top: -8px;
    left: 10px;
    padding: 0 4px;
    background-color: #f0efec;
  }

  .attributeListItem {
    display: flex;
    margin-top: 4px;
    align-items: center;

    .numeration {
      color: red;
      font-weight: 500;
    }

    button {
      &:first-child {
        svg {
          fill: ${colors.darkBlue};
          stroke: #fff;
          stroke-width: 3px;
          height: 23px;
        }
      }

      &:nth-child(2) {
        svg {
          stroke: ${colors.darkBlue};
          stroke-width: 3px;
          height: 24px;
          margin-right: 4px;
        }
      }
    }

    span {
      font-size: 16px;
    }
  }

  ${({ size }) =>
    size === "small" &&
    css`
      .attributeListItem {
        span {
          font-size: 14px;
        }
      }
    `}
`;
