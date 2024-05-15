import IModal from '../interfaces/IModal';
import { ModalTypes } from '../../components/modal/Modal';
import IModalProps from '../interfaces/IModalProps';

const modal = (modals: ModalTypes[] = [], modalProps: IModalProps = {} as IModalProps): IModal => {
  return {
    modals,
    modalProps,
    onClose: [],
  };
}

export default modal;
