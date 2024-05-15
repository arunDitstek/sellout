import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import { Colors } from "@sellout/ui/build/Colors";
import TicketTypeProduct from "../components/TicketTypeProduct";
import PromotionCodeInput from "../components/PromotionCodeInput";
import ScreenHeader from "../components/ScreenHeader";
import TextCustomField from "../components/TextCustomField";
import NumberCustomField from "../components/NumberCustomField";
import DropDownCustomField from "../components/DropDownCustomField";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { CustomFieldTypeEnum } from "@sellout/models/.dist/enums/CustomFieldTypeEnum";
import AddressCustomField from "../components/AddressCustomField";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px 70px;
`;

const Spacer = styled.div`
  height: 24px;
`;

type CustomFieldsProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const CustomFields: React.FC<CustomFieldsProps> = ({ event, season }) => {
  /** State **/
  const CustomFields = event
    ? EventUtil.activeCustomFields(event as IEventGraphQL)
    : SeasonUtil.activeCustomFields(season as ISeasonGraphQL);

  const customData: any = event ? event : season;
  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Survey Questions" />
      <Content>
        {CustomFields?.map((customField, index) => {
          switch (customField.type) {
            case CustomFieldTypeEnum.Text:
              return (
                <Fragment key={index}>
                  <TextCustomField
                    event={customData}
                    customFieldId={customField?._id || ""}
                    index={index}
                  />
                  <Spacer />
                </Fragment>
              );

            case CustomFieldTypeEnum.Number:
              return (
                <Fragment key={index}>
                  <NumberCustomField
                    event={customData}
                    customFieldId={customField?._id || ""}
                    index={index}
                  />
                  <Spacer />
                </Fragment>
              );

            case CustomFieldTypeEnum.Dropdown:
              return (
                <Fragment key={index}>
                  <DropDownCustomField
                    event={customData}
                    customFieldId={customField?._id || ""}
                    index={index}
                  />
                  <Spacer />
                </Fragment>
              );

            case CustomFieldTypeEnum.Address:
              return (
                <Fragment key={index}>
                  <AddressCustomField
                    event={customData}
                    customFieldId={customField?._id || ""}
                    index={index}
                  />
                  <Spacer />
                </Fragment>
              );
          }
        })}
      </Content>
    </Container>
  );
};

export default CustomFields;
