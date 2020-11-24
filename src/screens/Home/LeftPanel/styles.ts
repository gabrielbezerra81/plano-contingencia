import styled from "styled-components";

export const Container = styled.div`
  background-color: #212121;
  min-height: calc(100vh - 24px);
  width: 300px;

  header {
    background-color: #fff;
    height: 80px;
    margin-right: 4px;
    padding: 0 12px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    img {
      width: 50px;
    }
  }
`;
