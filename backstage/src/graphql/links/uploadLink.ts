import { createUploadLink } from 'apollo-upload-client';
import { API_URL } from '../../env';

const uploadLink = createUploadLink({
  uri: `${API_URL}/graphql`,
  credentials: "",
});

export default uploadLink;
