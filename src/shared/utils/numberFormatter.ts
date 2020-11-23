interface FormatProps {
  value: string;
  precision: number;
  fromSeparator: string;
  toSeparator: string;
}

const numberFormatter = ({
  value,
  precision,
  fromSeparator,
  toSeparator,
}: FormatProps) => {
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
};

export default numberFormatter;
