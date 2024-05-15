import IVenue from '@sellout/models/.dist/interfaces/IVenue';
import addressState from './address.state';
import * as DefaultImage from '../../utils/DefaultImage';
import { NEW_VENUE_ID } from '../../redux/reducers/venue.reducer';

export default function venueState(_id = NEW_VENUE_ID): IVenue {
  return {
    _id:"new",
    orgId: "",
    name: "",
    description: "",
    capacity: 100,
    url: "",
    tax: "",
    imageUrls: [DefaultImage.getVenueImage()],
    venueGlobalId: "",
    //address: addressState(),
    address:{}
  };
};
