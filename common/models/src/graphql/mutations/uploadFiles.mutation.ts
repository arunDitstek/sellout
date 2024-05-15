import gql from "graphql-tag";

const mutation = gql`
  mutation uploadFiles($files: [Upload!]!) {
    uploadFiles(files: $files) {
      filename
      mimetype
      encoding
      url
    }
  }
`;

export default mutation;
