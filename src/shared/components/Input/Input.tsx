import React, { InputHTMLAttributes } from "react";
import { FormControl, FormControlProps } from "react-bootstrap";
import { Container } from "./styles";

interface InputProps
  extends FormControlProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      "name" | "placeholder" | "onBlur" | "onKeyPress"
    > {
  rightIcon?: React.ReactNode;
  bordered?: boolean;
  borderBottomOnly?: boolean;
  labelOnInput?: string;
  containerClass?: string;
  inputClass?: string;
  customInput?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  rightIcon: RightIcon,
  bordered = false,
  borderBottomOnly = false,
  labelOnInput = false,
  containerClass = "",
  inputClass = "",
  customInput,
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

      {customInput ? (
        customInput
      ) : (
        <FormControl className={inputClass} {...rest} />
      )}

      {!!RightIcon && RightIcon}
    </Container>
  );
};

export default Input;
