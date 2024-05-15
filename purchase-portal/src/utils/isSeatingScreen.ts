import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { ScreenEnum } from "../redux/reducers/app.reducer";

export default function isSeatingScreen(
  screen: ScreenEnum,
  event?: IEventGraphQL
): boolean {
  return (
    screen === ScreenEnum.Tickets && Boolean(event?.seatingChartKey ?? false)
  );
}
