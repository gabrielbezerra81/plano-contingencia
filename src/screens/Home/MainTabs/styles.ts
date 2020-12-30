import styled, { css } from "styled-components";

import { Nav } from "react-bootstrap";
import colors from "assets/colors";

interface TabHeaderProps {
  isLeftMenuOpen: boolean;
}

export const TabHeader = styled(Nav)<TabHeaderProps>`
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  position: sticky;
  left: 288px;

  ${({ isLeftMenuOpen }) =>
    !isLeftMenuOpen &&
    css`
      @media (max-width: 1415px) {
        margin-left: 288px;
      }
    `}
`;

interface TabItemProps {
  stepHasPassed: boolean;
}

export const TabItem = styled(Nav.Item)<TabItemProps>`
  text-decoration: none;
  flex: 1;
  position: relative;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

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

interface ContentProps {
  isLeftMenuOpen: boolean;
  selectedTab: string;
}

export const Content = styled.main<ContentProps>`
  flex: 1;
  /* height: 600px; */

  .tab-pane {
    padding: 16px 0 40px;
    position: relative;
    height: 100%;

    > h3 {
      text-align: center;
      color: #212121;
      position: sticky;
      left: 288px;
      margin: 0 auto;
    }
  }

  .nextButton {
    position: absolute;
    bottom: 40px;
    right: 0px;
  }

  ${({ isLeftMenuOpen, selectedTab }) =>
    !isLeftMenuOpen &&
    selectedTab === "tab4" &&
    css`
      /* margin-top: 72px; */
    `}

  ${({ isLeftMenuOpen, selectedTab }) =>
    !isLeftMenuOpen &&
    selectedTab === "tab3" &&
    css`
      .tab-pane {
        > h3 {
          @media (max-width: 1400px) {
            margin: 0 auto;
            margin-left: 288px;
          }
        }
      }
    `}
`;
