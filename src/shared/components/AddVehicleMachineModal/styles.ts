import styled from "styled-components";
import { Modal as BSModal } from "react-bootstrap";
import colors from "assets/colors";

export const Modal = styled(BSModal)`
  .modal-dialog {
    max-width: 850px;
  }

  &.modal {
    z-index: 1060;
  }
`;

export const Container = styled.div`
  width: 850px;
  border-radius: 4px;
  position: relative;
  padding: 32px 16px 16px;
  display: flex;
  flex-direction: column;

  .borderedContainer {
    border: 1px solid #a8a8a8;
    border-radius: 4px;
    padding: 32px 16px 24px;
    position: relative;
    display: flex;

    > div:nth-child(2) {
      flex: 2;
      padding-right: 8px;
    }

    > div:last-child {
      border-left: 1px solid;
      flex: 1;
      padding-left: 8px;

      .attributeListContainer {
        .attributeListTitle {
          background-color: #fff;
        }
      }
    }

    > h6 {
      background-color: ${colors.darkBlue};
      display: inline-block;
      padding: 6px 12px;
      color: #fff;
      font-weight: 400;
      position: absolute;
      top: -19px;
      left: 16px;
      line-height: 24px;
    }

    .inputContainer + .inputContainer {
      margin-top: 8px;
    }
  }

  > .darkBlueButton {
    margin-top: 16px;
    margin-left: auto;
  }
`;
