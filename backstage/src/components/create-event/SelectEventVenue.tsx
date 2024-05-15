import React from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { useQuery } from "@apollo/react-hooks";
import { useSelector, useDispatch } from "react-redux";
import { Colors, Icon, Icons } from "@sellout/ui";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import * as VenueActions from "../../redux/actions/venue.actions";
import Label from "@sellout/ui/build/components/Label";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import SearchDropdown, {
  SearchDropdownTypes,
} from "@sellout/ui/build/components/SearchDropdown";
import ISearchDropdownItem from "@sellout/models/.dist/interfaces/ISearchDropdownItem";
import LIST_VENUES from "@sellout/models/.dist/graphql/queries/venues.query";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import { ModalTypes } from "../modal/Modal";
import { NEW_VENUE_ID } from "../../redux/reducers/venue.reducer";
import useEvent from "../../hooks/useEvent.hook";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import * as SeasonActions from "../../redux/actions/season.actions";

const Container = styled.div`
  position: relative;
`;

const PosterContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type PosterProps = {
  image: string;
};

const Poster = styled.div<PosterProps>`
  position: relative;
  height: 120px;
  width: 180px;
  background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.25) 0%,
      rgba(0, 0, 0, 0) 40.65%
    ),
    url(${(props) => props.image});
  background-position: center;
  background-size: cover;
  border-radius: 10px;
  padding: 10px;
`;

const PosterTitle = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.White};
  position: absolute;
  bottom: 10px;
  left: 10px;
`;

type SelectEventVenuesProps = { type: string };

const SelectEventVenue: React.FC<SelectEventVenuesProps> = ({ type }) => {
  /* Hooks */
  const { eventId, event } = useEvent();
  const { season, seasonId } = useSeason();
  /* State */
  const [venueName, setVenueName] = React.useState("");
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;

  /* Actions */
  const dispatch = useDispatch();
  const cacheVenues = (venues: IVenue[]) =>
    dispatch(VenueActions.cacheVenues(venues));

  const createVenue = () => {
    dispatch(VenueActions.setVenueId(NEW_VENUE_ID));
    dispatch(AppActions.pushModal(ModalTypes.CreateVenue));
  };

  const setVenueId = (venueId: string) => {
    if (type === VariantEnum.Event) {
      dispatch(EventActions.setEventVenueId(eventId, venueId));
    }
    if (type === VariantEnum.Season) {
      dispatch(SeasonActions.setSeasonVenueId(seasonId, venueId));
    }

    dispatch(VenueActions.setVenueId(venueId));
  };

  /** Graphql */
  const { data } = useQuery(LIST_VENUES, {
    variables: {
      query: {
        name: venueName,
      },
      pagination: {
        pageSize: 5,
        pageNumber: 1,
      },
    },
    context: {
      debounceKey: "QUERY_VENUES",
    },
    onCompleted: ({ venues }: { venues: IVenue[] }) => {
      cacheVenues(venues);
    },
  });

  /** Render */
  let items: ISearchDropdownItem[] = [];

  if (data?.venues) {
    items = data.venues.map(
      (venue: IVenue): ISearchDropdownItem => ({
        text: venue.name,
        value: venue._id,
      })
    );
  }

  const footer = (
    <TextButton
      onClick={() => createVenue()}
      icon={Icons.PlusCircleLight}
      size={TextButtonSizes.Small}
    >
      Add new venue
    </TextButton>
  );

  const showNotification = (message: string) =>
    dispatch(
      AppActions.showNotification(message, AppNotificationTypeEnum.Error)
    );

  const onVenueClear = () => {
    if (event?.hasOrders || season?.hasOrders) {
      showNotification(
        "This field cannot be changed once orders have been created. Please contact support with questions or comments."
      );
      return;
    } else {
      setVenueId("");
    }
  };

  const venueId =
    type === VariantEnum.Event
      ? (event?.venueId as string)
      : (season?.venueId as string);

  return (
    <Container>
      <Label text={venueId ? "Selected venue" : "Select a venue"} />
      {!venueId && (
        <SearchDropdown
          type={SearchDropdownTypes.SingleSelect}
          onChange={(venueId: string) => setVenueId(venueId)}
          searchQuery={venueName}
          setSearchQuery={setVenueName}
          placeholder="Search for venues"
          items={items}
          // footer={footer}
        />
      )}
      <PosterContainer>
        {(() => {
          const venue = venuesCache[venueId];
          if (!venue) return null;
          return (
            <Poster key={venueId} image={venue?.imageUrls?.[0] as string}>
                <Icon
                  icon={Icons.CancelCircle}
                  onClick={() => onVenueClear()}
                  color={Polished.rgba(Colors.White, 0.7)}
                  size={14}
                  position="absolute"
                  top="10px"
                  right="10px"
                />
              <PosterTitle>{venue.name}</PosterTitle>
            </Poster>
          );
        })()}
      </PosterContainer>
    </Container>
  );
};

export default SelectEventVenue;
