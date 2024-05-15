import React from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { useQuery } from "@apollo/react-hooks";
import { useSelector, useDispatch } from "react-redux";
import { Colors, Icon, Icons } from "@sellout/ui";
import { BackstageState } from "../../redux/store";
import * as ArtistActions from "../../redux/actions/artist.actions";
import TextButton, { TextButtonSizes } from "@sellout/ui/build/components/TextButton";
import * as EventActions from "../../redux/actions/event.actions";
import SearchDropdown, {
  SearchDropdownTypes
} from "@sellout/ui/build/components/SearchDropdown";
import LIST_ARTISTS from "@sellout/models/.dist/graphql/queries/artists.query";
import IArtist from "@sellout/models/.dist/interfaces/IArtist";
import ISearchDropdownItem from "@sellout/models/.dist/interfaces/ISearchDropdownItem";

import * as AppActions from '../../redux/actions/app.actions';
import { ModalTypes } from '../modal/Modal';
import { NEW_ARTIST_ID } from "../../redux/reducers/artist.reducer";

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
  margin-top: 10px;
  margin-right: 10px;
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

type SelectEventArtistsProps = {
  artistIds: string[];
  addArtist: (artistId: string) => void;
  removeArtist: (artistId: string) => void;
  isHeadlining: boolean;
  label: string;
  subLabel?: string;
  eventId: string;
};

const SelectEventArtists: React.FC<SelectEventArtistsProps> = ({
  artistIds,
  addArtist,
  removeArtist,
  isHeadlining,
  label,
  subLabel,
  eventId,
}) => {
  /* State */
  const [artistName, setArtistName] = React.useState("");
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistsCache } = artistState;
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventsCache } = eventState;
  const event = eventsCache[eventId];
  const modalType = isHeadlining ? ModalTypes.CreateHeadliningArtist : ModalTypes.CreateOpeningArtist;

  /* Actions */
  const dispatch = useDispatch();
  const cacheArtists = (artists: IArtist[]) =>
    dispatch(ArtistActions.cacheArtists(artists));

  const createArtist = () => {
    dispatch(ArtistActions.setArtistId(NEW_ARTIST_ID));
    dispatch(AppActions.pushModal(modalType));
  };

  const setPosterImage = (artistId: string) => {
    const artist = artistsCache[artistId];
    const [pressKit] = artist?.pressKits;
    dispatch(EventActions.setEventPosterImageUrl(eventId, pressKit.posterImageUrls[0]));
  };

  /** Graphql */
  const { data } = useQuery(LIST_ARTISTS, {
    variables: {
      query: {
        name: artistName,
      },
      pagination: {
        pageSize: 5,
        pageNumber: 1,
      }
    },
    context: {
      debounceKey: "QUERY_ARTISTS",
    },
    onCompleted: ({ artists }: { artists: IArtist[] }) => {
      cacheArtists(artists);
    },
  });

  /** Render */
  let items: ISearchDropdownItem[] = [];

  if (data?.artists) {
    items = data.artists
      .filter((artist: IArtist) => !artistIds.includes(artist._id as string))
      .map(
        (artist: IArtist): ISearchDropdownItem => ({
          text: artist.name,
          value: artist._id,
        })
      );
  }

  const footer = (
    <TextButton
      onClick={() => createArtist()}
      icon={Icons.PlusCircleLight}
      size={TextButtonSizes.Small}
    >
      Add new artist
    </TextButton>
  );

  return (
    <Container>
      <SearchDropdown
        type={SearchDropdownTypes.MultiSelect}
        onChange={(artistId: string) => {
          addArtist(artistId);
          // Only update the event poster image automatically if the added artist
          // is the first selected headlining artist.
          if (isHeadlining && event.performances?.[0]?.headliningArtistIds?.length === 0) {
            setPosterImage(artistId);
          }
        }}
        searchQuery={artistName}
        setSearchQuery={setArtistName}
        placeholder="Search for artists"
        items={items}
        footer={footer}
        label={label}
        subLabel={subLabel}
      />
      <PosterContainer>
        {artistIds.map((id) => {
          const artist = artistsCache[id];
          if (!artist) return null;
          const [pressKit] = artist?.pressKits;

          return (
            <Poster key={id} image={pressKit.posterImageUrls[0]}>
              <Icon
                icon={Icons.CancelCircle}
                onClick={() => removeArtist(id)}
                color={Polished.rgba(Colors.White, 0.7)}
                size={14}
                position="absolute"
                top="10px"
                right="10px"
              />
              <PosterTitle>{artist.name}</PosterTitle>
            </Poster>
          );
        })}
      </PosterContainer>
    </Container>
  );
};

export default SelectEventArtists;
