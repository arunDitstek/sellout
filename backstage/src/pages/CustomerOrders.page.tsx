import React from 'react';
import styled from 'styled-components';
import OrdersTable from '../components/OrdersTable';
import PageLoader from '../components/PageLoader';
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import useListOrders from '../hooks/useListOrders.hook';
import { PageTitle } from '../components/PageLayout';
import { PaginationTypes } from '@sellout/models/.dist/interfaces/IPagination';
import { media } from '@sellout/ui/build/utils/MediaQuery';

const TableContainer = styled.div`
  display: flex;
  height: calc(100% - 74px);
  ${media.mobile`
  height: calc(100% - 160px);
`};
`;


type SubNavItemProps = {
  active: boolean;
}

type CustomerOrdersProps = {}

const CustomerOrders: React.FC<CustomerOrdersProps> = () => {
  /* State */
  const customerState = useSelector((state: BackstageState) => state.customer);
  const { customerId } = customerState;

  /* Hooks */
  const query = { userIds: [customerId] };
  const { orders, fetchMore } = useListOrders({
    variables: {
      query,
      pagination: {
        pageSize: 60,
        pageNumber: 1,
      }
    }
  });

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(orders)} />
      {orders && (
        <>
          <PageTitle>
            All Orders
          </PageTitle>
            <TableContainer>
              <OrdersTable
                fetchMore={fetchMore}
                orders={orders}
                paginationType={PaginationTypes.CustomerOrders}
                showEvent={true}
              />
            </TableContainer>
          </>
      )}
    </>
  );
};

export default CustomerOrders;