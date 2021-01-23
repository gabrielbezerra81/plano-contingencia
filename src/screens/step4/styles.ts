import styled, { css } from "styled-components";

export const Container = styled.div`
  padding-top: 120px;

  div.titleContainer {
    /* display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 120px;
    left: 550px;
    position: sticky; */

    /* max-width: 230px;
    width: 100%;
    margin: 0 auto;
    position: -webkit-sticky;
    position: sticky;
    left: 550px;
   */

    position: fixed;
    top: 80px;
    width: 330px;
    margin: 0 calc(50vw - 330px);

    @media (max-width: 1230px) {
      left: 453px;
      margin: 0;
    }

    > h4 {
      text-align: center;
      color: #212121;
      white-space: nowrap;
      /* position: fixed; */
      /* margin: 32px auto 0; */
    }
  }

  > .inputContainer {
    /* width: 350px;
    margin: 0 auto;
    left: 0;
    right: 0;
    position: fixed;
    top: 112px; */

    position: fixed;
    top: 120px;
    width: 330px;
    margin: 0 calc(50vw - 330px);

    @media (max-width: 1230px) {
      left: 453px;
      margin: 0;
    }
  }

  > .buttonsContainer {
    margin-top: 32px;
  }
`;

interface ItemListingTextProps {
  included: boolean;
}

export const ItemListingText = styled.h6<ItemListingTextProps>`
  color: #3d3d3d;
  font-size: 12px;
  line-height: 14px;
  margin-top: 10px;
  font-weight: 400;
  transition: color 0.2s;

  ${({ included }) =>
    included &&
    css`
      color: #ff7802;
    `}
`;
