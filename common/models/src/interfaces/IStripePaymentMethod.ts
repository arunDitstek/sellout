export default interface IStripePaymentMethod {
  paymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  funding: string;
  country: string;
  type : string;
}
