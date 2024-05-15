import React from 'react';
import styled from 'styled-components';
import { Colors } from "../Colors";
import Icon, { Icons } from './Icon';
import { FadeIn } from './Motion';

const ValidationErrorRelative = styled.div`
  position: relative;
`;

const ValidationErrorAbsolute = styled.div`
  position: absolute;
  z-index: 700;
  width: fit-content;
  height: 50px;
`;

const ValidationErrorBox = styled.div`
  background: ${Colors.White};
  border: 1px solid ${Colors.Grey5};
  box-sizing: border-box;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  margin-top: 5px;
  padding:  10px 15px;
  width: fit-content;
  justify-content: center;
`;

const ValidationErrorText = styled.div`
  margin-left: 10px;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

type ValidationErrorProps = {
  validationError: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ validationError}) => {
  return (
    <ValidationErrorRelative>
      <ValidationErrorAbsolute>
        <FadeIn>
          <ValidationErrorBox>
            <Icon icon={Icons.Warning} size={16} color={Colors.Yellow} />
            <ValidationErrorText>{validationError}</ValidationErrorText>
          </ValidationErrorBox>
        </FadeIn>
      </ValidationErrorAbsolute>
    </ValidationErrorRelative>
  );
};

export default ValidationError;
