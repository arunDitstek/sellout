import React from "react";
import ReactPDF, {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from "@react-pdf/renderer";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IOrderTicket from "@sellout/models/.dist/interfaces/IOrderTicket";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";
import { EventSaleTaxEnum } from "@sellout/models/.dist/interfaces/IEvent";
import * as Price from '@sellout/utils/.dist/price';
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import { OrderTypeEnum } from "@sellout/models/.dist/interfaces/IOrderType";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import * as Time from "@sellout/utils/.dist/time";

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  innerContainer: {
    marginTop: 50,
    border: "1px solid #e6e6e6",
    padding: 10,

  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    padding: 10
  },
  table: {
    width: 500,
    scale: 2,
    flexGrow: 1,
  },
  header: {
    borderTop: "none",
    flexGrow: 1
  },
  bold: {
    fontWeight: "bold"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    padding: 10,
    flexGrow: 1,
  },
  backroundRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
    padding: "8px 10px",
  },
  row1: {
    color: "gray",
    width: "90%",
    fontSize: "11",
  },
  row2: {
    fontSize: "10",
    width: "90%",
    color: "black",
    textAlign: "left",
    padding: "0 10px 0 0",

  },
  row3: {
    fontSize: "10",
    width: "90%",
    fontWeight: 500
  },
  row4: {
    width: "90%",
    paddingRight: "5px",
    fontSize: "11",
    textAlign: "left",
  },
  width: {
    width: "80%",
  }

});

interface IEventReportItem {
  name: string;
  grossSales: number;
  qtySold: number;
  refundTickets: number;
  refunds: number;
  netSales: number;
  comps: number;
  qtyNet: number;
  refundUpgrades: number;
  type?: string;
}


type EventReportMap = Record<string, IEventReportItem>;
type TicketTypeReportMap = Record<string, IEventReportItem & { tiers: EventReportMap }>


const makeTicketTypesMap = (ticketTypes: ITicketType[]): TicketTypeReportMap => {
  return ticketTypes.reduce((ticketCulm: TicketTypeReportMap, ticketType: ITicketType) => {
    ticketCulm[ticketType._id as string] = {
      name: ticketType.name,
      grossSales: 0,
      qtySold: 0,
      refunds: 0,
      netSales: 0,
      refundTickets: 0,
      comps: 0,
      qtyNet: 0,
      tiers: makeTiersMap(ticketType.tiers),
      refundUpgrades: 0,
      type: "",
    };
    return ticketCulm;
  }, {});
}

const makeTiersMap = (tiers: ITicketTier[]): EventReportMap => {
  return tiers.reduce((tierCulm: EventReportMap, tier: ITicketTier) => {
    tierCulm[tier._id as string] = {
      name: tier.name,
      grossSales: 0,
      qtySold: 0,
      refundTickets: 0,
      comps: 0,
      qtyNet: 0,
      refunds: 0,
      netSales: 0,
      refundUpgrades: 0,
      type: "",
    };
    return tierCulm;
  }, {});
};

const makeUpgradeTypesMap = (upgrades: IEventUpgrade[]): EventReportMap => {
  return upgrades.reduce((upgradeCulm: EventReportMap, upgrade: IEventUpgrade) => {
    upgradeCulm[upgrade._id as string] = {
      name: upgrade.name,
      grossSales: 0,
      qtySold: 0,
      refundTickets: 0,
      comps: 0,
      qtyNet: 0,
      refunds: 0,
      netSales: 0,
      refundUpgrades: 0,
      type: "",
    };
    return upgradeCulm;
  }, {});
}


const PDF = (data : any) => {
  const orders = data?.orders;
  const event = data?.events;
  const venue = data?.venue;
  const organization = data?.organization;
  // const fee = data?.fee;
  const { ticketTypes, upgrades } = event;

  const firstDay = event?.schedule && Time.format(
    event?.schedule?.startsAt,
    "ddd, MMM Do [at] h:mma",
    venue?.address?.timezone
  );
  const lastDay = event?.schedule && Time.format(
    event?.schedule?.endsAt,
    "ddd, MMM Do [at] h:mma",
    venue?.address?.timezone
  );

  const ticketMap: TicketTypeReportMap = (makeTicketTypesMap(ticketTypes as ITicketType[]));

  const upgradeMap: EventReportMap = (makeUpgradeTypesMap(upgrades as IEventUpgrade[]));

  let tax = 0 as number;

  const addSalesTax = (price: any) => {
    const netPrice = price
    return Price.output(netPrice.toFixed(2), true);
  }

  const ticketSummary = {
    name: "Ticket Summary",
    grossSales: 0,
    qtySold: 0,
    refundTickets: 0,
    comps: 0,
    qtyNet: 0,
    refunds: 0,
    netSales: 0,
  };

  const upgradeSummary = {
    name: "Upgrade Summary",
    grossSales: 0,
    qtySold: 0,
    comps: 0,
    qtyNet: 0,
    refunds: 0,
    netSales: 0,
    refundUpgrades: 0,
  };

  orders.forEach((order: IOrder) => {
    if(order.fees){
      tax = order?.fees?.filter((a: any) => a.name === EventSaleTaxEnum.SalesTax)[0]?.value
    }
    order.tickets.forEach((ticket: IOrderTicket) => {
      const includingTax = tax > 0 ? ticket.price / 100 * tax + ticket.price : ticket.price;
      if ((!ticketMap.hasOwnProperty(ticket.ticketTypeId))) {
        ticketMap[ticket.ticketTypeId] = {
          name: ticket.name,
          grossSales: 0,
          qtySold: 0,
          comps: 0,
          qtyNet: 0,
          refunds: 0,
          netSales: 0,
          refundTickets: 0,
          refundUpgrades: 0,
          tiers: {} as EventReportMap,
          type: order.type
        };
        return;
      }

      ticketMap[ticket.ticketTypeId].grossSales += includingTax;
      ticketMap[ticket.ticketTypeId].qtySold += 1;
      ticketMap[ticket.ticketTypeId].refunds += ticket.refund.refunded ? includingTax : 0;
      ticketMap[ticket.ticketTypeId].netSales += includingTax - (ticket.refund.refunded ? includingTax : 0);
      ticketMap[ticket.ticketTypeId].refundTickets += ticket.refund.refunded ? 1 : 0;
      ticketMap[ticket.ticketTypeId].comps += order.type === OrderTypeEnum.Complimentary ? 1 : 0;
      ticketMap[ticket.ticketTypeId].qtyNet += 1 - (ticket.refund.refunded ? includingTax : 0);


      if (typeof (ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId]) == 'undefined')
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId] = { grossSales: 0, type: "", qtySold: 0, refundTickets: 0, refundUpgrades: 0, comps: 0, qtyNet: 0, refunds: 0, netSales: 0, name: "Advance" };
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].grossSales += includingTax;
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].qtySold += 1;
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].refunds += ticket.refund.refunded ? includingTax : 0;
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].refundTickets += ticket.refund.refunded ? 1 : 0;
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].comps += order.type === OrderTypeEnum.Complimentary ? 1 : 0;


        ticketSummary.grossSales += includingTax;
        ticketSummary.qtySold += 1;
        ticketSummary.refunds += ticket.refund.refunded ? includingTax : 0;
        ticketSummary.netSales += includingTax - (ticket.refund.refunded ? includingTax : 0);
        ticketSummary.refundTickets += ticket.refund.refunded ? 1 : 0;
        ticketSummary.comps += order.type === OrderTypeEnum.Complimentary ? 1 : 0;
    });


    order.upgrades.forEach((upgrade: any) => {
      if (!upgradeMap[upgrade.upgradeId]) {
        upgradeMap[upgrade.upgradeId] = {
          name: upgrade.name,
          grossSales: 0,
          qtySold: 0,
          refundTickets: 0,
          comps: 0,
          qtyNet: 0,
          refunds: 0,
          netSales: 0,
          refundUpgrades: 0,
          type: "",
        };
      }
      upgradeMap[upgrade.upgradeId].grossSales += upgrade.price;
      upgradeMap[upgrade.upgradeId].qtySold += 1;
      upgradeMap[upgrade.upgradeId].refunds += upgrade.refund.refunded ? upgrade.price : 0;
      upgradeMap[upgrade.upgradeId].netSales += upgrade.price - (upgrade.refund.refunded ? upgrade.price : 0);
      upgradeMap[upgrade.upgradeId].refundUpgrades += upgrade.refund.refunded ? 1 : 0;
      upgradeMap[upgrade.upgradeId].comps += order.type === OrderTypeEnum.Complimentary ? 1 : 0;
      upgradeMap[upgrade.upgradeId].qtyNet += 1 - (upgrade.refund.refunded ? upgrade.price : 0);
      
      upgradeSummary.grossSales += upgrade.price;
      upgradeSummary.qtySold += 1;
      upgradeSummary.refunds += upgrade.refund.refunded ? upgrade.price : 0;
      upgradeSummary.netSales += upgrade.price - (upgrade.refund.refunded ? upgrade.price : 0);
      upgradeSummary.refundUpgrades += upgrade.refund.refunded ? 1 : 0;
      upgradeSummary.comps += order.type === OrderTypeEnum.Complimentary ? 1 : 0;
    });
  });

  const totalSummary = {
    grossSales: ticketSummary.grossSales + upgradeSummary.grossSales,
    refunds: ticketSummary.refunds + upgradeSummary.refunds,
    netSales: ticketSummary.netSales + upgradeSummary.netSales,
  };

  return (
    <Document>
      <Page size={{ width: 11 * 72, height: 8.5 * 72 }} style={styles.container} >
        <View style={styles.innerContainer}>
          <View style={(styles.table, styles.header, styles.bold)}>
            <View style={styles.row}>
              <Text style={styles.row1}>EVENT</Text>
              <Text style={styles.row1}>DATE</Text>
              <Text style={styles.row1}>VENUE</Text>
              <Text style={styles.row1}>ORGANIZER</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.row4}>{event?.name || 'No Event Name'}</Text>
              <Text style={styles.row4}>{event?.isMultipleDays ? (firstDay + " - " + lastDay) || 'No Event Date' : Time.format(event?.schedule?.startsAt, 'ddd, MMM DD, YYYY [at] h:mma', venue?.address?.timezone) || 'No Event Date'}</Text>
              <Text style={styles.row4}>{venue?.name || 'No Venue'}</Text>
              <Text style={styles.row4}>{organization?.orgName || 'No Organizer'}</Text>
            </View>
          </View>
          <View style={(styles.table, styles.bold)}>
            <View style={styles.backroundRow}>
              <Text style={styles.row2}>TICKETS</Text>
              <Text style={styles.row1}>QTY SOLD</Text>
              <Text style={styles.row1}>QTY REFUNDS</Text>
              <Text style={styles.row1}>QTY COMPS</Text>
              <Text style={styles.row1}>QTY NET</Text>
              <Text style={styles.row1}>GROSS SALES</Text>
              <Text style={styles.row1}>REFUNDS</Text>
              <Text style={styles.row1}>NET SALES</Text>
            </View>

            {Object.keys(ticketMap).map((ticket: any, index: number) => {
              return (
                <View style={styles.row} key={index}>
                  <Text style={styles.row2}>{ticketMap[ticket].name}</Text>
                  <Text style={styles.row3}>{ticketMap[ticket].qtySold.toString()}</Text>
                  <Text style={styles.row3}>{ticketMap[ticket].refundTickets.toString()}</Text>
                  <Text style={styles.row3}>{ticketMap[ticket].comps.toString()}</Text>
                  <Text style={styles.row3}>{(ticketMap[ticket].qtySold - ticketMap[ticket].refundTickets - ticketMap[ticket].comps).toString()}</Text>
                  <Text style={styles.row3}>{`$${addSalesTax(ticketMap[ticket].grossSales)}`}</Text>
                  <Text style={styles.row3}>{`$${addSalesTax(ticketMap[ticket].refunds)}`}</Text>
                  <Text style={styles.row3}>{`$${addSalesTax(ticketMap[ticket].netSales)}`}</Text>
                </View>
              );
            })}
            <View style={styles.row} >
              <Text style={styles.row2}>{ticketSummary.name}</Text>
              <Text style={styles.row3}>{ticketSummary.qtySold.toString()}</Text>
              <Text style={styles.row3}>{ticketSummary.refundTickets.toString()}</Text>
              <Text style={styles.row3}>{ticketSummary.comps.toString()}</Text>
              <Text style={styles.row3}>{(ticketSummary.qtySold - ticketSummary.refundTickets - ticketSummary.comps).toString()}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(ticketSummary.grossSales)}`}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(ticketSummary.refunds)}`}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(ticketSummary.netSales)}`}</Text>
            </View>
          </View>
          <View style={(styles.table, styles.bold)}>
            <View style={styles.backroundRow}>
              <Text style={styles.row2}>UPGRADES</Text>
              <Text style={styles.row1}>QTY SOLD</Text>
              <Text style={styles.row1}>QTY REFUNDS</Text>
              <Text style={styles.row1}>QTY COMPS</Text>
              <Text style={styles.row1}>QTY NET</Text>
              <Text style={styles.row1}>GROSS SALES</Text>
              <Text style={styles.row1}>REFUNDS</Text>
              <Text style={styles.row1}>NET SALES</Text>
            </View>
            {Object.keys(upgradeMap).map((upgrade: any, index: number) => {
              return (
                <View style={styles.row} key={index}>
                  <Text style={styles.row2}>{upgradeMap[upgrade].name}</Text>
                  <Text style={styles.row3}>{upgradeMap[upgrade].qtySold.toString()}</Text>
                  <Text style={styles.row3}>{upgradeMap[upgrade].refundUpgrades.toString()}</Text>
                  <Text style={styles.row3}>{upgradeMap[upgrade].comps.toString()}</Text>
                  <Text style={styles.row3}>{(upgradeMap[upgrade].qtySold - upgradeMap[upgrade].refundUpgrades - upgradeMap[upgrade].comps).toString()}</Text>
                  <Text style={styles.row3}>{`$${addSalesTax(upgradeMap[upgrade].grossSales)}`}</Text>
                  <Text style={styles.row3}>{`$${addSalesTax(upgradeMap[upgrade].refunds)}`}</Text>
                  <Text style={styles.row3}>{`$${addSalesTax(upgradeMap[upgrade].netSales)}`}</Text>
                </View>
              );
            })};
            <View style={styles.row} >
              <Text style={styles.row2}>{upgradeSummary.name}</Text>
              <Text style={styles.row3}>{upgradeSummary.qtySold.toString()}</Text>
              <Text style={styles.row3}>{upgradeSummary.refundUpgrades.toString()}</Text>
              <Text style={styles.row3}>{upgradeSummary.comps.toString()}</Text>
              <Text style={styles.row3}>{(upgradeSummary.qtySold - upgradeSummary.refundUpgrades - upgradeSummary.comps).toString()}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(upgradeSummary.grossSales)}`}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(upgradeSummary.refunds)}`}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(upgradeSummary.netSales)}`}</Text>
            </View>

          </View>
          <View style={(styles.table, styles.bold)}>
            <View style={styles.backroundRow}>
              <Text style={styles.row2}>TOTAL SALES</Text>
              <Text style={styles.row1}></Text>
              <Text style={styles.row1}></Text>
              <Text style={styles.row1}></Text>
              <Text style={styles.row1}></Text>
              <Text style={styles.row1}>GROSS SALES</Text>
              <Text style={styles.row1}>REFUNDS</Text>
              <Text style={styles.row1}>NET SALES</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.row2}></Text>
              <Text style={styles.row3}></Text>
              <Text style={styles.row3}></Text>
              <Text style={styles.row3}></Text>
              <Text style={styles.row3}></Text>
              <Text style={styles.row3}>{`$${addSalesTax(totalSummary.grossSales)}`}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(totalSummary.refunds)}`}</Text>
              <Text style={styles.row3}>{`$${addSalesTax(totalSummary.netSales)}`}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};



export const convertToPdf = async (data: any, event, venue, organization, fee) => {
  let pdf;
  try {
    pdf = await ReactPDF.renderToStream(<PDF orders={data?.orders} events={event?.event} venue={venue?.venue} organization={organization?.organization} fee={fee?.fees} />)

  } catch (error) {
    console.log(error);
  }
  return pdf
}

export default PDF