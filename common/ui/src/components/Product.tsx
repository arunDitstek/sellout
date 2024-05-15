import React, { Fragment, useState } from "react";
import styled from "styled-components";
import * as Polished from "polished";
import AnimateHeight from "react-animate-height";
import { Colors } from "../Colors";
import Counter, { CounterProps } from './Counter';
import * as PriceUtil from '@sellout/utils/.dist/price';
import * as Time from '@sellout/utils/.dist/time';
// import Icon from "./Icon";

type RowProps = {
  justify?: string;
};

const Row = styled.div<RowProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${props => props.justify};
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  background-color: ${Colors.White};
  margin: 0 24px;
  padding: 24px 0;
  border-bottom: 1px solid ${Colors.Grey6};
`;

const Title = styled.div`
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  font-weight: 600;
  margin-bottom: 5px;
`;

const Price = styled.div`
  font-size: 1.6rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin:5px 0;
`;

const Subtitle = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 160%;
  color: ${Colors.Grey3};
`;

const Description = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 160%;
  color: ${Colors.Grey2};
  margin-top: 5px;
`;

const Tag = styled.div`
  font-size: 1.8rem;
  color: ${Colors.Orange};
  font-weight: 600;
  margin-bottom: 5px;
`;

type EllipsisProps = {
  active: boolean
};

const Ellipsis = styled.div<EllipsisProps>`
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.active ? 3 : null};
  -webkit-box-orient: ${props => props.active ? 'vertical' : null};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShowMore = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 160%;
  color: ${Colors.Orange};
  transition: all 0.2s;
`;


const ShowMoreInner = styled.span`
  &:hover {
    cursor: pointer;
    color: ${Polished.lighten(0.025, Colors.Orange)};
  }

  &:active {
    color: ${Polished.darken(0.025, Colors.Orange)};
  }
`;

const DateText = styled.span`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: 5px;
  padding-right: 5px;
`;

export type ProductProps = {
  title: string;
  price: number;
  isRSVP?: boolean;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  eventDays?: string[];
  isMultiDaysEvent?: boolean;
  timeZone?:string;
  remainingQty?: number;
} & CounterProps

export default function Product({
  title = '',
  price = 0,
  subtitle = '',
  description = '',
  isRSVP = false,
  // Counter Props
  value,
  minValue,
  maxValue,
  onIncrement,
  onDecrement,
  eventDays,
  isMultiDaysEvent,
  timeZone,
  remainingQty=0
}: ProductProps) {
  const [showMore, setShowMore] = useState(false);
  const [showEllipsis, setShowEllipsis] = useState(true);

  let descModified = description;
  if (descModified.length > 210 && !showMore) {
    descModified = descModified.substring(0, 210) + '...';
  }

  const toggle = () => {
    setShowEllipsis(!showEllipsis);
    setShowMore(!showMore)
  }

  return (
    <Container>
      <Row justify="space-between">
        <Column>
          <Title>{title}</Title>
          {isMultiDaysEvent && <div>{eventDays && eventDays.length > 0 && eventDays?.map((day: any,i) => {
            return (<DateText key={i}>{Time.format(
              day,
              "MMM Do",
              timeZone
            )}{eventDays.length !== i+1 && ","}</DateText>)
          })}</div>}
          {isRSVP ? ((PriceUtil.output(price, true) === "0.00" || 0) ? <Price>{"RSVP"}</Price> : <Price>{`$${PriceUtil.output(price, true)}` + " (Ticket value)"}</Price>) : <Price>{`$${PriceUtil.output(price, true)}`}</Price>}
        </Column>

        {remainingQty > 0 ? <Counter
          value={value}
          minValue={minValue}
          maxValue={maxValue}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        /> : <Tag> Sold out</Tag>}
      </Row>
      <Row>{subtitle && <Subtitle>{subtitle}</Subtitle>}</Row>
      {(() => {
        if (!description) return;

        return (
          <Fragment>
            <AnimateHeight height="auto">
              <Ellipsis active={showEllipsis}>
                <Description>{description}</Description>
              </Ellipsis>
            </AnimateHeight>
            <ShowMore >
              <ShowMoreInner onClick={() => toggle()}>
                {showMore ? "Show Less" : "Show More"}
              </ShowMoreInner>
            </ShowMore>
          </Fragment>
        );
      })()}
    </Container>
  );
}
