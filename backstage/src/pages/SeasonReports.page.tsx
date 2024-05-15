import React, { Fragment } from "react";
import styled from "styled-components";
import { Colors, Icons } from "@sellout/ui";
import useSeason from "../hooks/useSeason.hook";
import PageLoader from "../components/PageLoader";
import * as Time from "@sellout/utils/.dist/time";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import { useQuery } from "@apollo/react-hooks";
import QUERY_ORDERS from "@sellout/models/.dist/graphql/queries/orders.query";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import * as Price from "@sellout/utils/.dist/price";
import IOrderTicket from "@sellout/models/.dist/interfaces/IOrderTicket";
import { PaddedPage } from "../components/PageLayout";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import { EventSaleTaxEnum } from "@sellout/models/.dist/interfaces/IEvent";
import { OrderTypeEnum } from "@sellout/models/.dist/interfaces/IOrderType";
import ISeason from "@sellout/models/.dist/interfaces/ISeason";
import { useDispatch } from "react-redux";
import { ModalTypes } from "../components/modal/Modal";
import * as AppActions from "../redux/actions/app.actions";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { ButtonContainer } from "./EventReports.page";

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;
  margin-bottom: 24px;
  ${media.mobile`
      width: 100%;
      display: block;
    `};
`;

const PageTitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
  ${media.mobile`
      padding-bottom: 15px;
    `};
`;

const TableContainer = styled.div`
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  border: 1px solid ${Colors.Grey5};
  background: ${Colors.White};
  width: 100%;
  height: fit-content;
  max-height: calc(100% - 90px);
  overflow: scroll;
  max-width: 1000px;
`;

const SectionHeaderStyle = styled.div`
  width: 100%;
  height: 45px;
  display: flex;
  background: ${Colors.Grey6};
  align-items: center;
  padding: 0px 30px;
  box-sizing: border-box;
  min-width: 750px;
  @media print {
    min-width: 680px;
  }
`;

type SectionRowStyleProps = {
  bold?: boolean;
};

const SectionRowStyle = styled.div<SectionRowStyleProps>`
  width: 100%;
  height: 45px;
  display: flex;
  background: ${Colors.White};
  align-items: center;
  padding: 0px 30px;
  box-sizing: border-box;
  font-weight: ${(props) => (props.bold ? "600" : "500")};
  min-width: 750px;
  @media print {
    min-width: 680px;
  }
`;

const SectionSubRowStyle = styled.div<SectionRowStyleProps>`
  width: 100%;
  margin-bottom: 15px;
  display: flex;
  background: ${Colors.White};
  align-items: center;
  padding: 0px 30px;
  box-sizing: border-box;
  font-weight: ${(props) => (props.bold ? "600" : "500")};
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  display: flex;
  flex: 2;
`;

const RowTitle = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  display: flex;
  flex: 2;
`;

const TitleItem = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  display: flex;
  flex: 1;
`;

const RowItem = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  display: flex;
  flex: 1;
`;

const SubRowTitle = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  display: flex;
  flex: 2;
`;

const SubRowItem = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  display: flex;
  flex: 1;
`;

const ReportHeaderContainer = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0px 30px;
  min-width: 750px;
`;

const ReportHeaderSection = styled.div`
  margin-right: 40px;
`;

const ReportHeaderTitle = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.Grey3};
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const ReportHeaderItem = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
`;

const Border = styled.div`
  height: 1px;
  width: 100%;
  background: ${Colors.Grey6};
`;


type ReportHeaderProps = {
  season: any;
};

const timezone = "Asia/Calcutta";
const ReportHeader: React.FC<ReportHeaderProps> = ({ season }) => (
  <ReportHeaderContainer>
    <ReportHeaderSection>
      <ReportHeaderTitle>SEASON</ReportHeaderTitle>
      <ReportHeaderItem>{season?.name || "No Season Name"}</ReportHeaderItem>
    </ReportHeaderSection>
    <ReportHeaderSection>
      <ReportHeaderTitle>DATE</ReportHeaderTitle>
      <ReportHeaderItem>
        {" "}
        {Time.format(
          season?.schedule?.startsAt,
          "ddd, MMM DD, YYYY [at] h:mma",
          season?.venue?.address?.timezone
        )}
        {" - "}
        {Time.format(
          season?.schedule?.endsAt,
          "ddd, MMM DD, YYYY [at] h:mma",
          season?.venue?.address?.timezone
        )}
      </ReportHeaderItem>
    </ReportHeaderSection>
    <ReportHeaderSection>
      <ReportHeaderTitle>VENUE</ReportHeaderTitle>
      <ReportHeaderItem>{season?.venue?.name || "No Venue"}</ReportHeaderItem>
    </ReportHeaderSection>
    <ReportHeaderSection>
      <ReportHeaderTitle>ORGANIZER</ReportHeaderTitle>
      <ReportHeaderItem>
        {season?.organization?.orgName || "No Organizer"}
      </ReportHeaderItem>
    </ReportHeaderSection>
  </ReportHeaderContainer>
);

type SectionHeaderProps = {
  title: string;
  qtySold?: boolean;
  refundTickets?: boolean;
  // refundUpgrades?: boolean;
  comps?: boolean;
  qtyNet?: boolean;
  grossSales?: boolean;
  refunds?: boolean;
  netSales?: boolean;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  qtySold,
  refundTickets,
  // refundUpgrades,
  comps,
  qtyNet,
  grossSales,
  refunds,
  netSales,
}) => (
  <SectionHeaderStyle>
    <Title>{title}</Title>
    <TitleItem>{qtySold ? "QTY SOLD" : null}</TitleItem>
    <TitleItem>
      {refundTickets ? "QTY REFUNDS" : null}
      {/* {refundUpgrades ? "QTY REFUNDS" : null} */}
    </TitleItem>
    <TitleItem>{comps ? "QTY COMPS" : null}</TitleItem>
    <TitleItem>{qtyNet ? "QTY NET" : null}</TitleItem>
    <TitleItem>{grossSales ? "GROSS SALES" : null}</TitleItem>
    <TitleItem>{refunds ? "REFUNDS" : null}</TitleItem>
    <TitleItem>{netSales ? "NET SALES" : null}</TitleItem>
  </SectionHeaderStyle>
);

type SectionRowProps = {
  bold?: boolean;
  title?: string;
  qtySold?: string;
  grossSales?: string;
  refunds?: string;
  netSales?: string;
  refundTickets?: string;
  //refundUpgrades?: string;
  comps?: string;
  qtyNet?: string;
};

const SectionRow: React.FC<SectionRowProps> = ({
  bold,
  title,
  qtySold,
  grossSales,
  refunds,
  netSales,
  refundTickets,
  // refundUpgrades,
  comps,
  qtyNet,
}) => (
  <SectionRowStyle bold={bold}>
    <RowTitle>{title}</RowTitle>
    <RowItem>{qtySold || null}</RowItem>
    <RowItem>
      {refundTickets || null}
      {/* {refundUpgrades || null} */}
    </RowItem>
    <RowItem>{comps || null}</RowItem>
    <RowItem>{qtyNet || null}</RowItem>
    <RowItem>{grossSales || null}</RowItem>
    <RowItem>{refunds || null}</RowItem>
    <RowItem>{netSales || null}</RowItem>
  </SectionRowStyle>
);

type SectionSubRowProps = {
  title?: string;
  qtySold?: string;
  grossSales?: string;
  refunds?: string;
  netSales?: string;
  refundTickets?: string;
  comps?: string;
  qtyNet?: string;
  // refundUpgrades?: string;
};

const SectionSubRow: React.FC<SectionSubRowProps> = ({
  title,
  qtySold,
  grossSales,
  refunds,
  refundTickets,
  netSales,
  comps,
  qtyNet,
  // refundUpgrades,
}) => (
  <SectionSubRowStyle>
    <SubRowTitle>&nbsp;&nbsp;&nbsp;&nbsp;{title}</SubRowTitle>
    <SubRowItem>{qtySold || null}</SubRowItem>
    {/* <SubRowItem>{refundUpgrades || null}</SubRowItem> */}
    <SubRowItem>{comps || null}</SubRowItem>
    <SubRowItem>{qtyNet || null}</SubRowItem>
    <SubRowItem>{grossSales || null}</SubRowItem>
    <SubRowItem>{refunds || null}</SubRowItem>
    <SubRowItem>{netSales || null}</SubRowItem>
  </SectionSubRowStyle>
);

interface IEventReportItem {
  name: string;
  grossSales: number;
  qtySold: number;
  refundTickets: number;
  refunds: number;
  netSales: number;
  comps: number;
  qtyNet: number;
  // refundUpgrades: number;
  type?: string;
}

type EventReportMap = Record<string, IEventReportItem>;
type TicketTypeReportMap = Record<
  string,
  IEventReportItem & { tiers: EventReportMap }
>;

const makeTicketTypesMap = (
  ticketTypes: ITicketType[]
): TicketTypeReportMap => {
  return ticketTypes.reduce(
    (ticketCulm: TicketTypeReportMap, ticketType: ITicketType) => {
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
        // refundUpgrades: 0,
        type: "",
      };
      return ticketCulm;
    },
    {}
  );
};

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
      // refundUpgrades: 0,
      type: "",
    };
    return tierCulm;
  }, {});
};

const makeUpgradeTypesMap = (upgrades: IEventUpgrade[]): EventReportMap => {
  return upgrades.reduce(
    (upgradeCulm: EventReportMap, upgrade: IEventUpgrade) => {
      upgradeCulm[upgrade._id as string] = {
        name: upgrade.name,
        grossSales: 0,
        qtySold: 0,
        refundTickets: 0,
        comps: 0,
        qtyNet: 0,
        refunds: 0,
        netSales: 0,
        //  refundUpgrades: 0,
        type: "",
      };
      return upgradeCulm;
    },
    {}
  );
};

type RenderRowsProps = {
  season: ISeason;
  orders: IOrder[];
};

const RenderRows: React.FC<RenderRowsProps> = ({ season, orders }) => {
  const { ticketTypes } = season;

  // init lists of everything

  const ticketMap: TicketTypeReportMap = makeTicketTypesMap(
    ticketTypes as ITicketType[]
  );

  //   const upgradeMap: EventReportMap = makeUpgradeTypesMap(
  //     upgrades as IEventUpgrade[]
  //   );

  //  console.log(upgradeMap);
  let tax = 0 as number;

  const addSalesTax = (price: any) => {
    const netPrice = price;
    return Price.output(netPrice.toFixed(2), true);
  };

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

  orders.forEach((order: IOrder) => {
    if (order.fees) {
      tax = order?.fees?.filter(
        (a: any) => a.name === EventSaleTaxEnum.SalesTax
      )[0]?.value;
    }
    // loop through order tickets determining values
    order.tickets.forEach((ticket: IOrderTicket) => {
      const includingTax =
        tax > 0 ? (ticket.price / 100) * tax + ticket.price : ticket.price;
      // fail safe for ticket that is not on event but is somehow in orders
      if (!ticketMap.hasOwnProperty(ticket.ticketTypeId)) {
        ticketMap[ticket.ticketTypeId] = {
          name: ticket.name,
          grossSales: 0,
          qtySold: 0,
          comps: 0,
          qtyNet: 0,
          refunds: 0,
          netSales: 0,
          refundTickets: 0,
          //refundUpgrades: 0,
          tiers: {} as EventReportMap,
          type: order.type,
        };
        return;
      }

      // ticket type
      ticketMap[ticket.ticketTypeId].grossSales += includingTax;
      ticketMap[ticket.ticketTypeId].qtySold += 1;
      ticketMap[ticket.ticketTypeId].refunds += ticket.refund.refunded
        ? includingTax
        : 0;
      ticketMap[ticket.ticketTypeId].netSales +=
        includingTax - (ticket.refund.refunded ? includingTax : 0);
      ticketMap[ticket.ticketTypeId].refundTickets += ticket.refund.refunded
        ? 1
        : 0;
      ticketMap[ticket.ticketTypeId].comps +=
        order.type === OrderTypeEnum.Complimentary ? 1 : 0;
      ticketMap[ticket.ticketTypeId].qtyNet +=
        1 - (ticket.refund.refunded ? includingTax : 0);

      // ticket tier
      if (
        typeof ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId] ==
        "undefined"
      )
        // ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId] = {grossSales : 0, qtySold: 0, refunds: 0, netSales:0, name: "Day of Show"};
        ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId] = {
          grossSales: 0,
          type: "",
          qtySold: 0,
          refundTickets: 0,
          // refundUpgrades: 0,
          comps: 0,
          qtyNet: 0,
          refunds: 0,
          netSales: 0,
          name: "Advance",
        };
      ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].grossSales +=
        includingTax;
      ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].qtySold += 1;
      ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].refunds +=
        ticket.refund.refunded ? includingTax : 0;
      ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].refundTickets +=
        ticket.refund.refunded ? 1 : 0;
      ticketMap[ticket.ticketTypeId].tiers[ticket.ticketTierId].comps +=
        order.type === OrderTypeEnum.Complimentary ? 1 : 0;

      // tickets summary
      ticketSummary.grossSales += includingTax;
      ticketSummary.qtySold += 1;
      ticketSummary.refunds += ticket.refund.refunded ? includingTax : 0;
      ticketSummary.netSales +=
        includingTax - (ticket.refund.refunded ? includingTax : 0);
      ticketSummary.refundTickets += ticket.refund.refunded ? 1 : 0;
      ticketSummary.comps += order.type === OrderTypeEnum.Complimentary ? 1 : 0;
    });
  });

  // loop through order upgrades determining values
  //     order.upgrades.forEach((upgrade: any) => {
  //       // fail safe for upgrade that is not on event but is somehow in orders
  //       if (!upgradeMap[upgrade.upgradeId]) {
  //         upgradeMap[upgrade.upgradeId] = {
  //           name: upgrade.name,
  //           grossSales: 0,
  //           qtySold: 0,
  //           refundTickets: 0,
  //           comps: 0,
  //           qtyNet: 0,
  //           refunds: 0,
  //           netSales: 0,
  //           refundUpgrades: 0,
  //           type: "",
  //         };
  //       }
  //       // upgrade type
  //       upgradeMap[upgrade.upgradeId].grossSales += upgrade.price;
  //       upgradeMap[upgrade.upgradeId].qtySold += 1;
  //       upgradeMap[upgrade.upgradeId].refunds += upgrade.refund.refunded
  //         ? upgrade.price
  //         : 0;
  //       upgradeMap[upgrade.upgradeId].netSales +=
  //         upgrade.price - (upgrade.refund.refunded ? upgrade.price : 0);
  //       upgradeMap[upgrade.upgradeId].refundUpgrades += upgrade.refund.refunded
  //         ? 1
  //         : 0;
  //       upgradeMap[upgrade.upgradeId].comps +=
  //         order.type === OrderTypeEnum.Complimentary ? 1 : 0;
  //       upgradeMap[upgrade.upgradeId].qtyNet +=
  //         1 - (upgrade.refund.refunded ? upgrade.price : 0);
  //       //upgrade summary
  //       upgradeSummary.grossSales += upgrade.price;
  //       upgradeSummary.qtySold += 1;
  //       upgradeSummary.refunds += upgrade.refund.refunded ? upgrade.price : 0;
  //       upgradeSummary.netSales +=
  //         upgrade.price - (upgrade.refund.refunded ? upgrade.price : 0);
  //       upgradeSummary.refundUpgrades += upgrade.refund.refunded ? 1 : 0;
  //       upgradeSummary.comps +=
  //         order.type === OrderTypeEnum.Complimentary ? 1 : 0;
  //     });
  //   });

  const totalSummary = {
    grossSales: ticketSummary.grossSales,
    refunds: ticketSummary.refunds,
    netSales: ticketSummary.netSales,
  };

  return (
    <>
      <SectionHeader
        title="TICKETS"
        qtySold
        refundTickets
        comps
        qtyNet
        grossSales
        refunds
        netSales
      />
      {Object.keys(ticketMap).map((ticket: any, index: number) => {
        let tiers = ticketMap[ticket].tiers;
        return (
          <Fragment key={index}>
            <SectionRow
              title={ticketMap[ticket].name}
              qtySold={ticketMap[ticket].qtySold.toString()}
              grossSales={`$${addSalesTax(ticketMap[ticket].grossSales)}`}
              refunds={`$${addSalesTax(ticketMap[ticket].refunds)}`}
              netSales={`$${addSalesTax(ticketMap[ticket].netSales)}`}
              refundTickets={ticketMap[ticket].refundTickets.toString()}
              qtyNet={(
                ticketMap[ticket].qtySold -
                ticketMap[ticket].refundTickets -
                ticketMap[ticket].comps
              ).toString()}
              comps={ticketMap[ticket].comps.toString()}
            />
            {/* {Object.keys(tiers).map((tier: any, index: number) => {
              return (
                <SectionSubRow
                  key={index}
                  title={ticketMap[ticket].tiers[tier].name}
                  qtySold={ticketMap[ticket].tiers[tier].qtySold.toString()}
                  grossSales={`$${addSalesTax(ticketMap[ticket].tiers[tier].grossSales)}`}
                  refunds={`$${addSalesTax(ticketMap[ticket].tiers[tier].refunds)}`}
                  netSales={`$${addSalesTax(ticketMap[ticket].tiers[tier].netSales)}`}
                />
              );
            })} */}
            <Border />
          </Fragment>
        );
      })}
      <SectionRow
        bold
        title={ticketSummary.name}
        qtySold={ticketSummary.qtySold.toString()}
        refundTickets={ticketSummary.refundTickets.toString()}
        comps={ticketSummary.comps.toString()}
        netSales={`$${addSalesTax(ticketSummary.netSales)}`}
        grossSales={`$${addSalesTax(ticketSummary.grossSales)}`}
        refunds={`$${addSalesTax(ticketSummary.refunds)}`}
        qtyNet={(
          ticketSummary.qtySold -
          ticketSummary.refundTickets -
          ticketSummary.comps
        ).toString()}
      />
      {/* <SectionHeader
        title="UPGRADES"
        qtySold
        refundUpgrades
        comps
        qtyNet
        grossSales
        refunds
        netSales
      />
      {Object.keys(upgradeMap).map((upgrade: any, index: number) => {
        return (
          <Fragment key={index}>
            <SectionRow
              title={upgradeMap[upgrade].name}
              comps={upgradeMap[upgrade].comps.toString()}
              qtySold={upgradeMap[upgrade].qtySold.toString()}
              grossSales={`$${addSalesTax(upgradeMap[upgrade].grossSales)}`}
              refunds={`$${addSalesTax(upgradeMap[upgrade].refunds)}`}
              netSales={`$${addSalesTax(upgradeMap[upgrade].netSales)}`}
              refundUpgrades={upgradeMap[upgrade].refundUpgrades.toString()}
              qtyNet={(
                upgradeMap[upgrade].qtySold -
                upgradeMap[upgrade].refundUpgrades -
                upgradeMap[upgrade].comps
              ).toString()}
            />
            <Border />
          </Fragment>
        );
      })}
      <SectionRow
        bold
        title={upgradeSummary.name}
        qtySold={upgradeSummary.qtySold.toString()}
        refundTickets={upgradeSummary.refundUpgrades.toString()}
        comps={upgradeSummary.comps.toString()}
        qtyNet={(
          upgradeSummary.qtySold -
          upgradeSummary.refundUpgrades -
          upgradeSummary.comps
        ).toString()}
        grossSales={`$${addSalesTax(upgradeSummary.grossSales)}`}
        refunds={`$${addSalesTax(upgradeSummary.refunds)}`}
        netSales={`$${addSalesTax(upgradeSummary.netSales)}`}
      /> */}
      {/* <SectionHeader
        title="FEES"
        qtySold
        grossSales
        refunds
        netSales
      /> */}
      <SectionHeader title="TOTAL SALES" grossSales refunds netSales />
      <SectionRow
        grossSales={`$${addSalesTax(totalSummary.grossSales)}`}
        refunds={`$${addSalesTax(totalSummary.refunds)}`}
        netSales={`$${addSalesTax(totalSummary.netSales)}`}
      />
    </>
  );
};

type SeasonReportsProps = {};
const SeasonReports: React.FC<SeasonReportsProps> = () => {
  /* Hooks */
  const dispatch = useDispatch();
  const { season } = useSeason();
  const { data } = useQuery(QUERY_ORDERS, {
    variables: {
      query: {
        seasonIds: [season?._id],
      },
    },
  });

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(season && data?.orders)} />
      {season && data?.orders && (
        <PaddedPage>
          <PageHeader>
            <PageTitle>Sales Report</PageTitle>
            <ButtonContainer>
            <Button
              type={ButtonTypes.Thin}
              icon={Icons.PrintRegular}
              text="Print report"
              onClick={() => window.print()}
              margin={"0 5px 0 0"}
            />
            </ButtonContainer>
          </PageHeader>
            <TableContainer>
              <ReportHeader season={season} />
              <RenderRows season={season} orders={data?.orders} />
            </TableContainer>
        </PaddedPage>
      )}
    </>
  );
};

export default SeasonReports;
