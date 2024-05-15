import { SeasonQueryEnum } from "../enums/SeasonQueryEnum";
import ISeasonQuery from "@sellout/models/.dist/interfaces/ISeasonQuery";

export type SeasonQueryHash = {
  [key in SeasonQueryEnum]: ISeasonQuery;
};
