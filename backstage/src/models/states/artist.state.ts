import IArtist, { ArtistTypeEnum } from '@sellout/models/.dist/interfaces/IArtist';
import IArtistContact from '@sellout/models/.dist/interfaces/IArtistContact';
import IArtistPressKit from '@sellout/models/.dist/interfaces/IArtistPressKit';
import shortid from 'shortid';

export default function artistState(): IArtist {
  return {
    _id: "",
    type: ArtistTypeEnum.Individual,
    name: "",
    genres: [],
    socialAccounts: [],
    pressKits: [artistPressKitState()],
    contacts: [],
    orgId: ""
  };
};

export function artistPressKitState(_id: string = shortid.generate()): IArtistPressKit {
  return {
    _id,
    title: '',
    description: '',
    posterImageUrls: [],
    links: [],
  };
}

export function artistContactState(): IArtistContact {
  return {
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    email: '',
    phoneNumber: '',
  };
};
