import React from "react";
import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import Error from './Error';

type GlobalErrorProps = {
  margin?: boolean;
};

const GlobalError: React.FC<GlobalErrorProps> = ({ margin }) => {
  const { app } = useSelector((state: PurchasePortalState) => state);
  const { errors } = app;
  const globalError = errors[ErrorKeyEnum.Global];

  if(!globalError) return null;

  return (
    <Error margin={margin ? '8px 0 0 24px' : '8px 0 0'}>{globalError}</Error>
  );
};

export default GlobalError;
