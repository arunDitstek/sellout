import React from 'react';
export default interface IConfirmActionState {
  title?: string;
  message: string | React.ReactNode;
  confirm: Function | null;
  confirmText?: string;
  cancel: Function | null;
  cancelText?: string;
  loading?: Boolean | false;
};
