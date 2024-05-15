import { ModalTypes } from '../../components/modal/Modal';
import IModalProps from './IModalProps';

export default interface IModal {
  modals: ModalTypes[];
  modalProps: IModalProps;
  onClose: Function[];
};
