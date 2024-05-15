export interface IPerformanceSchedule {
  doorsAt: number;
  startsAt: number;
  endsAt:number;
}

export default interface IPerformance {
  _id: string;
  name?: string;
  headliningArtistIds?: string[];
  openingArtistIds?: string[];
  venueId?: string;
  venueStageId?: string;
  price?: number;
  posterImageUrl?: string;
  videoLink?: string;
  songLink?: string;
  schedule?: [IPerformanceSchedule];
}
