import React from "react";
import OrdersTable from "../components/OrdersTable";
import { useMutation } from "@apollo/react-hooks";
import PageLoader from "../components/PageLoader";
import useListOrders from "../hooks/useListOrders.hook";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import { TopLeftPaddedPage } from "../components/PageLayout";
import { Icons } from "@sellout/ui";
import PageSearch from "../components/PageSearch";
import GENERATE_ORDER_REPORT from "@sellout/models/.dist/graphql/mutations/generateOrderReport.mutation";
import FilterButton from "../elements/FilterButton";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import { BackstageState } from "../redux/store";
import * as OrderActions from "../redux/actions/order.actions";
import useBatchPrintOrderHook, {
  PrintedItemOrientationTypes,
} from "../hooks/useBatchPrintOrder.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { ButtonContainer } from "./EventOrders.page";

const Spacer = styled.div`
  width: 8px;
  padding: 5px;
`;

export const SearchContainer = styled.div`
  margin: 0px 24px 24px 0px;
  display: flex;
  ${media.mobile`
  display: block;
`};
`;

const TableContainer = styled.div`
  display: flex;
  height: calc(100% - 74px);
  ${media.mobile`
  height: calc(100% - 160px);
`};
`;

type OrderListProps = {
  match: any;
};

const OrderList: React.FC<OrderListProps> = ({ match }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [disable, setDisable] = React.useState("false");
  const [batchPrint, setBatchPrint] = React.useState(false);
  const [batchPrintLoading, setBatchPrintLoading] = React.useState(false);

  /** State */
  const { orderIds } = useSelector((state: BackstageState) => state.order);

  /** Action */
  const orderType = "AllOrder";
  const { printOrder } = useBatchPrintOrderHook(
    orderIds as any,
    orderType,
    PrintedItemOrientationTypes.HorizontalNormal,
    setBatchPrintLoading,
    setBatchPrint
  );

  const onBatchPrint = () => {
    setBatchPrint(true);
    if (orderIds?.length) {
      setBatchPrintLoading(true);
      printOrder();
    }
  };

  const onCancelBatchPrint = () => {
    dispatch(OrderActions.setBatchPrintOrderIds([]));
    setBatchPrint(false);
  };

  const query = {
    userQuery: searchQuery,
    orderIds: [searchQuery],
    any: true,
  };
  const [generateOrderReport, { loading: reportLoading }] = useMutation(
    GENERATE_ORDER_REPORT,
    {
      variables: {
        query,
      },
      onCompleted(data) {
        if (data?.generateOrderReport.url.length > 0) {
          window.location.href = data?.generateOrderReport.url;
          setDisable("false");
        } else if (data?.generateOrderReport.message.length > 0) {
          dispatch(
            AppActions.showNotification(
              data?.generateOrderReport.message,
              AppNotificationTypeEnum.Success
            )
          );
        }
      },
      onError(error) {
        console.error(error);
      },
    }
  );
  const {
    orders,
    fetchMore,
    loading: ordersLoading,
  } = useListOrders({
    variables: {
      pagination: {
        pageSize: 60,
        pageNumber: 1,
      },
      query,
    },
    context: {
      debounceKey: "QUERY_ORDERS",
      debounceTimeout: 250,
    },
  });

  /** Render */
  return (
    <>
      <PageLoader nav={true} fade={Boolean(orders)} />
      {orders && (
        <TopLeftPaddedPage>
          <SearchContainer>
            <PageSearch
              setSearchQuery={setSearchQuery}
              searchQuery={searchQuery}
              loading={ordersLoading}
              placeHolder="Search by Order ID, Event, Customer, Member ID"
            />
            <Spacer />
            <ButtonContainer>
              <FilterButton
                text={"Batch Print"}
                icon={Icons.PrintRegular}
                loading={batchPrintLoading}
                // loading={batchPrintLoading && `${batchPrintLoading}`}
                onClick={() => onBatchPrint()}
              />
              {batchPrint && (
                <>
                  {" "}
                  <FilterButton
                    text={"Cancel"}
                    icon={Icons.Cancel}
                    onClick={() => onCancelBatchPrint()}
                  />
                </>
              )}
              <FilterButton
                text="Export List"
                icon={Icons.DownloadReport}
                loading={reportLoading}
                onClick={() => {
                  if (disable == "false") {
                    setDisable("true");
                    generateOrderReport();
                  }
                }}
              />
            </ButtonContainer>
          </SearchContainer>
          <TableContainer>
            <OrdersTable
              orders={orders}
              fetchMore={fetchMore}
              paginationType={PaginationTypes.Orders}
              showEvent={true}
              batchPrint={batchPrint}
            />
          </TableContainer>
        </TopLeftPaddedPage>
      )}
    </>
  );
};

export default OrderList;
