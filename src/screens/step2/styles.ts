import colors from "assets/colors";
import styled from "styled-components";
import { shade } from "polished";

export const Container = styled.div`
  padding: 24px 0 16px;

  > span:first-child {
    color: #212121;
  }

  > main {
    margin-top: 64px;

    > button {
      background-color: ${colors.darkGrey} !important;
      border-color: ${colors.darkGrey} !important;

      &:hover {
        background-color: ${shade(0.1, colors.darkGrey)} !important;
      }
    }
  }
`;

export const MembersContainer = styled.div`
  margin-top: -1px;
  margin-left: 3px;
  border-top-right-radius: 4px;
  padding-top: 48px;

  display: flex;
  width: 100%;
  border-width: 1px 1px 1px 0px;
  border-color: #000;
  border-style: solid;

  flex-direction: column;

  .memberFilter {
    width: 250px;
    margin-bottom: 16px;
    margin-left: auto;
    margin-right: 16px;

    border-color: #000;

    > input {
      color: #3d3d3d;
    }

    > span {
      color: #3d3d3d;
    }

    > svg {
      path {
        stroke-width: 3px;
      }
    }
  }

  > table {
    border-left: 1px solid #000;

    th {
      background-color: #555656;
      color: #fff;
      padding: 4px 10px 4px 10px;
      position: relative;

      &:not(:last-child) {
        border-right: 1px solid #000;
      }

      &:first-child {
        text-align: center;
        padding: 4px;
      }

      &:nth-child(3) {
        max-width: 300px;
        min-width: 100px;
        width: 300px;
      }

      > svg {
        position: absolute;
        right: 10px;
      }
    }

    tr:not(:last-child) {
      td {
        border-bottom: 1px solid #000;
      }
    }

    td {
      padding: 4px 10px;
      border-right: 1px solid #000;
      color: #424242;
      position: relative;

      &:first-child {
        text-align: center;
        padding: 4px;
      }

      > span {
        height: 12px;
        width: 12px;
        border-radius: 12px;
        background-color: #ff0000;
        position: absolute;
        right: 10px;
        top: 10px;
      }

      button.removeRowButton {
        position: absolute;
        left: -26px;
      }
    }
  }
`;

export const RoleCell = styled.div`
  display: flex;

  input {
    border: none;
    flex: 1;

    &:focus {
      outline-color: #80bdff;
    }
  }

  svg {
    margin-left: 8px;
  }
`;
