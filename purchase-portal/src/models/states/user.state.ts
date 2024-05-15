import ICreateUserParams from '../interfaces/ICreateUserParams';
import IStripeCardDetails from "../interfaces/IStripeCardDetails";
export function createUserState(): ICreateUserParams {
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  };
};

export function createStripeCard(): IStripeCardDetails {
  return {
    paymentMethodId: '',
    brand: '',
    last4: '',
    expMonth: 0,
    expYear: 0,
    funding: '',
    country: '',
    __typename: '',
    type:''
  };
};

