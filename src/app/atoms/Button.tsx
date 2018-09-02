import styled from "styled-components";

export default styled.button`
  display: inline-block;
  padding: 0.5rem;
  border: 2px solid #e3e3e3;
  border-radius: 3px;
  color: #000;
  background: transparent;
  min-width: 4rem;

  &:disabled {
    opacity: 0.3;
  }
`;
