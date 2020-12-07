interface FormatProps {
  value: any;
  precision?: number;
  fromSeparator?: string;
  toSeparator?: string;
  isInputValue?: boolean;
  stringToNumber?: boolean;
}

const numberFormatter = ({
  value,
  precision = 2,
  fromSeparator,
  toSeparator,
  isInputValue = false,
  stringToNumber = false,
}: FormatProps) => {
  if (!isInputValue) {
    if (stringToNumber) {
      const formatted = Number(value.split(".").join("").replace(",", "."));

      return formatted;
    } //
    else {
      const formatted = Number(value).toLocaleString("pt-BR", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      });

      return formatted;
    }
  } //
  else if (fromSeparator && toSeparator) {
    let formatted: any = value.split(fromSeparator);
    if (formatted[1] && formatted[1].length === 1) {
      //value[1] = value[1] * 10;
    }
    formatted = formatted.join("");

    if (formatted.length > 2) {
      formatted =
        formatted.substring(0, formatted.length - precision) +
        toSeparator +
        formatted.substring(formatted.length - precision, formatted.length);

      return formatted;
    }
    if (formatted.length > 1) {
      formatted =
        formatted.substring(0, formatted.length - 1) +
        toSeparator +
        formatted.substring(formatted.length - 1, formatted.length);
      return formatted;
    }

    return formatted;
  }

  return "";
};

export default numberFormatter;
