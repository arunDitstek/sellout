import React from "react";
import styled from "styled-components";
import { Colors } from '../Colors';

type ContainerProps = {
  isMax: boolean;
};

const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${(props) => (props.isMax ? Colors.Red : Colors.Grey3)};
  margin-bottom: 10px;
`;

type MaxLengthProps = {
  value: string;
  maxLength: number;
};

const MaxLength: React.FC<MaxLengthProps> = ({ value, maxLength }) => {
  return (
    <Container isMax={value?.length === maxLength}>
      {value?.length}/{maxLength}
    </Container>
  );
};

export default MaxLength;
