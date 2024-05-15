import React, { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import { IOrderGraphQL } from "@sellout/models/.dist/interfaces/IOrder";
import * as Time from "@sellout/utils/.dist/time";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import * as Price from "@sellout/utils/.dist/price";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";
import OrderStatus from "../components/OrderStatus";
import { ModalTypes } from "./modal/Modal";
import * as AppActions from "../redux/actions/app.actions";
import * as OrderActions from "../redux/actions/order.actions";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableNoContent,
  ScrollTableSpace,
} from "./ScrollableTable";
import { useDispatch } from "react-redux";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";

export const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.White};
  border-radius: 0;
  // const eventState = useSelector((state: BackstageState) => state.event);
  // const { eventId, eventsCache } = eventState;
  padding: 10px 0px;
`;


const FormGroup = styled.div`
  display: flex;
  // margin: 8px 8px 8px 0;
`;

const Checkbox = styled.input`
  padding: 0;
  height: initial;
  width: initial;
  margin-bottom: 0;
  display: none;
  cursor: pointer;
`;
type CheckBox = {
  checked?: boolean;
  disabled?: boolean;
  id?: number;
};
const Label = styled.label<CheckBox>`
  position: relative;
  cursor: pointer;
  &:before {
    content: "";
    -webkit-appearance: none;
    background-color: transparent;
    border: 2px solid #ff700f;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05),
      inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
    padding: 6px;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    cursor: pointer;
    margin-right: 5px;
    border-radius: 3px;
  }
  &:after {
    content: "";
    display: ${(props) => (props.checked ? "block" : "none")};
    position: absolute;
    top: 2px;
    left: 5.5px;
    width: 2px;
    height: 6px;
    border: solid #ff700f;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
`;

type TableProps = {
  showEvent?: boolean;
  showCheckedIn?: boolean;
  batchPrint?: boolean;
};

const TableHeader: React.FC<TableProps> = ({
  showEvent,
  showCheckedIn,
  batchPrint,
}) => {
  return (
    <ScrollTableHeader>
      {batchPrint && (
        <ScrollTableHeaderCell width="70px"></ScrollTableHeaderCell>
      )}
      <ScrollTableHeaderCell width="96px">Order ID</ScrollTableHeaderCell>
      <ScrollTableSpace />
      {showEvent && (
        <Fragment>
          <ScrollTableHeaderCell width="112px">Event</ScrollTableHeaderCell>
          <ScrollTableSpace />
        </Fragment>
      )}
      <ScrollTableHeaderCell width="112px">Customer</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="150px">Date/Time</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="35px">Items</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="80px">Total</ScrollTableHeaderCell>
      <ScrollTableSpace />
      {showCheckedIn && (
        <Fragment>
          <ScrollTableHeaderCell width="112px">
            Checked In
          </ScrollTableHeaderCell>
          <ScrollTableSpace />
        </Fragment>
      )}
      <ScrollTableHeaderCell width="72px">Channel</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="120px">Printed</ScrollTableHeaderCell>
      <ScrollTableHeaderCell width="120px">Status</ScrollTableHeaderCell>
    </ScrollTableHeader>
  );
};

type TableRowsProps = {
  orders: IOrderGraphQL[];
} & TableProps;
// const event = eventsCache[eventId];x 0px 10px 10px;
const TableRows: React.FC<TableRowsProps> = ({
  orders,
  showEvent,
  showCheckedIn,
  batchPrint,
}) => {
  const dispatch = useDispatch();
  const [printOrder, setPrintOrder] = useState(
    new Array(orders.length).fill(false)
  );
  const [orderIds, setOrderIds] = useState<any[]>([]);
  let selectCheck = false;
  useEffect(() => {
    if (!selectCheck) {
      dispatch(OrderActions.setBatchPrintOrderIds([]));
    }
    if (!batchPrint) {
      dispatch(OrderActions.setBatchPrintOrderIds([]));
      setOrderIds([]);
    }
    setPrintOrder(new Array(orders.length).fill(false));
  }, [selectCheck, batchPrint, orders.length]);

  return (
    <>
      {orders.map((order: IOrderGraphQL, index: number) => {
        // const in
        const isTimeZone = order.event
          ? order?.event?.venue?.address?.timezone
          : order?.season?.venue?.address?.timezone;

        const timezone = isTimeZone
          ? order?.event
            ? order?.event?.venue?.address?.timezone
            : order?.season?.venue?.address?.timezone
          : undefined;
        // const totalOrderItemsCount: number = order.tickets.length + order.upgrades.length
        const upgradeScanned = [] as any;

        // order.upgrades.filter((a) => {a.scan.scanned});
        order.upgrades.map((a: any) =>
          a?.scan?.scanned === true && upgradeScanned.push(a?.scan?.startsAt)
        )
        // a?.scan.map(
        //   (b) => b.scanned === true && upgradeScanned.push(b.startsAt)
        // )
        // );
        // const totalScanCount = [] as any;
        const totalScannedCount = [] as any;
        // order.tickets.map((a: any) =>
        //   a?.scan.map((b) => totalScanCount.push(b.startsAt))
        // );
        order.tickets.map((a: any) =>
          a?.scan.map(
            (b) => b.scanned === true && totalScannedCount.push(b.startsAt)
          )
        );
        // const rsvpvalue = order.tickets.map((a: any) => a?.values);
        const ticketTotal = order?.tickets?.reduce(
          (cur, ticket) => cur + parseFloat(ticket.values as string),
          0
        );
        const totalOrderItemsCount: number =
          order.tickets.filter((a) => a.state === "Active").length +
          order.upgrades.filter((a) => a.state === "Active").length;
        const scannedOrderItemsCount: number =
          totalScannedCount.length + upgradeScanned.length;
        // order.tickets.map((a: any)=>a?.scan.map((b)=> !totalScanCount.includes(b.startsAt) && totalScanCount.push(b.startsAt)))
        // const scannedOrderItemsCount = [...order.tickets, ...order.upgrades].reduce((cur, next: IOrderTicket | IOrderUpgrade) => {
        //   // console.log("++++++>>>", next)
        //   // console.log("++++++>>> ++++++", cur + (Array.isArray(next.scan)? (next.scan[0].scanned ? 1 : 0):  next.scan && next.scan.scanned ? 1 : 0));
        //   return cur + (Array.isArray(next.scan) ? (next.scan[0].scanned ? 1 : 0) : next.scan && next.scan.scanned ? 1 : 0);
        //   // return 0;
        // }, 0);

        const { _id, eventName, user, createdAt, printed } = order;
        for (let key in order.fees) {
          if (order.fees[key].name == "Sales tax")
            order.fees[key].value = order?.tax as any;
        }
        const userName: string = user?.firstName
          ? `${user.firstName} ${user.lastName}`
          : user?.email;
        const total: number = OrderUtil.orderTotal(order, order.fees as any);
        const status: React.ReactNode = (
          <OrderStatus order={order} margin="-2px 0 0 0" />
        );
        const dateAndTime: string = Time.format(
          createdAt,
          "ddd, MMM DD, YYYY [at] h:mma",
          timezone
        );

        const checkedIn: string = `${scannedOrderItemsCount}/${totalOrderItemsCount}`;
        const items =
          order.tickets.filter((x) => x.state === "Active").length +
          order.upgrades.filter((x) => x.state === "Active").length;

        const onClick = () => {
          if (!selectCheck) {
            dispatch(OrderActions.setOrderId(_id as string));
            dispatch(AppActions.pushModal(ModalTypes.OrderDetails));
          }
        };

        const onCheckBox = (position: any, orderId) => {
          selectCheck = true;
          let updatedOrderIds = [...orderIds] as any;
          const isExist = updatedOrderIds.some((x) => x === orderId);
          if (isExist) {
            updatedOrderIds = updatedOrderIds.filter(
              (item, index) => item !== orderId
            );
          } else {
            updatedOrderIds.push(orderId);
          }
          setOrderIds(updatedOrderIds);
          const updatedCheckedState = printOrder.map((item, index) =>
            index === position ? !item : item
          );
          dispatch(OrderActions.setBatchPrintOrderIds(updatedOrderIds));
          setPrintOrder(updatedCheckedState);
        };
        return (
          <ScrollTableBodyRow
            key={order._id}
            height="40px"
            onClick={(e) => onClick()}
          >
            {batchPrint && (
              <>
                <ScrollTableBodyCell width="70px">
                  <FormGroup onClick={(e) => onCheckBox(index, _id)}>
                    <Checkbox type="checkbox" />
                    <Label checked={printOrder[index]}></Label>
                  </FormGroup>
                </ScrollTableBodyCell>
              </>
            )}
            <ScrollTableBodyCell width="96px">{_id}</ScrollTableBodyCell>
            <ScrollTableSpace />
            {showEvent && (
              <Fragment>
                <ScrollTableBodyCell width="112px">
                  {eventName}
                </ScrollTableBodyCell>
                <ScrollTableSpace />
              </Fragment>
            )}
            <ScrollTableBodyCell width="112px">
              {userName || "Guest"}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="150px">
              {dateAndTime}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="35px">{items}</ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="80px">
              $
              {ticketTotal
                ? Price.output(ticketTotal, true)
                : Price.output(
                  order?.payments.length
                    ? Math.round(
                      (order.payments[0].amount + Number.EPSILON) * 100
                    ) / 100
                    : total,
                  true
                )}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            {showCheckedIn && (
              <Fragment>
                <ScrollTableBodyCell width="112px">{`${checkedIn} Items scanned`}</ScrollTableBodyCell>
                <ScrollTableSpace />
              </Fragment>
            )}
            <ScrollTableBodyCell width="72px">
              {order.channel}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="120px">
              {printed ? "Yes" : "No"}
            </ScrollTableBodyCell>
            <ScrollTableBodyCell width="120px">{status}</ScrollTableBodyCell>
            {/* </span> */}
          </ScrollTableBodyRow>
        );
      })}
    </>
  );
};

type OrdersTableProps = {
  orders: any;
  fetchMore?: Function;
  refetch?: Function;
  paginationType?: PaginationTypes;
  batchPrint?: boolean;
} & TableProps;

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  fetchMore,
  paginationType,
  showEvent = false,
  showCheckedIn = false,
  batchPrint,
}) => {
  const scrollContainer = React.useRef<any>(null);

  /** Render */
  if (orders.length <= 0) {
    return (
      <ScrollTable>
        <TableHeader
          showEvent={showEvent}
          showCheckedIn={showCheckedIn}
          batchPrint={batchPrint}
        />
          <ScrollTableBody>
            <ScrollTableNoContent>
              <NoContentHead>No orders</NoContentHead>
            </ScrollTableNoContent>
          </ScrollTableBody>
      </ScrollTable>
    );
  }

  return (
    <ScrollTable
      fetchMore={fetchMore}
      paginationType={paginationType}
      updateQuery={(prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          orders: [...prev.orders, ...fetchMoreResult.orders],
        };
      }}
      scrollContainer={scrollContainer}
      name={"order"}
    >
      {(loading: boolean) => {
        return (
          <Fragment>
            <TableHeader
              showEvent={showEvent}
              showCheckedIn={showCheckedIn}
              batchPrint={batchPrint}
            />
            <ScrollTableBody ref={scrollContainer}>
              <TableRows
                orders={orders}
                showEvent={showEvent}
                showCheckedIn={showCheckedIn}
                batchPrint={batchPrint}
              />
              {loading && (
                <LoaderContainer>
                  <Loader size={LoaderSizes.Large} color={Colors.Orange} />
                </LoaderContainer>
              )}
            </ScrollTableBody>
          </Fragment>
        );
      }}
    </ScrollTable>
  );
};

export default OrdersTable;
