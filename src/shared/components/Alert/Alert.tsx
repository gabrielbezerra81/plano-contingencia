import React from "react";
import { Modal, Button } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";

interface AlertProps {
  positiveText?: string;
  negativeText?: string;
  title: string;
  message?: string;
  onPositiveClick: (...data: any) => any;
  onNegativeClick?: (...data: any) => any;
}

const Alert = ({
  positiveText = "Sim",
  negativeText = "Não",
  title,
  message = "",
  onPositiveClick,
  onNegativeClick = () => {},
}: AlertProps) => {
//   const a = (
//     <Modal
//       ref={(ref: any) => {
//         console.log(ref);
//       }}
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Modal heading</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary">Close</Button>
//         <Button variant="primary">Save Changes</Button>
//       </Modal.Footer>
//     </Modal>
//   );

  confirmAlert({
    title,
    message,
    buttons: [
      {
        label: positiveText,
        onClick: onPositiveClick,
      },
      {
        label: negativeText,
        onClick: onNegativeClick,
      },
    ],
  });
};

export default Alert;
