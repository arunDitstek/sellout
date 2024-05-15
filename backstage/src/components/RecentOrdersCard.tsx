import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Colors, Icons } from '@sellout/ui';
import DetailsCard from '../elements/DetailsCard';
import EventPreview from './EventPreview';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import QUERY_ORDERS from '@sellout/models/.dist/graphql/queries/orders.query';
import * as AppActions from "../redux/actions/app.actions";
import * as OrderActions from '../redux/actions/order.actions';
import QUERY_CUSTOMER_ORDERS from '@sellout/models/.dist/graphql/queries/customerOrders.query';
import { useSelector, useDispatch } from "react-redux";
import { ModalTypes } from './modal/Modal';

const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const NoContentBody = styled.div`
  font-weight: 500;
  font-size: 1.8rem;
  color: ${Colors.Grey3};
`;

const NoContentContainer = styled.div`
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const EventPreviewContainer = styled.div`
  border-bottom: 1px solid ${Colors.Grey6};
  transition: all 0.2s;
  padding: 16px;

  &:last-of-type {
    border-bottom: 0;
    border-radius: 0 0 10px 10px;
  }

  &:hover {
    background: ${Colors.Grey7};
  }
`;
type recentOrdersCardProps = {
  customer: any;
};
const RecentOrdersCard: React.FC<recentOrdersCardProps> = ({ customer }) => {
  const dispatch = useDispatch();

  const [getOrders, { data, loading, error }] = useLazyQuery(QUERY_CUSTOMER_ORDERS);

  useEffect(() => {
   if(customer?.userId){
		getOrders({
			variables: {
				query: {
					userIds: [customer?.userId],
				},
				pagination: { pageSize: 3 },
			}
		})
	}
  }, [customer])

  if (loading || !data) return null;

	if(!data){
		return (
			<NoContentContainer>
				<NoContentHead>No Customer/Orders</NoContentHead>
		 	</NoContentContainer>
		);
	}

  const { orders } = data;

  /* Render */
  return (
    <DetailsCard
      title="Most Recent Orders"
      headerIcon={Icons.CalendarStarSolid}
      width="600px"
      padding=" 0px"
    >
      {orders?.map((order: any, i: number) => {
        const launchOrderModal = () => {
          dispatch(OrderActions.setOrderId(order._id as string));
          dispatch(AppActions.pushModal(ModalTypes.OrderDetails));
        }

        return (
          <EventPreviewContainer key={i}>
            <EventPreview key={i} event={order.event} onClick={() => launchOrderModal()} />
          </EventPreviewContainer>
        )
      })}
      {orders && orders?.length <= 0 &&
        <NoContentContainer>
          <NoContentHead>
            No recent orders
          </NoContentHead>
        </NoContentContainer>
      }
    </DetailsCard>
  );
};

export default RecentOrdersCard;