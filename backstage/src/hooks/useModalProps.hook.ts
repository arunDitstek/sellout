import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { ModalPropType } from '../models/interfaces/IModalProps';
import { ModalTypes } from "../components/modal/Modal";

type UseModalPropsHook<T, K extends keyof T> = (modalType: K) => T[K];

const useModalPropsHook: UseModalPropsHook<ModalPropType, ModalTypes> = (modalType: ModalTypes) => {
  const app = useSelector((state: BackstageState) => state.app);
  const { modal: { modalProps } } = app;
  const modalTypeProps = modalProps[modalType];
  const modalTypePropsLength = modalTypeProps?.length ?? 0;
  return (modalTypeProps?.[modalTypePropsLength - 1] ?? {});
};

export default useModalPropsHook;
