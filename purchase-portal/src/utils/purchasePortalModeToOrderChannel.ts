import { EPurchasePortalModes } from '@sellout/models/.dist/enums/EPurchasePortalModes';
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";

export default function purchasePortalModeToOrderChannel(mode: EPurchasePortalModes): OrderChannelEnum {
  switch(mode) {
    case EPurchasePortalModes.Checkout:
      return OrderChannelEnum.Online;

    case EPurchasePortalModes.BoxOffice:
      return OrderChannelEnum.BoxOffice;
  }
}