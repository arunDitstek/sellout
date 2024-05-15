import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import * as AppActions from "../redux/actions/app.actions";
import Input from "@sellout/ui/build/components/Input";
import { useHistory } from "react-router";
import useVenue from "../hooks/useVenue.hook";
import useSeats from "../hooks/useSeats.hook";
import { Icon, Icons, Colors, Loader } from "@sellout/ui";
import Flex from "@sellout/ui/build/components/Flex";

type ContainerProps = {
  hover: boolean;
  margin: string;
};

const Container = styled.div<ContainerProps>`
  width: 300px;
  height: 325px;
  transition: 0.2s;
  border: 1px solid ${Colors.Grey6};
  border-radius: 10px;
  margin: ${(props) => props.margin};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  background-color: ${Colors.White};

  &:hover {
    cursor: ${(props) => (props.hover ? "pointer" : null)};
  }
`;

const Content = styled.div``;

const InfoContainer = styled.div`
  padding: 20px;
  width: fill-available;
  height: 35px;
  border-bottom: 1px solid ${Colors.Grey6};
`;

const Name = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const Value = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-right: 10px;
`;

const Actions = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
`;

const Image = styled.img`
  position: relative;
  width: 300px;
  height: 250px;
`;

type VenueSeatingChartProps = {
  chart?: any;
  showActions?: boolean;
  deleteChart?: (chartKey: string) => void;
  margin?: string;
};

const VenueSeatingChart: React.FC<VenueSeatingChartProps> = ({
  chart,
  showActions = true,
  deleteChart,
  margin = "30px 30px 0 0",
}) => {
  /* Hooks */
  const { venueId } = useVenue();
  const { client } = useSeats();
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => {
    dispatch(AppActions.popModal());
  };

  const viewChart = async () => {
    dispatch(AppActions.setChartKey(chart.key));
    history.push(
      `/admin/dashboard/venues/details/seating/create?venueId=${venueId}&chartKey=${chart.key}`
    );
  };

  const duplicateChart = async () => {
    const { key } = await client.charts.copy(chart.key);
    dispatch(AppActions.setChartKey(key));
    history.push(
      `/admin/dashboard/venues/details/seating/create?venueId=${venueId}&chartKey=${key}`
    );
  };

  const removeChart = async () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Delete Seating Chart?",
        message:
          "This seating chart cannot be removed if it is currently in use. Would you like to continue?",
        confirm: async () => {
          if (deleteChart) deleteChart(chart.key);
          popModal();
          await client.charts.moveToArchive(chart.key);
        },
        cancel: popModal,
        confirmText: "DELETE CHART",
        cancelText: "KEEP CHART",
      })
    );
  };

  /** Render */
  if (!chart) {
    return (
      <Container hover={false} margin={margin}>
        <Flex flex="1" align="center" justify="center" height="100%">
          <Loader color={Colors.Orange} />
        </Flex>
      </Container>
    );
  }

  type SeatingChartInfo = {
    capacity: number;
    sections: any;
    ticketTypes: number;
  };

  const { capacity, sections, ticketTypes } = Object.values(
    chart.categories
  ).reduce(
    (cur: SeatingChartInfo, next: any): SeatingChartInfo => {
      const tableData = next.filter((a) => a.bookAsAWhole === true);
      const totalSeats = tableData.map((a) => a.numSeats);
      const removeSeats = totalSeats.reduce((acc, curr) => acc + curr, 0);
      cur.capacity +=
        next.length === 1
          ? next[0].capacity
          : next.filter((a) => a.objectType === "seat").length -
            removeSeats +
            tableData.length;
      cur.ticketTypes += 1;
      cur.sections = next.reduce((cur: any, next: any) => {
        cur[next.section] = true;
        return cur;
      }, cur.sections);
      return cur;
    },
    {
      capacity: 0,
      sections: {},
      ticketTypes: 0,
    } as SeatingChartInfo
  );

  return (
    <Container hover={showActions} margin={margin}>
      {showActions && (
        <Actions>
          <Icon
            icon={Icons.CopySolid}
            color={Colors.Grey5}
            hoverColor={Colors.Grey4}
            size={12}
            onClick={() => duplicateChart()}
            margin="0 15px 0 0"
          />
          <Icon
            icon={Icons.DeleteSolid}
            color={Colors.Grey5}
            hoverColor={Colors.Red}
            size={12}
            onClick={() => removeChart()}
          />
        </Actions>
      )}
      <Content onClick={showActions ? () => viewChart() : () => {}}>
        <InfoContainer>
          <Name>{chart.name}</Name>
          <Flex direction="row" align="center">
            <Value>Seats: {capacity}</Value>
            <Value>Sections: {Object.keys(sections).length}</Value>
            <Value>Ticket Types: {ticketTypes}</Value>
          </Flex>
        </InfoContainer>
        <Image src={chart.publishedVersionThumbnailUrl} />
      </Content>
    </Container>
  );
};

export default VenueSeatingChart;
