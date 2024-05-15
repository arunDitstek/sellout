import React, { Fragment } from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import Masonry from "react-masonry-component";
import useVenue from "../hooks/useVenue.hook";
import useSeats from "../hooks/useSeats.hook";
import { useHistory } from "react-router";
import { ChartListParams } from "seatsio";
import PageLoader from "../components/PageLoader";
import VenueSeatingChart from "../components/VenueSeatingChart";
import Button, {
  ButtonStates,
  ButtonTypes,
} from "@sellout/ui/build/components/Button";
import {
  NoContentTitle,
  NoContentContainer,
} from "../components/NoPageContent";
import { PageTitle, PaddedPage } from "../components/PageLayout";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${media.mobile`
   display: block;
  `};
`;
const Content = styled.div`
  position: relative;
  /* width: fill-available;
  height: fill-available; */
`;

type VenueSeatingProps = {};

const VenueSeating: React.FC<VenueSeatingProps> = () => {
  /* Hooks */
  const { venueId } = useVenue();
  const { client } = useSeats();
  const history = useHistory();
  const [charts, setCharts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  /* Actions */
  const deleteChart = (chartKey: string) => {
    setCharts(charts.filter((stateChart) => stateChart.key !== chartKey));
  };

  /* Data */
  React.useEffect(() => {
    const fetchData = async () => {
      if (client && !loading) {
        setLoading(true);
        const params = new ChartListParams().withTag(venueId);

        const { items } = await client.charts.listFirstPage(params);

        const charts = await Promise.all(
          items.map(async (chart: any) => {
            chart.categories = await client.chartReports.byCategoryLabel(
              chart.key
            );
            return chart;
          })
        );
        setCharts(charts);
        setLoading(false);
      }
    };
    fetchData();
  }, [client]);

  /* Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={!loading} />
      {!loading && (
        <PaddedPage>
          {charts.length > 0 ? (
            <>
              <TitleContainer>
                <PageTitle>Seating</PageTitle>
                <Button
                  type={ButtonTypes.Regular}
                  state={ButtonStates.Active}
                  text="ADD A SEATING CHART"
                  onClick={() => {
                    history.push(
                      `/admin/dashboard/venues/details/seating/create?venueId=${venueId}`
                    );
                  }}
                />
              </TitleContainer>
              <Content>
                <Masonry options={{ horizontalOrder: true }}>
                  {charts.map((chart: any, index: number) => {
                    return (
                      <VenueSeatingChart
                        key={index}
                        chart={chart}
                        deleteChart={deleteChart}
                      />
                    );
                  })}
                </Masonry>
              </Content>
            </>
          ) : (
            <NoContentContainer>
              <NoContentTitle>No seating charts yet</NoContentTitle>
              <Button
                type={ButtonTypes.Regular}
                state={ButtonStates.Active}
                text="ADD A SEATING CHART"
                onClick={() => {
                  history.push(
                    `/admin/dashboard/venues/details/seating/create?venueId=${venueId}`
                  );
                }}
              />
            </NoContentContainer>
          )}
        </PaddedPage>
      )}
    </Fragment>
  );
};

export default VenueSeating;
