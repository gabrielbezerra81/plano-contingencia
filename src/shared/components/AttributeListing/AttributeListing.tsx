import React from "react";
import { FiXCircle } from "react-icons/fi";

import { Container } from "./styles";

interface Props {
  items: any[];
  title: string;
  onRemove: (...data: any[]) => any;
  name: string;
  renderText?: (data: any) => string;
  textComponent?: React.ReactNode;
  containerClass?: string;
  size?: "small" | "normal";
  showCloseButton?: boolean;
}

const AttributeListing: React.FC<Props> = ({
  items,
  title,
  onRemove,
  name,
  renderText,
  textComponent,
  containerClass,
  size = "normal",
  showCloseButton = true,
}) => {
  return (
    <Container
      size={size}
      className={`attributeListContainer ${containerClass}`}
    >
      <small className="attributeListTitle">{title}</small>

      {items.map((item, index) => (
        <div key={index} className="attributeListItem">
          {showCloseButton && (
            <button name={name} onClick={(e) => onRemove(e, index)}>
              <FiXCircle></FiXCircle>
            </button>
          )}

          {!!renderText && <span>{renderText(item)}</span>}
          {!!textComponent && textComponent}
        </div>
      ))}
    </Container>
  );
};

export default AttributeListing;
