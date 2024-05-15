import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IEventCustomField from '@sellout/models/.dist/interfaces/IEventCustomField';
import { Colors } from "@sellout/ui/build/Colors";
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import OrderUtil from '@sellout/models/.dist/utils/OrderUtil';
import DropDown from '@sellout/ui/build/components/Dropdown';
import IOrderCustomField from '@sellout/models/.dist/interfaces/IOrderCustomField';
import { DropDownEnum } from '@sellout/models/.dist/enums/DropDownEnum';
import * as OrderActions from '../redux/actions/order.actions';
import { CustomFieldTypeEnum } from '@sellout/models/.dist/enums/CustomFieldTypeEnum';

const Container = styled.div`
  position: relative;
`;

const Length = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

type DropDownCustomFieldProps = {
  event: Required<IEventGraphQL>;
  customFieldId: string;
  index: number;
};

const DropDownCustomField: React.FC<DropDownCustomFieldProps> = ({ event, customFieldId, index }) => {
  /** State **/
  const { order } = useSelector((state: PurchasePortalState) => state);
  const {
    createOrderParams
  } = order;
  const eventCustomField: IEventCustomField | null = EventUtil.customField(event, customFieldId);
  const orderCustomField: IOrderCustomField | null = OrderUtil.customField(createOrderParams, customFieldId);

  /** State **/
  const dispatch = useDispatch();
  const setOrderCustomField = (value: string) => {
    dispatch(OrderActions.setOrderCustomField(
      eventCustomField?.label as string,
      value,
      eventCustomField?._id as string,
      eventCustomField?.type ?? CustomFieldTypeEnum.Dropdown,
    )
    );
  }

  /** Render **/
  if (!eventCustomField) return null;
  const items = Object.values(eventCustomField.options).map((option: string) => {
    return {
      text: option,
      value: option,
    };
  });

  return (
    <Container>
      <DropDown
        value={orderCustomField?.value?.toString() ?? 'Select option'}
        items={[{ text: DropDownEnum.Select, value: DropDownEnum.Select }, ...items]}
        onChange={(value: string) => {
          setOrderCustomField(value);
        }}
        width="100%"
        label={`${eventCustomField.label}${eventCustomField.required ? '*' : ''}`}
        height={"170px"}
      />
    </Container>
  );
};

export default DropDownCustomField;
