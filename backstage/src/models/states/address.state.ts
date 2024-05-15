import IAddress from '@sellout/models/.dist/interfaces/IAddress';

export default function addressState(): IAddress {
  return {
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    lat: null,
    lng: null,
    placeId: '',
    // timezone: '',
    placeName: ''
  };
}