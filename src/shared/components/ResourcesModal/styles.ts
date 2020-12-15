import styled from "styled-components";
import { Modal as BSModal } from "react-bootstrap";
import colors from "assets/colors";

export const Modal = styled(BSModal)`
  .modal-dialog {
    max-width: 850px;
  }
`;

export const Container = styled.div`
  width: 850px;
  border-radius: 4px;
  position: relative;
  padding: 4px;
  padding-bottom: 32px;

  .darkBlueButton {
    position: absolute;
    bottom: 12px;
    right: 29px;
  }

  > header {
    display: flex;
    background-color: ${colors.darkBlue};
    height: 80px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    border-radius: 4px 4px 0 0;

    button {
      display: flex;
      flex-direction: column;
      flex: 1;
      align-items: center;
      justify-content: center;
      position: relative;
      padding-bottom: 9px;

      &:hover {
        opacity: 0.6;
      }

      & + button {
        border-left: 1px solid #a8a8a8;
      }

      span {
        font-size: 9px;
        line-height: 10px;
        color: #ffffff;
        position: absolute;
        bottom: 2px;
      }
    }
  }

  > div {
    background-color: #fff;
    margin-top: 80px;
    padding: 32px 28px;
  }
`;
