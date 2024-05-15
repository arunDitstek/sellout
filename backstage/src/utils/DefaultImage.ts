
import { ArtistTypeEnum,} from "@sellout/models/.dist/interfaces/IArtist";
import { EventTypeEnum } from '@sellout/models/.dist/interfaces/IEvent';
import { DefaultArtistImageUrls } from '@sellout/models/.dist/enums/DefaultArtistImageUrls';
import { DefaultEventImageUrls } from '@sellout/models/.dist/enums/DefaultEventImageUrls';
import { DefaultVenueImageUrls } from '@sellout/models/.dist/enums/DefaultVenueImageUrls'

export const getArtistImage = (artistType: ArtistTypeEnum) => {
  switch(artistType) {
    case ArtistTypeEnum.Individual:
      return DefaultArtistImageUrls.Individual;
    case ArtistTypeEnum.Film:
      return DefaultArtistImageUrls.Film;
    case ArtistTypeEnum.MusicalArtist:
      return DefaultArtistImageUrls.MusicalArtist;
  }
};

export const getEventImage = (eventType: EventTypeEnum) => {
  switch(eventType) {
    case EventTypeEnum.GeneralEvent:
      return DefaultEventImageUrls.GeneralEvent;
    case EventTypeEnum.Concert:
      return DefaultEventImageUrls.Concert;
  }
};

export const getVenueImage = () => {
  return DefaultVenueImageUrls.Venue
;};