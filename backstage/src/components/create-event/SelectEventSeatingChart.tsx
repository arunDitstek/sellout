import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as EventActions from "../../redux/actions/event.actions";
import useEvent from "../../hooks/useEvent.hook";
import useSeats from "../../hooks/useSeats.hook";
import { ChartListParams } from "seatsio";
import SearchDropdown, {
  SearchDropdownTypes,
} from "@sellout/ui/build/components/SearchDropdown";
import CreateEventSeatingChart from "./CreateEventSeatingChart";
import { Icon, Icons, Colors } from "@sellout/ui";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  max-width: 400px;
`;

const Warning = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  width: 100%;
  max-width: 380px;
  border-radius: 10px;
  background-color: ${Colors.Grey6};
  margin-top: 10px;
  ${media.mobile`
    width: auto;
  `};
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  flex: 1;
  margin-left: 10px;
`;

type SelectEventSeatingChartProps = {
  showChart?: boolean;
};

const SelectEventSeatingChart: React.FC<SelectEventSeatingChartProps> = ({
  showChart = true,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { client } = useSeats(); // HANDLE ERROR

  /* State */
  const venueId = event?.venueId;
  const [loading, setLoading] = React.useState(false);
  const [charts, setCharts] = React.useState([]);

  /* Actions */
  const dispatch = useDispatch();

  const showNotification = (message: string) =>
    dispatch(
      AppActions.showNotification(message, AppNotificationTypeEnum.Error)
    );

  const selectEventSeatingChart = (seatingChartKey: string) => {
    if (event?.hasOrders) {
      showNotification(
        "This field cannot be changed once orders have been created. Please contact support with questions or comments."
      );
      return;
    }
    dispatch(EventActions.selectEventSeatingChart(eventId, seatingChartKey));
  };

  const clearEventSeatingChartFields = () => {
    if (event?.hasOrders) {
      showNotification(
        "This field cannot be changed once orders have been created. Please contact support with questions or comments."
      );
      return;
    }
    dispatch(EventActions.clearEventSeatingChartFields(eventId));
  };
  React.useEffect(() => {
    const fetchData = async () => {
      if (client && !loading) {
        setLoading(true);
        const params = new ChartListParams().withTag(venueId);
        const { items: charts } = await client.charts.listFirstPage(params);

        setCharts(charts);
        setLoading(false);
      }
    };
    fetchData();
  }, [venueId, client]);

  /** Render */

  const items = charts?.map((chart: any) => {
    return {
      value: chart.key,
      text: chart.name,
    };
  });

  const footer = (
    <TextButton
      onClick={() =>
        window.location.assign(
          `/admin/dashboard/venues/details/seating/create?venueId=${venueId}`
        )
      }
      icon={Icons.PlusCircleLight}
      size={TextButtonSizes.Small}
    >
      Add new seating chart
    </TextButton>
  );

  return (
    <Container>
      <SearchDropdown
        type={SearchDropdownTypes.SingleSelect}
        value={event?.seatingChartKey}
        items={items}
        width="100%"
        onChange={(seatingChartKey: string) => {
          selectEventSeatingChart(seatingChartKey);
        }}
        onClear={() => clearEventSeatingChartFields()}
        placeholder="Search for seating charts"
        label="Select a seating chart"
        tip="Select a seating chart"
        // footer={footer}
      />
      {showChart && <CreateEventSeatingChart />}
      <Warning>
        <Icon icon={Icons.Warning} color={Colors.Yellow} size={14} />
        <Text>
          Using a seating chart locks your ticket types to the way they are
          assigned in the chart. To use different ticket types, you must create
          and select a new seating chart. Read more about seating charts here.
        </Text>
      </Warning>
    </Container>
  );
};

export default SelectEventSeatingChart;
