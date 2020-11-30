import React, { InputHTMLAttributes } from "react";
import { FormControl, FormControlProps } from "react-bootstrap";
import InputMask, { Props as MaskedProps } from "react-input-mask";
import { Container } from "./styles";

interface InputProps
  extends Omit<FormControlProps, "size">,
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
  size?: "small" | "normal";
  masked?: boolean;
  maskProps?: MaskedProps;
  onRightIconClick?: (...data: any) => any;
}

const Input: React.FC<InputProps> = ({
  rightIcon: RightIcon,
  bordered = false,
  borderBottomOnly = false,
  labelOnInput = false,
  containerClass = "",
  inputClass = "",
  customInput,
  size = "normal",
  masked = false,
  maskProps,
  onRightIconClick = () => {},
  ...rest
}) => {
  return (
    <Container
      rightIcon={!!RightIcon}
      className={`inputContainer ${containerClass}`}
      bordered={bordered}
      borderBottomOnly={borderBottomOnly}
      labelOnInput={!!labelOnInput}
      size={size}
    >
      {!!labelOnInput && <span>{labelOnInput}</span>}

      {customInput ? (
        customInput
      ) : masked ? (
        <InputMask className={inputClass} mask="" {...rest} {...maskProps} />
      ) : (
        <FormControl className={inputClass} {...rest} />
      )}

      {!!RightIcon && <button onClick={onRightIconClick}>{RightIcon}</button>}
    </Container>
  );
};

export default Input;
