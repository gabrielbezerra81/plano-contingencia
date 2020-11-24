import styled, { css } from "styled-components";

import { Nav, NavItem } from "react-bootstrap";
import colors from "assets/colors";

export const TabHeader = styled(Nav)`
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
`;

interface TabItemProps {
  stepHasPassed: boolean;
}

export const TabItem = styled(Nav.Item)<TabItemProps>`
  text-decoration: none;
  flex: 1;
  position: relative;

  clip-path: polygon(95% 0, 100% 50%, 95% 100%, 0% 100%, 0 53%, 0% 0%);

  & + & {
    clip-path: polygon(95% 0, 100% 50%, 95% 100%, 0% 100%, 5% 50%, 0% 0%);

    > a {
      border-radius: 0;
    }
  }

  > a {
    background-color: ${colors.darkGrey};
    border-radius: 14px;
    height: 14px;
    padding: 0;

    &.active {
      background-color: ${colors.orangePrimary};
    }

    ${({ styled: { stepHasPassed } }) =>
      stepHasPassed &&
      css`
        background-color: ${colors.orangePrimary};
      `}
  }
`;

export const Content = styled.main`
  flex: 1;
  /* height: 600px; */

  .tab-pane {
    padding: 16px 0 80px;
    position: relative;
    height: 100%;

    > h3 {
      text-align: center;
      color: #212121;
    }
  }

  .nextButton {
    position: absolute;
    bottom: 40px;
    right: 0px;
  }
`;
