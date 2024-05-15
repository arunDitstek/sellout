export default interface ISeating {
  _id?: string;
  orgId: string;
  publicKey: string;
  secretKey: string;
  designerKey: string;
  createdAt: number;
  updatedAt?: number;
}
