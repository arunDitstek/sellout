import React from "react";
import styled from "styled-components";
import { Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { Colors } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import CreateArtistType from "../pages/create-artist/CreateArtistType.page";
import CreateArtistDetails from '../pages/create-artist/CreateArtistDetails.page';
import CreateArtistControls from "../components/create-artist/CreateArtistControls";
import * as ArtistActions from '../redux/actions/artist.actions';
import * as AppActions from "../redux/actions/app.actions";
import PageLoader from "../components/PageLoader";
import ISaveChanges from "../models/interfaces/ISaveChanges";
import saveChangesState from '../models/states/saveChanges.state';
import * as ChangeUtil from '../utils/ChangeUtil';
import useIsCreateArtistType from '../hooks/useIsCreateArtistType.hook';
import useArtist from "../hooks/useArtist.hook";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  background: ${Colors.OffWhite};
  height: 100%;
  flex: 1;
  min-width: 700px;
  overflow: scroll;
`;

const HideOnMobile = styled.div`
  ${media.mobile`
    display: none;
  `};

  ${media.desktop`
    width: 400px;
  `};

  ${media.giant`
    flex: 1;
  `};
`;

type CreateArtistContainerProps = {
  match: any;
};

const CreateArtistContainer: React.FC<CreateArtistContainerProps> = ({ match }) => {
  /* Hooks */
  const { artist } = useArtist();
  const isCreateArtistType: boolean = useIsCreateArtistType();
  
  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId } = artistState;

  /* Actions */
  const dispatch = useDispatch();

  const saveArtist = () => dispatch(ArtistActions.saveArtist(false, true));
  const reCacheArtist = () => dispatch(ArtistActions.reCacheArtist(artistId));

  const setSaveChanges = (saveChanges: Partial<ISaveChanges>) => {
    dispatch(AppActions.setSaveChanges(saveChanges));
  };

  /** Effects */
  React.useEffect(() => {
    async function effect() {
      if (artist) {
        setSaveChanges({
          hasChanges: await ChangeUtil.hasArtistChanged(artist),
          saveChanges: () => saveArtist(),
          discardChanges: () => reCacheArtist(),
        });
      }
    }
    effect();  
    return () => setSaveChanges(saveChangesState())
  }, [artist]);

  /** Render */
  return (
    <Container>
      {(() => {
        if(!artist) {
          return <PageLoader nav={true} />
        }

        if(isCreateArtistType) {
          return (
            <Content>
              <Route
                path={`${match.url}/type`}
                component={CreateArtistType}
              />
            </Content>
          );
        }

        return (
          <Content>
            <Route
              path={`${match.url}/details`}
              component={CreateArtistDetails}
            />
            {/* <Route path={`${match.url}/genres`} component={} />
            <Route
              path={`${match.url}/social`}
              component={CreateArtistDatesTimes}
            />
            <Route
              path={`${match.url}/contacts`}
              component={CreateArtistTicketTypes}
            /> */}
            {/* <Redirect from={`${match.url}`} to={{ pathname: `${match.url}/details`, search: location.search }} /> */}
            <CreateArtistControls />
          </Content>  
        );
      })()}
    </Container>
  );
};

export default CreateArtistContainer;
