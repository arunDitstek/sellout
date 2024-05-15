import React from "react";
import styled from "styled-components";
import useEvent from "../../hooks/useEvent.hook";
import useSeats from "../../hooks/useSeats.hook";
import VenueSeatingChart from "../VenueSeatingChart";
import useSeason from "../../hooks/useSeason.hook";

const Container = styled.div`
  position: relative;
`;

type CreateSeasonSeatingChartProps = {};

const CreateSeasonSeatingChart: React.FC<
  CreateSeasonSeatingChartProps
> = () => {
  /* Hooks */

  const { client } = useSeats();
  const { season, seasonId } = useSeason();

  /* State */
  const [chart, setChart] = React.useState(null);

  /* Actions */
  React.useEffect(() => {
    const fetchData = async () => {
      if (client && season?.seatingChartKey) {
        setChart(null);
        let chart = await client.charts.retrieve(season?.seatingChartKey);
        chart.categories = await client.chartReports.byCategoryLabel(chart.key);
        setChart(chart);
      }
    };
    fetchData();
  }, [client, season?.seatingChartKey]);

  /** Render */
  if (!season?.seatingChartKey) return null;

  return (
    <Container>
      <VenueSeatingChart chart={chart} showActions={false} margin="10px 0" />
    </Container>
  );
};

export default CreateSeasonSeatingChart;
