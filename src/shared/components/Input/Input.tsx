import React, {
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormControl, FormControlProps } from "react-bootstrap";
import InputMask, { Props as MaskedProps } from "react-input-mask";
import { Container } from "./styles";

interface InputProps
  extends Omit<FormControlProps, "size">,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      "name" | "placeholder" | "onBlur" | "onKeyPress" | "required"
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
  isValidated?: boolean;
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
  isValidated,
  as,
  ...rest
}) => {
  const inputRef = useRef<any>(null);

  const [isValid, setIsValid] = useState(true);

  const valid = inputRef.current ? inputRef.current.validity.valid : true;

  useEffect(() => {
    if (inputRef.current) {
      const { valid } = inputRef.current.validity;

      setIsValid(valid);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current && isValidated) {
      const { value } = inputRef.current;

      if (masked && maskProps) {
        const placeholder = (maskProps.mask as string).split("9").join("_");
        const isEmpty = value === placeholder;

        if (isValid && isEmpty) {
          setIsValid(false);
        }
      }

      if (isValid !== valid) {
        if (masked && maskProps) {
          const placeholder = (maskProps.mask as string).split("9").join("_");
          const isEmpty = value === placeholder;

          if (!isValid && isEmpty) {
          } //

          if (isValid && !isEmpty) {
          } //
          else if (!isEmpty) {
            setIsValid(true);
          }

          // console.log(inputRef.current);
        } //
        else {
          setIsValid(valid);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, isValidated, maskProps, maskProps, masked]);

  useEffect(() => {
    if (inputRef.current) {
      // inputRef.current.blur();
      inputRef.current.focus();
    }
  }, []);

  const borderClass = useMemo(() => {
    if (bordered) {
      return "bordered";
    }

    if (borderBottomOnly) {
      return "borderBottomOnly";
    }

    return "";
  }, [bordered, borderBottomOnly]);

  return (
    <Container
      rightIcon={!!RightIcon}
      className={`inputContainer ${containerClass} ${borderClass}`}
      bordered={bordered}
      borderBottomOnly={borderBottomOnly}
      labelOnInput={!!labelOnInput}
      size={size}
      isValid={isValidated ? isValid : true}
    >
      {!!labelOnInput && <span>{labelOnInput}</span>}

      {customInput ? (
        customInput
      ) : masked ? (
        <InputMask
          formNoValidate={true}
          className={`form-control ${inputClass}`}
          mask=""
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          {...rest}
          {...maskProps}
        />
      ) : (
        <FormControl
          as={as}
          ref={inputRef}
          rows={2}
          className={inputClass}
          {...rest}
        />
      )}

      {!!RightIcon && <button onClick={onRightIconClick}>{RightIcon}</button>}
    </Container>
  );
};

export default Input;
