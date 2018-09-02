import styled from "styled-components";

export default styled.div`
  & > button {
    margin-left: 3px;
    margin-right: 3px;
  }

  & > button:first-child {
    margin-left: 0;
  }

  & > button:last-child {
    margin-right: 0;
  }
`;
