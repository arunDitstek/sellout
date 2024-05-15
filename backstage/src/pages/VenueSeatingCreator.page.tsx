import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import * as AppActions from "../redux/actions/app.actions";
import { Colors } from "@sellout/ui";
import useVenue from "../hooks/useVenue.hook";
import useSeats from "../hooks/useSeats.hook";
import { SeatsioDesigner } from "@seatsio/seatsio-react";
import { useHistory } from "react-router";
import PageLoader from "../components/PageLoader";

const Container = styled.div`
  position: relative;
  height: calc(100% - 30px);
  width: calc(100vw - 425px);
  overflow: hidden;
  flex: 1;

  > div {
    height: 100%;
    width: 100%;
  }
`;

const PageTitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
`;

type VenueSeatingProps = {};

const VenueSeating: React.FC<VenueSeatingProps> = () => {
  /* Hooks */
  const { venueId, loading: venueLoading } = useVenue();
  const { client, secretKey, initializing } = useSeats();
  const history = useHistory();

  /* State */
  const appState = useSelector((state: BackstageState) => state.app);
  const { chartKey } = appState;

  /* Actions */
  const dispatch = useDispatch();
  const setChartKey = (chartKey: string) =>
    dispatch(AppActions.setChartKey(chartKey));

  /* Render */
  const loading = venueLoading || initializing;

  return (
    <Fragment>
      <PageLoader nav={true} fade={!loading} />
      {!loading && client !== undefined && (
        <Container>
          <SeatsioDesigner
            secretKey={secretKey}
            chartKey={chartKey}
            region="eu"
            onChartCreated={(chartKey: string) => {
              client?.charts.addTag(chartKey, venueId);
              //setChartKey(chartKey);
            }}
            onExitRequested={() => {
              history.push(
                `/admin/dashboard/venues/details/seating?venueId=${venueId}`
              );
              dispatch(AppActions.setChartKey(""));
            }}
          />
        </Container>
      )}
    </Fragment>
  );
};

export default VenueSeating;
