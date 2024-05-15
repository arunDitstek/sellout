export interface IQuery {
  any: string;
  userId: string;
  eventId: string;
  artistId: string;
  venueId: string;
  startDate: number;
  endDate: number;
}

export interface IPbQuery {
  key: string;
  value: any;
}

export function toPb(query: object): IPbQuery[] {
  let pbQuery: IPbQuery[] = Object.keys(query).reduce((cur, key) => {
    if (!query[key]) return cur;
    cur.push({ key: key, value: query[key] } as IPbQuery);
    return cur;
  }, [] as IPbQuery[]);
  return pbQuery;
}

export function fromPb(query: IPbQuery[]): IQuery {
  return query.reduce((c, n) => {
    c[n.key] = n.value;
    return c;
  }, {} as IQuery);
}
