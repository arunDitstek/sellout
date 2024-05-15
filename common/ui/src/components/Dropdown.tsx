import React from "react";
import styled from "styled-components";
import { Colors } from "../Colors";
import Icon, { Icons } from "./Icon";
import Label from "./Label";
import Flex from "./Flex";
import * as Polished from "polished";

type ContainerProps = {
  width?: string;
  open: boolean;
  height: string;
};

const Container = styled.div<ContainerProps>`
  position: relative;
  height: ${(props) =>
    props.open ? (props.height ? props.height : "65px") : "65px"};
  width: ${(props) => props.width};
`;

type FieldContainerProps = {
  open: boolean;
  width: string;
  height: string;
};

const FieldContainer = styled.div<FieldContainerProps>`
  position: absolute;
  max-height: ${(props) => (props.open ? props.height : "38px")};
  width: ${(props) => props.width};
  background-color: ${Colors.White};
  border: 1px solid ${Colors.Grey5};
  box-sizing: border-box;
  border-radius: 8px;
  transition: all 0.2s;
  z-index: ${(props) => (props.open ? 100 : 0)};
  box-shadow: ${(props) =>
    props.open ? "0px 4px 16px rgba(0, 0, 0, 0.05)" : ""};
  overflow: hidden;
  outline: none;

  &:hover {
    cursor: pointer;
    border: 1px solid ${Polished.darken(0.05, Colors.Grey5)};
  }

  &:focus {
    border: 1px solid ${Colors.Grey4};
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 15px;
`;

const Value = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  font-family: "neue-haas-grotesk-display", sans-serif;
  font-weight: 500;
  margin-right: 10px;
  white-space: nowrap;
`;

type ItemsContainerProps = {
  open: boolean;
  height: string;
};

const ItemsContainer = styled.div<ItemsContainerProps>`
  position: relative;
  max-height: ${(props) => (props.open ? props.height : "0px")};
  overflow: ${(props) => (props.open ? "scroll" : "hidden")};
`;

type ItemProps = {
  selected: boolean;
};

const Item = styled.div<ItemProps>`
  position: relative;
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 15px;
  background-color: ${(props) =>
    props.selected ? Colors.Grey7 : Colors.White};
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  transition: all 0.2s;

  &:hover {
    cursor: pointer;
    background-color: ${Colors.Grey7};
  }
`;

export interface IDropdownItem {
  text: string;
  value: any;
  icon?: React.ReactNode;
  color?: string;
}

export enum DropdownTypes {
  Regular = "Regular",
  Small = "Small",
}

type DropdownProps = {
  type?: DropdownTypes;
  value?: string;
  onChange: Function;
  placeholder?: string;
  width?: string;
  items: IDropdownItem[];
  label?: string;
  tip?: string;
  icon?: React.ReactNode;
  height?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  // type = DropdownTypes.Regular,
  value,
  onChange,
  width = "auto",
  items,
  label,
  tip,
  icon,
  height = "65px",
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Container width={width} open={open} height={height}>
      {label && <Label text={label} tip={tip} />}
      <FieldContainer
        tabIndex={1}
        open={open}
         height={items?.length > 4 ? "130px" : `${items?.length * 30 + 43}px`}
        width={width}
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
      >
        <TopRow>
          <Flex align="center">
            {icon && icon}
            <Value>{value}</Value>
          </Flex>
          <Icon icon={Icons.Sort} size={12} color={Colors.Grey1} />
        </TopRow>
        <ItemsContainer
          open={open}
          height={items?.length > 3 ? "90px" : `${items?.length * 30}px`}
        >
          {items?.map((item, index) => {
            return (
              <Item
                key={index}
                selected={false} // don't hightlight selected item in dropdown
                onClick={() => onChange(item.value)}
              >
                {item.icon && item.icon}
                {item.text}
              </Item>
            );
          })}
        </ItemsContainer>
      </FieldContainer>
    </Container>
  );
};

export default Dropdown;
