import colors from "assets/colors";
import styled from "styled-components";

export const Container = styled.div`
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

    button {
      svg {
        fill: ${colors.darkBlue};
        stroke: #fff;
        stroke-width: 3px;
      }
    }

    span {
      font-size: 14px;
    }
  }
`;
