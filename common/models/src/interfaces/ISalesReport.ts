export enum Frequency {
  Weekly = "Weekly",
  Daily = "Daily"
}


export default interface ISalesReport {
    _id?: string;
    email: string;
    frequency: Frequency;
}

export default interface IWaitList {
  name: string;
  email: string;
  phoneNumber: string
  createdAt: number
}