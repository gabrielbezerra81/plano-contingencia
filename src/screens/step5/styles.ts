import styled from "styled-components";

export const Container = styled.div`
  padding: 0 0 16px;

  > h3 {
    text-align: center;
    color: #212121;
    margin: 0 -24px 0;
    padding: 8px 0;

    border: 1px solid #000;
    border-left: none;
    border-right: none;

    & + h3 {
      margin-top: 54px;
    }
  }
`;
