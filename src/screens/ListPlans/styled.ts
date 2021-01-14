import styled from "styled-components";

export const Container = styled.div`
  padding-top: 16px;

  div {
    & + div {
      margin-top: 16px;
    }

    h5 {
      font-weight: 700;
      border-bottom: 1px solid #222;
      padding-bottom: 4px;
      margin-bottom: 4px;
    }

    span {
    }
  }
`;
