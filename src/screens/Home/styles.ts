import styled from "styled-components";

export const Container = styled.div`
  background-color: #fff;
  height: calc(100vh - 24px);
  margin: 12px 6px 12px 12px;

  display: flex;

  > main {
    flex: 1;
    padding: 16px 24px 0;
    display: flex;
    flex-direction: column;
  }
`;
