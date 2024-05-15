import React from "react";
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";


const CREATE_ORDER = gql`
  mutation createOrder($params: OrderInput!) {
    createOrder(params: $params) {
      _id
    }
  }
`;

type CreateOrdersButtonProps = {};

// This component was built for testing purposes only
// it allows you to easily create a bunch of orders
const CreateOrdersButton: React.FC<CreateOrdersButtonProps> = () => {
  const [createOrder, { loading }] = useMutation(CREATE_ORDER, {
    onCompleted(data) {
      // console.log(data);
    },
    onError(error) {
      console.error(error);
    }
  });

  const doMutation = async () => {
    for (let i = 0; i < 5; i++) {
      await createOrder({
        variables: {
          params: {
            userId: "6DJ75YQg1",
            orgId: "2fxpY33fx",
            eventId: "S7301S-9k9",
            tickets: [
              {
                name: "General Admission",
                ticketTypeId: "gWVCKVPJ2",
                ticketTierId: "UuP83kcBBx",
                price: 0,
                rollFees: false
              }
            ],
            upgrades: [
              {
                name: "New Upgrade",
                upgradeId: "DMOCWNdGj",
                price: 0,
                rollFees: false
              }
            ],
            type: "RSVP",
            channel: "Online",
            promotionCode: "",
            customFields: [],
            paymentMethodType: "None",
            paymentIntentId: "",
          },
        }
      })
    }
  }


  return (
    <Button
      type={ButtonTypes.Next}
      text="CREATE TEST ORDERS"
      loading={loading}
      onClick={() => doMutation()}
    />
  );
};

export default CreateOrdersButton;
