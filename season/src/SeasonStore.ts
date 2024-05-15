import ISeason from '@sellout/models/.dist/interfaces/ISeason';
// import * as pb from '@sellout/models/.dist/sellout-proto';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Tracer from '@sellout/service/.dist/Tracer';
// import joiToErrors  from '@sellout/service/.dist/joiToErrors';
// import Joi from '@hapi/joi';
import ISeasonQuery, { SeasonQueryOrderByEnum, SeasonQuerySortByEnum } from '@sellout/models/.dist/interfaces/ISeasonQuery';
import * as Random from '@sellout/utils/.dist/random';
import IOrderTicket from '@sellout/models/.dist/interfaces/IOrderTicket';
import IOrderUpgrade from '@sellout/models/.dist/interfaces/IOrderUpgrade';
import * as Time from '@sellout/utils/.dist/time';

const tracer = new Tracer('SeasonStore');
export default class SeasonStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Season;

  constructor(Season) {
    this.Season = Season;
  }

  public async createSeason(spanContext: string, season: ISeason): Promise<ISeason> {
    const span = tracer.startSpan('createSeason', spanContext);
    const newSeason = new this.Season(season);
    let saveSeason: ISeason;
    try {
      saveSeason = await newSeason.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new SeasonStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveSeason;
  }


  public async processSale(
    spanContext: string,
    orgId: string,
    seasonId: string,
    tickets: IOrderTicket[],
    upgrades: IOrderUpgrade[],
    promotionCode?: string,
    ): Promise<ISeason> {
    const span = tracer.startSpan('processSale', spanContext);
    let remainingQty = {} as any;
    const arrayFilters = [];

    /* Mongo Array Filters are pretty crazy
    *  We use them to enable atomic writes
    *  which allows us to accurately keep
    *  track of available ticket quantity
    *  during times of high traffic
    *  https://stackoverflow.com/questions/18173482/mongodb-update-deeply-nested-subdocument
    *
    * IMPORTANT!
    * Thoroughly test any changes to the code below.
    */

    // Tickets
    const purchasedTickets = tickets.reduce((cur, next) => {
      if (cur.hasOwnProperty(next.ticketTypeId)) {
        cur[next.ticketTypeId].qty++;
      } else {
        cur[next.ticketTypeId] = {
          ticketTypeId: next.ticketTypeId,
          ticketTierId: next.ticketTierId,
          qty: 1,
        };
      }
      return cur;
    }, {});

    Object.values(purchasedTickets).forEach((ticket: any) => {
      const firstIndex = `index${Random.generateOfLength(14)}`;
      const secondIndex = `index${Random.generateOfLength(14)}`;

      remainingQty = {
        ...remainingQty,
        [`ticketTypes.$[${firstIndex}].remainingQty`]: (-1 * ticket.qty),
        [`ticketTypes.$[${firstIndex}].tiers.$[${secondIndex}].remainingQty`]: (-1 * ticket.qty),
      };

      arrayFilters.push({
        [`${firstIndex}._id`]: ticket.ticketTypeId,
      });

      arrayFilters.push({
        [`${secondIndex}._id`]: ticket.ticketTierId,
      });
    });

    // Upgrades
    const purchasedUpgrades = upgrades.reduce((cur, next) => {
      if (cur.hasOwnProperty(next.upgradeId)) {
        cur[next.upgradeId].qty++;
      } else {
        cur[next.upgradeId] = {
          upgradeId: next.upgradeId,
          qty: 1,
        };
      }
      return cur;
    }, {});

    Object.values(purchasedUpgrades).forEach((upgrade: any) => {
      const firstIndex = `index${Random.generateOfLength(14)}`;

      remainingQty = {
        ...remainingQty,
        [`upgrades.$[${firstIndex}].remainingQty`]: (-1 * upgrade.qty),
      };

      arrayFilters.push({
        [`${firstIndex}._id`]: upgrade.upgradeId,
      });
    });

    /* 
     * Promotion Code 
     */
    if(promotionCode) {
      remainingQty = {
        ...remainingQty,
        "promotions.$[promotionFilter].remainingQty": (-1 ), //* tickets.length
      };

      arrayFilters.push({
        'promotionFilter.code': promotionCode,
      });
    }
    // filter and update, son
    try {
      await this.Season.findOneAndUpdate(
        {
          orgId,
          _id: seasonId,
        },
        {
          $inc: {
            // Remaining Tickets & Upgrades
            ...remainingQty,
          },
        },
        {
          arrayFilters,
        },
      );

    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new SeasonStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
  }

  public async updateOneSeason(spanContext: string, orgId: string, season: ISeason): Promise<ISeason> {
    const span = tracer.startSpan('updateOneSeason', spanContext);
    season = JSON.parse(JSON.stringify(season));
    try {
      season = await this.Season.findOneAndUpdate({ orgId, _id: season._id }, { $set: season }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new SeasonStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return season;
  }

  public async querySeasonList(spanContext: string, orgId): Promise<any> {
    const span = tracer.startSpan('querySeasons', spanContext);
    let seasons: any;
    let finalQuery: any = {};

    // finalQuery['schedule.startsAt'] = {
    //   $lte: Time.now(),
    // };
    if(orgId){
      finalQuery['orgId'] = orgId;
    }
    finalQuery['schedule.endsAt'] = {
      $gte: Time.now(),
    };
    finalQuery['schedule.announceAt'] = {
      $lte: Time.now(),
    };
    finalQuery['published'] = true;
    


    // finalQuery.sortBy = EventQuerySortByEnum.CreatedAt;
    // finalQuery.orderBy = EventQueryOrderByEnum.Ascending;
    finalQuery.cancel = { $ne: true };
    finalQuery.active = true;
    try {
      seasons  = await this.Season.find(finalQuery).sort({ 'schedule.startsAt': 1 }).lean()
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new SeasonStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();

    return seasons ;
  }
  
  public async findSeasonById(spanContext: string, seasonId: string): Promise<ISeason> {
    const span = tracer.startSpan('findSeasonById', spanContext);
    let season: ISeason;
    try {
      season = await this.Season.findById(seasonId)
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new SeasonStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return season;
  }

  public async querySeasons(spanContext: string, query: ISeasonQuery, pagination: IPagination): Promise<ISeason[]> {
    const span = tracer.startSpan('querySeasons', spanContext);
    let seasons: ISeason[];
    let finalQuery: any = {};

    if (query.name) {
      finalQuery.name = { $regex: query.name, $options: 'i' };
    }

    if (query.seasonIds && query.seasonIds.filter(v => Boolean(v)).length) {
      finalQuery._id = { $in: query.seasonIds.filter(id => Boolean(id)) };
    }

    if (query.venueIds && query.venueIds.filter(v => Boolean(v)).length) {
      finalQuery.venueId = { $in: query.venueIds.filter(v => Boolean(v)) };
    }

    // if (query.userIds && query.userIds.filter(v => Boolean(v)).length) {
    //   finalQuery.userId = { $in: query.userIds.filter(v => Boolean(v)) };
    // }

    if (query.artistIds)  {
      finalQuery['performances'] = { $elemMatch: { $or: [
        { headliningArtistIds: { $in: query.artistIds } },
        { openingArtistIds: { $in: query.artistIds } },
      ] } };
    }

    if (query.startDate) {
      finalQuery['schedule.startsAt'] = {
        $gte: query.startDate,
      };
    }

    if (query.endDate) {
      finalQuery['schedule.startsAt'] = {
        $lte: query.endDate,
      };
    }

    if (query.startDate && query.endDate) {
      finalQuery['schedule.startsAt'] = {
        $gte: query.startDate,
        $lte: query.endDate,
      };
    }

    if(typeof query.published === 'boolean') {
      finalQuery['published'] = query.published;
    }


    if (!query.sortBy) query.sortBy = SeasonQuerySortByEnum.CreatedAt;
    if (!query.orderBy) query.orderBy = SeasonQueryOrderByEnum.Ascending;

    // $or queries in mongo must not be empty arrays
    // so we check to make sure it will be populated
    // before we do the conversation.
    // If it is not, this is a 'list all seasons' request
    // and we can just do a normal query, even
    // if 'query.any' is true

    if (query.any && Object.keys(finalQuery).length) {
      const or = [];
      for (const [key, value] of Object.entries(finalQuery)) {
        or.push({ [key]: value });
      }

    if(typeof query.cancel === 'boolean') {
      var cancel: any = query.cancel;
    } else {
      cancel = {$ne: true};
    }
    if (query.name) {
      finalQuery = { $or: or, $and: [{ orgId: query.orgId, active: true }] }; 
    } else {
      finalQuery = { $or: or, $and: [{ orgId: query.orgId, active: true, cancel: cancel }] };
    }
    // filtering based on season ids with $and
    if (query?.seasonIds?.length) {
      finalQuery['$and'].push({ _id: { $in: query?.seasonIds } })
    }
    } else {
      finalQuery.orgId = query.orgId;
      finalQuery.active = true;
    }
    try {
      if (pagination) {
        const { pageSize, pageNumber = 1 } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        seasons = await this.Season.find(finalQuery)
          .skip(skips)
          .limit(pageSize)
          .sort({[query.sortBy]: query.orderBy});
      } else {
        seasons = await this.Season.find(finalQuery);
      }
      
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new SeasonStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return seasons;
  }
  
}
