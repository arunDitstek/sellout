import IStripePaymentMethod from './IStripePaymentMethod';

export default interface IStripeCustomer {
  stripeCustomerId: string;
  email: string;
  paymentMethods: IStripePaymentMethod[];
}