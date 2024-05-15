import { ISocialAccountLink } from "./ISocialAccountLink";

export default interface IArtistPressKit {
  _id: string;
  title: string;
  description: string;
  posterImageUrls: string[];
  links: ISocialAccountLink[];
}
