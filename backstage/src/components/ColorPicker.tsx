import React from 'react';
import styled from 'styled-components';
import { SketchPicker } from 'react-color';

const Container = styled.div`

`;

type ColorPickerProps = {
  color?: string;
  onChange: Function;
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
}) => {
  return (
    <Container>
      <SketchPicker
        color={color}
        onChange={color => onChange(color)}
      />
    </Container>
  );
};

export default ColorPicker;