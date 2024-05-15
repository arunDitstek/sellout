import React from "react";
import styled from "styled-components";
import useEvent from "../../hooks/useEvent.hook";
import useSeats from "../../hooks/useSeats.hook";
import VenueSeatingChart from "../VenueSeatingChart";

const Container = styled.div`
  position: relative;
`;

type CreateEventSeatingChartProps = {};

const CreateEventSeatingChart: React.FC<CreateEventSeatingChartProps> = () => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { client } = useSeats();

  /* State */
  const [chart, setChart] = React.useState(null);

  /* Actions */
  React.useEffect(() => {
    const fetchData = async () => {
      if (client && event?.seatingChartKey) {
        setChart(null);
        let chart = await client.charts.retrieve(event?.seatingChartKey);
        chart.categories = await client.chartReports.byCategoryLabel(chart.key);
        setChart(chart);
      }
    };
    fetchData();
  }, [client, event?.seatingChartKey]);

  /** Render */
  if (!event?.seatingChartKey) return null;

  return (
    <Container>
      <VenueSeatingChart chart={chart} showActions={false} margin="10px 0" />
    </Container>
  );
};

export default CreateEventSeatingChart;
