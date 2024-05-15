import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IEventCustomField from '@sellout/models/.dist/interfaces/IEventCustomField';
import { Colors } from "@sellout/ui/build/Colors";
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import OrderUtil from '@sellout/models/.dist/utils/OrderUtil';
import Input, { InputSizes } from '@sellout/ui/build/components/Input';
import IOrderCustomField from '@sellout/models/.dist/interfaces/IOrderCustomField';
import * as OrderActions from '../redux/actions/order.actions';
import { CustomFieldTypeEnum } from '@sellout/models/.dist/enums/CustomFieldTypeEnum';

const Container = styled.div`
  position: relative;
`;

const Name = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Length = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

type NumberCustomFieldProps = {
  event: Required<IEventGraphQL>;
  customFieldId: string;
  index: number;
};

const NumberCustomField: React.FC<NumberCustomFieldProps> = ({ event, customFieldId, index }) => {
  /** State **/
  const { order } = useSelector((state: PurchasePortalState) => state);
  const {
    createOrderParams
  } = order;
  const eventCustomField: IEventCustomField | null = EventUtil.customField(event, customFieldId);
  const orderCustomField: IOrderCustomField | null = OrderUtil.customField(createOrderParams, customFieldId);

  /** Actions **/
  const dispatch = useDispatch();
  const setOrderCustomField = (value: string) =>
    dispatch(OrderActions.setOrderCustomField(
      eventCustomField?.label as string,
      value,
      eventCustomField?._id as string,
      eventCustomField?.type ?? CustomFieldTypeEnum.Text,
    )
    );

  /** Render **/
  if (!eventCustomField) return null;

  const hasValueRequirement = eventCustomField.minValue || eventCustomField.maxValue;

  return (
    <Container>
      <Input
        autoFocus={index === 0}
        type="number"
        label={`${eventCustomField.label}${eventCustomField.required ? '*' : ''}`}
        placeholder={`Enter ${eventCustomField?.label?.toLowerCase()}`}
        size={InputSizes.Large}
        value={orderCustomField?.value?.toString() ?? ''}
        width="100%"
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          const value = parseInt(event.currentTarget.value);
          setOrderCustomField(value.toString());
        }}
        margin={hasValueRequirement ? '0 0 5px' : '0'}
      />
      <Length>
        {(() => {
          // Fixed issue SELLOUT-49
          if (eventCustomField.minValue > 0 && eventCustomField.maxValue > 0) {
            return `Must be between ${eventCustomField.minValue}-${eventCustomField.maxValue}`;
          }
          else if (eventCustomField.minValue > 0) {
            return `Must be at least ${eventCustomField.minValue}`;
          }
          else if (eventCustomField.maxValue > 0) {
            return `Must not be greater than ${eventCustomField.maxValue}`;
          }
        })()}
      </Length>
    </Container>
  );
};

export default NumberCustomField;
