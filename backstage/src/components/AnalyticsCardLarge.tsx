import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import IAnalytics from "@sellout/models/.dist/interfaces/IAnalytics";
import AnalyticsQuerySelector from "./AnalyticsQuerySelector";
import HeatMap from "./HeatMap";
import AnalyticsCardLargeGraph from "./AnalyticsCardLargeGraph";

const Container = styled.div`
  width: 100%;
  background: ${Colors.White};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  border: 1px solid ${Colors.Grey5};
  margin: 0px 24px 24px 0px;
  @media (max-width: 1500px) {
    max-width: 1500px;
  }
`;

enum Display {
  Graph = "Graph",
  Map = "Map",
}

type AnalyticsCardLargeProps = {
  data: IAnalytics;
  setQuery: Function;
  query: any;
  timezone?: string;
};

const AnalyticsCardLarge: React.FC<AnalyticsCardLargeProps> = ({
  data,
  setQuery,
  query,
  timezone = undefined,
}) => {
  const [display, setDisplay] = React.useState(Display.Graph);
  return (
    <Container>
      <AnalyticsQuerySelector
        data={data}
        setQuery={setQuery}
        query={query}
        showIntervals={display === Display.Graph}
      />
      {display === Display.Graph ? (
        <AnalyticsCardLargeGraph
          data={data}
          setDisplay={setDisplay}
          timezone={timezone}
        />
      ) : (
        <HeatMap
          query={query}
          width="100%"
          height="328px"
          setDisplay={setDisplay}
        />
      )}
    </Container>
  );
};

export default AnalyticsCardLarge;
