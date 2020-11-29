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

  > div {
    > .menuItem {
      padding: 12px;
      border-bottom: 1px solid #919191;
      width: 100%;
      text-align: left;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.6;
      }

      h6 {
        color: #a8a8a8;
        font-weight: 400;
      }
    }

    > .menuItem:first-child {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:hover {
        opacity: 1;
      }

      button {
        position: absolute;
        left: 8px;

        &:hover {
          opacity: 0.6;
        }

        img {
          height: 30px;
        }
      }
    }
  }
`;
