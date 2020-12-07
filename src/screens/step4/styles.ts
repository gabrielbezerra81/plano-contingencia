import styled, { css } from "styled-components";

export const Container = styled.div`
  display: inline-flex;
  padding: 56px 24px 0 0;

  > .locationRiskColumn {
    min-width: 230px;
  }
`;

interface ItemListingTextProps {
  included: boolean;
}

export const ItemListingText = styled.h6<ItemListingTextProps>`
  color: #3d3d3d;
  font-size: 12px;
  line-height: 14px;
  margin-top: 16px;
  font-weight: 400;
  transition: color 0.2s;

  ${({ included }) =>
    included &&
    css`
      color: #ff7802;
    `}
`;
