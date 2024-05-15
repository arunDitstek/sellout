import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';

const Container = styled.div`
  position: relative;
  height: 38px;
  display: flex;
  flex-direction: row;
  padding-right: 40px;
  background-color: ${Colors.White};
  border-top: 1px solid ${Colors.Grey6};
  border-bottom: 1px solid ${Colors.Grey6};
  /* overflow: scroll; */
  /* overflow-y: visible; */
  
`;

const Scroll = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: row;
  overflow: scroll;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    width: 0 !important;
    display: none;
  }
`;


type ItemProps = {
  active: boolean;
};

const Item = styled.div<ItemProps>`
  position: relative;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 40px;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.4rem;
  white-space: nowrap;
  transition: all 0.1s;
  /* font-weight: ${props => (props.active ? 600 : 500)}; */
  color: ${props => (props.active ? Colors.Orange : Colors.Grey4)};
  border-bottom: 2px solid
    ${props => (props.active ? Colors.Orange : "transparent")};

  &:hover {
    cursor: pointer;
    color: ${Colors.Orange};
    border-bottom: 2px solid ${Colors.Orange};
  }
`;

const Spacer = styled.div`
  position: relative;
  width: 40px;
`;

const Title = styled.div`
  position: relative;
  height: 38px;
  display: flex;
  align-items: center;
  margin: 0 30px 0;
  color: ${Colors.Grey1};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.7rem;
  white-space: nowrap;
`;

export type ScrollableNavigationItem = {
  text: string;
  active: boolean;
};

type ScrollableNavigationProps = {
  items: ScrollableNavigationItem[];
  title?: string | null;
};

const ScrollableNavigation: React.FC<ScrollableNavigationProps> = ({ 
  items = [], 
  title = null,
}) => {
 return (
   <Container>
     <Scroll>
       {title && <Title>{title}</Title>}
       {items.map((item: ScrollableNavigationItem, index: number) => (
         <Item key={index} active={item.active}>
           {item.text}
         </Item>
       ))}
       <Spacer>&nbsp;</Spacer>
     </Scroll>
   </Container>
 );
}

export default ScrollableNavigation;
