import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Colors } from '../Colors';

type ContainerProps = {
  margin?: string;
}
const Container = styled.div<ContainerProps>` 
  margin: ${props => props.margin};
`;

const Input = styled.input`
  border: 2px solid ${Colors.Grey5};
  height: 70px;
  width: 55px;
  border-radius: 10px;
  background-color: white;
  transition: all 0.1s;
  margin-right: 10px;
  outline: 0px;
  font-size: 24px;
  text-align: center;
  padding: 0px;
  box-shadow: none;
  -moz-appearance: textfield;

  &:focus {
    border: 2px solid ${Colors.Grey1};
  }

  &::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

type CodeInputProps = {
  length: number;
  onChange: Function;
  onComplete: Function;
  resetCode?: boolean;
}
const CodeInput: React.FC<CodeInputProps> = ({
  onChange,
  onComplete,
  length = 4,
  resetCode = false
}) => {
  const [value, setValue] = useState<Array<string>>(new Array(length).fill(''));
  useEffect(() => {
    if (resetCode) {
      setValue(new Array(length).fill(''))
    }
  }, [resetCode]);

  const inputs: any[] = [];



  const change = (valueAt: any, index: any) => {
    const currentValue = [...value];
    if (valueAt.length > 1) {
      valueAt = valueAt.substring(1);
    }
    // Single Character Press
    if (valueAt.length === 1) {
      currentValue[index] = valueAt;
      setValue(currentValue);
      if (inputs[index + 1]) {
        inputs[index + 1].focus();
      }
    } else if (valueAt.length === length) { //code pasted
      setValue(valueAt.split(''));
      onComplete(valueAt);
      if (inputs[index + 1]) {
        inputs[index + 1].focus();
      }
    } else if (valueAt.length > 0 && valueAt.length < length) { // More than 1 character, less than the total number required
     
      change(valueAt.charAt(valueAt.length - 1), index);
    }

    if (index + 1 === length) {
      onComplete(currentValue.join(''));
    }
  }

  useEffect(() => {
    onChange && onChange(value)
  }, [value])

  const renderInput = (index: any) => {
    const curValue = value[index];
    return (
      <Input
        key={index}
        autoFocus={index === 0}
        value={curValue}
        type="number"
        pattern="\d*"
        ref={(ref) => inputs[index] = ref}
        onChange={(event) => {
          onChange();
          change(event.target.value, index);
        }}
        onKeyDown={(event) => {
          if (event.keyCode === 8 || event.keyCode === 46) { // handle backspace or delete
            event.preventDefault();
            const currentValue = [...value];
            currentValue[index] = '';
            setValue(currentValue);
            if (index !== 0) {
              inputs[index - 1].focus();
            }
          } else if (event.keyCode === 37) { // navigate left with left arrow key
            event.preventDefault();
            if (index !== 0) {
              inputs[index - 1].focus();
            }
          } else if (event.keyCode === 39) { // navigate right with right arrow key
            event.preventDefault();
            if (index !== value.length - 1) {
              inputs[index + 1].focus();
            }
          } else if ( // prohibit weird behavior when up, down, +, or - are pressed
            event.keyCode === 38
            || event.keyCode === 40
            || event.keyCode === 107
            || event.keyCode === 109) {
            event.preventDefault();
          }
        }}
      />
    );
  }

  return (
    <Container>
      {value.map((_, index) => {
        return renderInput(index);
      })}
    </Container>
  );
}

export default CodeInput;
