import { ISocialAccountLink } from './ISocialAccountLink';
import IArtistPressKit from './IArtistPressKit';
import IArtistContact from './IArtistContact';

export enum ArtistTypeEnum {
  Individual = 'Individual',
  MusicalArtist = 'Musical Artist',
  Film = 'Film',
}

export default interface IArtist {
  _id?: string;
  orgId: string;
  type: ArtistTypeEnum;
  name: string;
  genres: string[];
  socialAccounts: ISocialAccountLink[];
  pressKits: IArtistPressKit[];
  contacts: IArtistContact[];
  createdAt?: number;
}
