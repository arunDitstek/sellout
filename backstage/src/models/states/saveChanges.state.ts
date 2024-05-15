import ISaveChanges from '../interfaces/ISaveChanges';

const saveChangesState = (): ISaveChanges => {
  return {
    hasChanges: false,
    saveChanges: null,
    discardChanges: null,
    nextUrl: null,
    message:'',
    title:'',
    confirmText:'',
    cancelText:''
  };
}

export default saveChangesState;
