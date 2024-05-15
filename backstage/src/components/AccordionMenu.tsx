import { any } from "@hapi/joi";
import React, { useState } from "react";
import styled from "styled-components";
import moment from "moment";
import * as Time from "@sellout/utils/.dist/time";
import * as Price from "@sellout/utils/.dist/price";
import { Icons, Colors, Flex, Icon } from "@sellout/ui";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { useQuery } from "@apollo/react-hooks";
import GET_ORDER from "@sellout/models/.dist/graphql/queries/order.query";

type AccordionHeadingType = {
  active?: boolean;
};
const Accordion = styled.div``;
const Header = styled.span`
  font-weight: 600;
`;
const AccordionHeading = styled.button<AccordionHeadingType>`
  background-color: ${(props) => (props.active ? "#ff6802" : "#eee")};
  color: ${(props) => (props.active ? Colors.White : "#444")};
  cursor: pointer;
  padding: 10px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
  transition: 0.4s;
  margin-bottom: 4px;
  position: relative;
`;
const SectionContent = styled.div`
  padding: 10px 0;
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  font-weight: 500;
  word-wrap: break-word;
`;
const SectionHeader = styled.div`
  text-transform: uppercase;
  display: inline-block;
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  padding: 10px 0;
  &:first-child {
    padding: 0;
  }
`;
const AccordionBody = styled.div`
  display: ${(props) => (props.className === "show" ? "block" : "none")};
`;

interface AccordionMenuProps {
  refundData: any;
  taxPercent: number;
  subtotal: number;
  discountAmount: number;
  promotionCodePerOrder:any
}

const AccordionMenu: React.FC<AccordionMenuProps> = ({
  refundData,
  taxPercent,
  subtotal,
  discountAmount,
  promotionCodePerOrder
}) => {


  const [show, setShow] = useState([] as any);

  const openAccordion = (date) => {
    if (show.includes(date)) {
      const filtered = show.filter((x) => x !== date);
      setShow(filtered);
    } else {
      setShow(show.concat(date));
    }
  };

  const percentage = (price: any) => {
    const amount = price;
    const totalAmount = parseFloat(amount);
    return Price.output(totalAmount.toFixed(2), true);
  };

  return (
    <>
      {refundData?.map((item, index) => {
        return (
          <Accordion key={index}>
            <AccordionHeading
              active={show.includes(item.index)}
              onClick={() => openAccordion(item.index)}
            >
              {" "}
              {Time.format(
                item.index,
                "ddd, MMM DD, YYYY [at] h:mma",
                item.timezone
              )}
              <Icon
                icon={
                  show.includes(item.index)
                    ? Icons.AngleDownRegular
                    : Icons.AngleDownRegular
                }
                color={show.includes(item.index) ? Colors.White : Colors.Grey1}
                size={18}
                position="absolute"
                right="0"
                top="10px"
                margin="0px 10px 0px 0px"
              />
            </AccordionHeading>
            <AccordionBody className={show.includes(item.index) ? "show" : ""}>
              {item.items.map((innerItem, index) => {
                let perTicketDiscount =
                  (discountAmount / subtotal) * innerItem.price;
                let ticketPriceWithDiscount =
                  innerItem.price - perTicketDiscount;
        
                return (
                  <React.Fragment key={index}>
                    {innerItem.itemType === "ticket" && (
                      <SectionContent>
                        <Flex
                          align="center"
                          margin="0px 0px 15px 0px"
                          key={index}
                        >
                          {" "}
                          <Icon
                            icon={Icons.TicketRegular}
                            color={Colors.Grey1}
                            size={12}
                            margin="0px 10px 0px 0px"
                          />{" "}
                          {innerItem.name} ($
                          {`${percentage(promotionCodePerOrder ? ticketPriceWithDiscount: innerItem.price)}`}){" "}
                        </Flex>
                      </SectionContent>
                    )}

                    {innerItem.itemType === "upgrade" && (
                      <SectionContent>
                        {" "}
                        <Flex
                          align="center"
                          margin="0px 0px 15px 0px"
                          key={index}
                        >
                          {" "}
                          <Icon
                            icon={Icons.UpgradeRegular}
                            color={Colors.Grey1}
                            size={12}
                            margin="0px 10px 0px 0px"
                          />{" "}
                          {innerItem.name} ($
                          {`${percentage(promotionCodePerOrder ? ticketPriceWithDiscount: innerItem.price)}`})
                        </Flex>{" "}
                      </SectionContent>
                    )}

                    {innerItem.itemType === "promoterFee" &&
                      innerItem.amount > 0 && (
                        <SectionContent>
                          {" "}
                          ${`${Price.output(innerItem.amount || 0, true)}`}{" "}
                          Promoter Fee has been refunded.{" "}
                        </SectionContent>
                      )}
                    {innerItem.itemType === "processingFee" &&
                      innerItem.amount > 0 && (
                        <SectionContent>
                          {" "}
                          ${`${Price.output(innerItem.amount || 0, true)}`}{" "}
                          Processing Fee has been refunded.{" "}
                        </SectionContent>
                      )}
                  </React.Fragment>
                );
              })}
              <SectionContent>
                <Header> Reason :- </Header> {item.reason}{" "}
              </SectionContent>
            </AccordionBody>
          </Accordion>
        );
      })}
    </>
  );
};

export default AccordionMenu;
