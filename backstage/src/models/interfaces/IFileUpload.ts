export default interface IFileUpload {
  blob: string;
  mimetype: string;
  url: string;
  keys: string[];
  aspect?: number;
}
