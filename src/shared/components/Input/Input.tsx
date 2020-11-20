import React, { InputHTMLAttributes } from "react";

import { Container, CustomInput } from "./styles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rightIcon?: React.ReactNode;
  bordered?: boolean;
  borderBottomOnly?: boolean;
  labelOnInput?: string;
  containerClass?: string;
  inputClass?: string;
}

const Input: React.FC<InputProps> = ({
  rightIcon: RightIcon,
  bordered = false,
  borderBottomOnly = false,
  labelOnInput = false,
  containerClass = "",
  inputClass = "",
  ...rest
}) => {
  return (
    <Container
      rightIcon={!!RightIcon}
      className={containerClass}
      bordered={bordered}
      borderBottomOnly={borderBottomOnly}
      labelOnInput={!!labelOnInput}
    >
      {!!labelOnInput && <span>{labelOnInput}</span>}
      <CustomInput rightIcon={!!RightIcon} className={inputClass} {...rest} />
      {!!RightIcon && RightIcon}
    </Container>
  );
};

export default Input;
