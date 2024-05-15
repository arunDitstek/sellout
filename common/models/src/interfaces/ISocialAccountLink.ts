export enum SocialAccountPlatform {
  SoundClound = 'SoundCloud',
  Facebook = 'Facebook',
  Spotify = 'Spotify',
  BandCamp = 'BandCamp',
  YouTube = 'YouTube',
  AppleMusic = 'Apple Music',
  Instagram = 'Instagram',
}

export interface ISocialAccountLink {
  platform: SocialAccountPlatform;
  link: string;
}