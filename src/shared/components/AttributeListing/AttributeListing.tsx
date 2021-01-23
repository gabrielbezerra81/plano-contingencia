import React from "react";
import { FiXCircle, FiEdit } from "react-icons/fi";

import { Container } from "./styles";

interface Props {
  items: any[];
  title: string;
  onRemove: (...data: any[]) => any;
  name: string;
  renderText?: (data: any) => string;
  containerClass?: string;
  size?: "small" | "normal";
  showCloseButton?: boolean;
  numeration?: boolean;
  showEditButton?: boolean;
  editButtonName?: string;
  onEdit?: (...data: any[]) => any;
}

const AttributeListing: React.FC<Props> = ({
  items,
  title,
  onRemove,
  name,
  renderText,
  containerClass,
  size = "normal",
  showCloseButton = true,
  children,
  numeration = false,
  showEditButton = false,
  editButtonName = "",
  onEdit = () => {},
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
              <FiXCircle />
            </button>
          )}

          {showEditButton && (
            <button name={editButtonName} onClick={(e) => onEdit(e, index)}>
              <FiEdit size={15} />
            </button>
          )}

          {!!renderText && (
            <span>
              {numeration && (
                <>
                  <span className="numeration">{`${index + 1}`}</span>
                  <span> - </span>
                </>
              )}

              {renderText(item)}
            </span>
          )}
          {!!children &&
            typeof children === "function" &&
            children(index, item)}
        </div>
      ))}
    </Container>
  );
};

export default AttributeListing;
