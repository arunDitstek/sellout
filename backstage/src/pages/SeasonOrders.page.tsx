import React, { useEffect } from "react";
import OrdersTable from "../components/OrdersTable";
import PageLoader from "../components/PageLoader";
import { BackstageState } from "../redux/store";
import useListOrders from "../hooks/useListOrders.hook";
import { useMutation } from "@apollo/react-hooks";
import { useDispatch, useSelector } from "react-redux";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import GENERATE_ORDER_REPORT from "@sellout/models/.dist/graphql/mutations/generateOrderReport.mutation";
import FilterButton from "../elements/FilterButton";
import PageSearch from "../components/PageSearch";
import { Icons } from "@sellout/ui";
import * as OrderActions from "../redux/actions/order.actions";
import * as AppActions from "../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import useBatchPrintOrderHook from "../hooks/useBatchPrintOrder.hook";
import { VariantEnum } from "../models/enums/VariantEnum";
import {
  PrintedItemOrientationTypes,
} from "../hooks/usePrintOrder.hook";
import { ButtonContainer, SearchContainer, Spacer, TableContainer } from "./EventOrders.page";
import { Page } from "../components/PageLayout";


type SeasonOrdersProps = {};

const SeasonOrders: React.FC<SeasonOrdersProps> = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [disable, setDisable] = React.useState("false");
  const [batchPrint, setBatchPrint] = React.useState(false);
  const [batchPrintLoading, setBatchPrintLoading] = React.useState(false);


  /** State */
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { refunded, orderIds } = useSelector((state: BackstageState) => state.order);
  const { seasonId } = seasonState;

  /** Action */
  // const { printOrder } = useBatchPrintOrderHook(
  //   orderIds as any,
  // );
  const orderType = VariantEnum.Season;
  const { printOrder } = useBatchPrintOrderHook(
    orderIds as any,
    orderType,
    PrintedItemOrientationTypes.HorizontalNormal,
    setBatchPrintLoading,
    setBatchPrint,
  );

  const onBatchPrint = () => {
    setBatchPrint(true);
    if (orderIds?.length) {
      setBatchPrintLoading(true);
      printOrder();
    }
  }

  const onCancelBatchPrint = () => {
    dispatch(OrderActions.setBatchPrintOrderIds([]));
    setBatchPrint(false);
  }
  /* Hooks */
  const [generateOrderReport, { loading }] = useMutation(
    GENERATE_ORDER_REPORT,
    {
      onCompleted(data) {
        if (data?.generateOrderReport.url.length > 0) {
          window.location.href = data?.generateOrderReport.url;
          setDisable("false");
        } else if (data?.generateOrderReport.message.length > 0) {
          dispatch(
            AppActions.showNotification(
              data?.generateOrderReport.message,
              AppNotificationTypeEnum.Error
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
    refetch,
    loading: ordersLoading,
  } = useListOrders({
    variables: {
      query: {
        seasonIds: [seasonId],
        userQuery: searchQuery,
        any: true,
      },
      pagination: {
        pageSize: 60,
        pageNumber: 1,
      },
      context: {
        debounceKey: "QUERY_ORDERS",
        debounceTimeout: 250,
      },
    },
  });

  useEffect(() => {
    if (refunded) {
      refetch && refetch();
      dispatch(OrderActions.setOrderRefunded(false));
    }
  }, [refunded]);

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(orders)} />

      {orders && (
        <Page>
          <SearchContainer>
            <PageSearch
              setSearchQuery={setSearchQuery}
              searchQuery={searchQuery}
              loading={ordersLoading}
              placeHolder="Search by Order ID, Customer, Member ID"
            />
              <Spacer/>
            <ButtonContainer>
            <FilterButton
              text={"Batch Print"}
              icon={Icons.PrintRegular}
              loading={batchPrintLoading}
              onClick={() => onBatchPrint()}
            />
            {batchPrint && <> <FilterButton
              text={"Cancel"}
              icon={Icons.Cancel}
              onClick={() => onCancelBatchPrint()}
            />
             </>}
            <FilterButton
              text="Export List"
              icon={Icons.DownloadReport}
              loading={loading}
              onClick={() => {
                if (disable == "false") {
                  setDisable("true");
                  generateOrderReport({
                    variables: {
                      query: {
                        userQuery: searchQuery,
                        any: true,
                        seasonIds: [seasonId],
                      },
                    },
                  });
                }
              }}
            />
            </ButtonContainer>
          </SearchContainer>
            <TableContainer>
              <OrdersTable
                refetch={refetch}
                fetchMore={fetchMore}
                orders={orders}
                paginationType={PaginationTypes.EventOrders}
                showCheckedIn={true}
                batchPrint={batchPrint}
              />
            </TableContainer>
        </Page>
      )}
    </>
  );
};

export default SeasonOrders;