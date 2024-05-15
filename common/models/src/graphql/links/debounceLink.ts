import DebounceLink from 'apollo-link-debounce';

const debounceLink = new DebounceLink(500);
export default debounceLink;
