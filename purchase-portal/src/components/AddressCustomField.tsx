import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IEventCustomField from '@sellout/models/.dist/interfaces/IEventCustomField';
import { Colors } from "@sellout/ui/build/Colors";
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import OrderUtil from '@sellout/models/.dist/utils/OrderUtil';
import IOrderCustomField from '@sellout/models/.dist/interfaces/IOrderCustomField';
import * as OrderActions from '../redux/actions/order.actions';
import { CustomFieldTypeEnum } from '@sellout/models/.dist/enums/CustomFieldTypeEnum';
import IAddress from '@sellout/models/.dist/interfaces/IAddress';
import AddressSearchDropdown from '@sellout/ui/build/components/AddressSearchDropdown';

const Container = styled.div`
  position: relative;
`;

const Length = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

type AddressCustomFieldProps = {
  event: Required<IEventGraphQL>;
  customFieldId: string;
  index: number;
};

const AddressCustomField: React.FC<AddressCustomFieldProps> = ({ event, customFieldId, index }) => {
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

  const address: IAddress = { placeName: orderCustomField?.value?.toString() }

  /** Render **/
  if (!eventCustomField) return null;
  return (
    <Container>
      <AddressSearchDropdown
        label={`${eventCustomField.label}${eventCustomField.required ? '*' : ''}`}
        value={address}
        onChange={(value: IAddress) => {
          setOrderCustomField(value.placeName ?? "");
        }}
        width="100%"
      />
    </Container>
  );
};

export default AddressCustomField;
