export default interface IStripeTerminalReader {
  id: string;
  label: string;
  type: string;
  location: string;
  serialNumber: string;
  status: string;
  ipAddress: string;
}
