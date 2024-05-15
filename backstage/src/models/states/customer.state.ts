import IUser from '@sellout/models/.dist/interfaces/IUser';
import addressState from './address.state';

export default function customerState(): any {
  return {
    userId: "",
    firstName: '',
    lastName: '',
    stripeCustomerId: '',
    email: '',
    phoneNumber: '',
  };
};