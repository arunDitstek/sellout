import React from "react";
import styled from "styled-components";
import { Colors } from "../Colors";
import Tip from './Tip';

type ContainerProps = {
  margin: string;
};

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: ${(props) => props.margin};
  height: 15px;
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  //margin-right: 7px;
`;

const SubText = styled.span`
  color: ${Colors.Grey3};
`;

type LabelProps = {
  text: string
  subText?: string
  tip?: string;
  margin?: string;
};

const Label: React.FC<LabelProps> = ({ text, subText, tip, margin = '0 0 8px' }) => {
  return (
    <Container margin={margin}>
      <Text>
        {text}
        {subText && <SubText>&nbsp;{subText}</SubText>}
      </Text>
      {tip && (
        <Tip tip={tip}/>
      )}
    </Container>
  );
};

export default Label;
