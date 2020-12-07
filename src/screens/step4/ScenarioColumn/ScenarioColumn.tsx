import React, { useMemo } from "react";
import { FiPlus } from "react-icons/fi";

import { Container } from "./styles";

interface Props {
  containerClassName?: string;
  headerTitle?: string;
  onClickHeader?: (...data: any) => any;
}

const ScenarioColumn: React.FC<Props> = ({
  children,
  containerClassName = "",
  headerTitle = "",
  onClickHeader = () => {},
}) => {
  const title = useMemo(() => {
    if (headerTitle) {
      const lines = headerTitle.split("\n");
      return (
        <h6>
          {lines.map((line) => (
            <>
              {line}
              <br />
            </>
          ))}
        </h6>
      );
    }
    return "";
  }, [headerTitle]);

  return (
    <Container className={`scenarioColumn ${containerClassName}`}>
      <button onClick={onClickHeader}>
        <header>
          <FiPlus />

          {title}
        </header>
      </button>
      <main>{children}</main>
    </Container>
  );
};

export default ScenarioColumn;
