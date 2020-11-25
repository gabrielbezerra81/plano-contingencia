import styled from "styled-components";

export const Container = styled.div`
  min-height: calc(100vh - 24px);
  margin: 12px 6px 12px 12px;
  display: flex;

  > main {
    padding: 16px 24px 0;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    overflow: auto;
    min-width: 550px;
    flex: 1;
  }
`;
