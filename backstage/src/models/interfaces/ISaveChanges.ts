export default interface ISaveChanges {
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  hasChanges: boolean;
  saveChanges: Function | null;
  discardChanges: Function | null;
  nextUrl?: string | null;
}
