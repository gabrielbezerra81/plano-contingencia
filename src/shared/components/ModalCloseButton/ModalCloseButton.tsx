import React, { useCallback } from "react";
import { FiX } from "react-icons/fi";

interface Props {
  setShow: (show: any) => any;
}

const ModalCloseButton: React.FC<Props> = ({ setShow }) => {
  const handleCloseModal = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <button onClick={handleCloseModal} style={buttonStyle}>
      <FiX color="#fff" />
    </button>
  );
};

export default ModalCloseButton;

const buttonStyle: React.CSSProperties = {
  position: "absolute",
  top: -20,
  right: -24,
};
