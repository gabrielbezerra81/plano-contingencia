import React, {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Form, FormControlProps } from "react-bootstrap";
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
  errorMessage?: string;
  hasError?: boolean;
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
  errorMessage = "",
  hasError = false,
  onChange,
  ...rest
}) => {
  const inputRef = useRef<any>(null);

  const [isValid, setIsValid] = useState(true);

  const valid = inputRef.current ? inputRef.current.validity.valid : true;

  const handleInputChange = useCallback(
    (e) => {
      if (e.target.name === "cep") {
        e.target.value = e.target.value.trimEnd();
      }

      if (onChange) {
        onChange(e);
      }
    },
    [onChange]
  );

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

  const errorStyle = useMemo(() => {
    return {
      opacity: hasError && errorMessage ? 1 : 0,
    };
  }, [hasError, errorMessage]);

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
          onChange={handleInputChange}
        />
      ) : (
        <Form.Control
          as={as}
          ref={inputRef}
          rows={2}
          className={inputClass}
          {...rest}
        />
      )}

      {!!RightIcon && <button onClick={onRightIconClick}>{RightIcon}</button>}

      {!!errorMessage && (
        <span style={errorStyle} className="inputErrorMessage">
          {errorMessage}
        </span>
      )}
    </Container>
  );
};

export default Input;
