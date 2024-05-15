import IFileUpload from '../interfaces/IFileUpload';

const fileUpload = (): IFileUpload => {
  return {
    blob: "",
    mimetype: "",
    url: "",
    keys: [],
    aspect: 0,
  };
}

export default fileUpload;
