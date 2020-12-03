import React, { useCallback, useEffect, useMemo } from "react";
import NumberFormat from "react-number-format";
import numberFormatter from "shared/utils/numberFormatter";
import usePrevious from "shared/utils/usePrevious";

interface Props {
  precision?: number;
  type: "preco" | "quantidade" | "negativeDecimal";
  placeholder?: string;
  readOnly?: boolean;
  step: number;
  className?: string;
  onChange: (...data: any) => any;
  value: any;
  autoSelect?: boolean;
  onBlur?: (...data: any) => any;
  onKeyPress?: (...data: any) => any;
  allowNegative?: boolean;
  name?: string;
}

const NumberInput: React.FC<Props> = ({
  precision = 2,
  type,
  placeholder = "",
  readOnly = false,
  step,
  className = "",
  onChange,
  value,
  autoSelect = false,
  onBlur = () => {},
  onKeyPress = () => {},
  allowNegative = false,
  name,
}) => {
  const handleChange = useMemo(() => {
    return readOnly ? () => {} : onChange;
  }, [onChange, readOnly]);

  const onUp = useCallback(() => {
    let valorAnterior = value;

    let resultado;

    //Tira todos os pontos e vírgulas do número e o transforma em um número decimal com ponto com separador
    if (["negativeDecimal", "quantidade"].includes(type))
      valorAnterior = valorAnterior
        .toString()
        .split(".")
        .join("")
        .replace(",", ".");

    resultado = Number(Number(valorAnterior) + Number(step));

    if (type === "preco" || type === "negativeDecimal") {
      resultado = Number(resultado).toFixed(precision);
    }
    if (type === "negativeDecimal") {
      resultado = resultado.toString().replace(".", ",");
    }
    handleChange(resultado);
  }, [value, type, step, handleChange, precision]);

  const onDown = useCallback(() => {
    let valorAnterior = value;
    if (valorAnterior > 0 || allowNegative) {
      let resultado;

      if (["negativeDecimal", "quantidade"].includes(type))
        valorAnterior = valorAnterior
          .toString()
          .split(".")
          .join("")
          .replace(",", ".");

      resultado = Number(Number(valorAnterior) - step);
      if (type === "preco" || type === "negativeDecimal") {
        resultado = resultado.toFixed(precision);
      }
      if (type === "negativeDecimal") {
        resultado = resultado.toString().replace(".", ",");
      }
      handleChange(resultado);
    }
  }, [allowNegative, handleChange, precision, step, type, value]);

  const previousStep = usePrevious(step);

  useEffect(() => {
    if (previousStep && previousStep !== step) {
      const newValue = validateValueOnPrecisionChange({
        previousStep,
        step,
        value,
      });

      handleChange(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, value, handleChange]);

  return (
    <NumberFormat
      placeholder={placeholder}
      className={`form-control ${className}`}
      name={name}
      thousandSeparator="."
      decimalSeparator=","
      value={value}
      type="text"
      onChange={(event) => handleChange(event.target.value, event)}
      onKeyPress={(event) => {
        const selection = document.getSelection();

        if (event.key !== "-" && (!selection || !selection.toString()))
          event.currentTarget.value = numberFormatter({
            value: event.currentTarget.value,
            precision: precision - 1,
            fromSeparator: ",",
            toSeparator: ",",
            isInputValue: true,
          });
      }}
      onFocus={(event) => {
        if (autoSelect) event.target.select();
      }}
      onKeyUp={(event) => {
        if (event.key === "ArrowUp") {
          onUp();
        } else if (event.key === "ArrowDown") {
          onDown();
        }
      }}
    />
  );
};

export default NumberInput;

//Fazer replace de todos os pontos em QTDE
export const boxShadowInput = (classe: string) => {
  const activeElement = document.activeElement;

  if (!activeElement) {
    return "";
  }

  return activeElement.className.includes(classe) ? "inputFocado" : "";
};

interface ValidateProps {
  previousStep: number;
  step: number;
  value: any;
}

const validateValueOnPrecisionChange = ({
  previousStep,
  step,
  value,
}: ValidateProps) => {
  let newValue = value;

  const [, fractionDigits] = step.toString().split(".");

  const precision = fractionDigits ? fractionDigits.length : 0;

  if (step < previousStep) {
    newValue = newValue * 1;
  } else {
    newValue = +Number(newValue).toFixed(precision);
  }
  return newValue;
};
