import styled from "styled-components";
import { Modal as BSModal } from "react-bootstrap";

export const Modal = styled(BSModal)`
  .modal-dialog {
    max-width: 700px;
  }

  &.modal {
    z-index: 1070;
  }
`;

export const Container = styled.div`
  width: 700px;
  background-color: #f0efec;
  border-radius: 4px;
  position: relative;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;

  .borderedContainer {
    border: 1px solid #a8a8a8;
    border-radius: 4px;
    padding: 16px 16px;
    position: relative;

    & + .borderedContainer {
      margin-top: 24px;
    }

    > label {
      color: #18325c;
      font-size: 21px;
      line-height: 24px;
      margin-bottom: 0px;
      position: absolute;
      top: -16px;
      left: 16px;
      padding: 0 4px;
      background-color: #f0efec;
    }
  }

  .borderedContainer + .darkBlueButton {
    margin-top: 16px;
    margin-left: auto;
  }

  .userDataContainer {
    .nameInputsRow {
      display: flex;

      .inputContainer {
        flex: 1;
      }
    }

    > .inputRowGroup {
      display: flex;
      margin-top: 8px;

      .inputContainer + .inputContainer {
      }

      > .inputContainer:first-child {
        flex: 2;
      }
    }

    > div:last-child {
      display: flex;
      margin-top: 8px;

      > section {
        flex: 1;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        position: relative;

        /* Telefone */
        &:first-child {
          border-right: 1px solid #a8a8a8;
          padding-right: 8px;
        }

        /* Email */
        &:last-child {
          padding-left: 8px;

          > .darkBlueButton {
            margin-top: 40px;
          }
        }

        > h5 {
          font-weight: 400;
          color: #18325c;
          font-size: 21px;
          line-height: 24px;
          margin-bottom: 12px;
        }

        > .inputContainer {
          & + .inputContainer {
            margin-top: 4px;
          }

          input {
            padding-left: 0;
          }
        }

        > .darkBlueButton {
          margin-top: 12px;
          margin-left: auto;
        }

        .phoneTypeRadio {
          position: absolute;
          z-index: 1;
          right: 8px;
          top: 32px;

          .form-check {
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            & + .form-check {
              margin-top: 4px;
            }

            input {
              height: 12px;
              position: relative;
              margin: 0;
              margin-left: 4px;
            }

            label {
              font-size: 12px;
              line-height: 12px;
            }
          }
        }

        > .form-check {
          margin-top: 4px;
        }
      }
    }
  }

  .extraInfoContainer {
    margin-top: 24px;
    padding-top: 8px;
    border-top: 1px solid #000;
    display: flex;
    flex-direction: column;

    .inputContainer {
      flex: 1;

      input,
      select {
        padding-left: 0;
      }
    }

    .separatedInputRow {
      display: flex;

      & + .separatedInputRow {
        margin-top: 12px;
      }

      .inputContainer + .inputContainer {
        margin-left: 16px;
      }

      .darkBlueButton {
        margin-left: 16px;
      }
    }

    .documentsContainer {
      display: flex;
      flex-direction: column;

      > button {
        margin-top: 16px;
        margin-left: auto;
      }
    }

    h5 {
      color: #18325c;
      font-size: 21px;
      line-height: 24px;
      font-weight: 400;
      margin-left: 24px;
      margin-bottom: 24px;
    }
  }
`;
