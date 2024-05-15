import React from "react";
import styled from "styled-components";
import { Colors } from "../Colors";
import { IconEnum } from "./Icons";
import Icon from "./Icon";
import Label from './Label';

type ContainerProps = {
  hasLabel: boolean;
}

interface ISearchDropdownItem {
  text: string;
  value: any;
}


const Container = styled.div<ContainerProps>`
  position: relative;
  height: ${(props) => (props.hasLabel ? "65px" : "40px")};
`;

type InnerProps = {
  open: boolean;
  width: string;
};

const Inner = styled.div<InnerProps>`
  position: absolute;
  height: ${(props) => (props.open ? "187px" : "38px")};
  width: ${(props) => props.width};
  background-color: ${Colors.White};
  border: 1px solid ${Colors.Grey5};
  box-sizing: border-box;
  border-radius: 8px;
  transition: all 0.2s;
  z-index: ${props => props.open ? 100 : 0};
  box-shadow: ${props => props.open ? '0px 4px 16px rgba(0, 0, 0, 0.05)' : ''};
  overflow: hidden;

  &:focus, &:active {
    /* border: 0px; */
    outline: 0px;
  }
`;

const TopRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 38px;
  padding: 0 16px;
  z-index: 100;
  background-color: ${Colors.White};
`;

const Input = styled.input`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  border: 0px;
  outline: 0px;
  width: calc(100% - 30px);
  margin-left: 8px;
  height: 38px;
  font-family: "neue-haas-grotesk-display", sans-serif;
  font-weight: 500;
  padding: 0;

  ::placeholder {
    color: ${Colors.Grey4};
  }
`;

export type ItemsContainerProps = {
  footer: boolean;
};

const ItemsContainer = styled.div<ItemsContainerProps>`
  position: relative;
  max-height: ${props => props.footer ? '108px' : '158px'};
  overflow: scroll;

`;

const NoItems = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey3};
  height: 30px;
  padding: 0 16px;
  display: flex;
  align-items: center;
`;

export type ItemProps = {
  selected: boolean;
}

const Item = styled.div<ItemProps>`
  position: relative;
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 16px;
  background-color: ${(props) =>
    props.selected ? Colors.Grey7 : Colors.White};
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  transition: all 0.2s;
  z-index: 100;

  &:hover {
    cursor: pointer;
    background-color: ${Colors.Grey7};
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0px;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-top: 1px solid ${Colors.Grey7};
  width: fill-available;
`;

export enum SearchDropdownTypes {
  MultiSelect = 'Multi-Select',
  SingleSelect = 'Single-Select',
};

export type SearchDropdownProps = {
  type?: SearchDropdownTypes;
  value?: string;
  onChange: Function;
  placeholder?: string;
  width?: string;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  items: ISearchDropdownItem[];
  footer?: React.ReactNode;
  onClear?: () => void;
  label?: string;
  tip?: string;
  subLabel?: string;
  icon?: any;
};

export default function SearchDropdown({
  type = SearchDropdownTypes.SingleSelect,
  value,
  onChange,
  placeholder,
  width = '400px',
  searchQuery,
  setSearchQuery,
  items,
  footer,
  onClear,
  label,
  tip,
  subLabel,
  icon = IconEnum.SearchLight,
}: SearchDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Container hasLabel={Boolean(label)}>
      {label && <Label text={label} tip={tip} subText={subLabel} />}
      <Inner
        tabIndex={1}
        open={open}
        width={width}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <TopRow>
          <Icon icon={icon} size={14} color={Colors.Grey4} />
          <Input
            placeholder={placeholder}
            value={(() => {
              switch (type) {
                case SearchDropdownTypes.SingleSelect:
                  if (open) return searchQuery ?? "";
                  else {
                    const itemValue = items.find((item) => item.value === value)?.text;
                    if (itemValue) return itemValue;
                    else if (Boolean(value)) return 'Loading...';
                    else return '';
                  }

                case SearchDropdownTypes.MultiSelect:
                  if (open) return searchQuery ?? "";
                  else return "";
              }
            })()}
            onChange={(e) => {
              if (open && setSearchQuery) {
                setSearchQuery(e.target.value);
              }
            }}
          />
          {onClear && value && <Icon icon={IconEnum.CancelCircle} size={14} color={Colors.Grey5} onClick={() => onClear()} />}
        </TopRow>
        <ItemsContainer footer={Boolean(footer)}>
          {items &&
            items?.map((item) => {
              return (
                <Item
                  key={item.value}
                  selected={item.value === value}
                  onClick={() => {
                    setOpen(false);
                    onChange(item.value);
                  }}
                >
                  {item.text}
                </Item>
              );
            })}
          {!items || (!items.length && <NoItems>No results found...</NoItems>)}
        </ItemsContainer>
        {footer && <Footer>{footer}</Footer>}
      </Inner>
    </Container>
  );
};