import { EPurchasePortalStatus } from "@sellout/models/.dist/enums/EPurchasePortalStatus";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import * as Wait from "@sellout/utils/.dist/wait";
import { getToken } from "./Auth";
import { EMBED_URL } from "../env";

const EMBED_URL_WITH_PATH = `${EMBED_URL}/embed.js`;

export async function initialize() {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = EMBED_URL_WITH_PATH;
  script.async = true;
  document.head.prepend(script);
  await waitForStatus(EPurchasePortalStatus.Ready);
  setToken(getToken());
}

async function waitForStatus(status: string) {
  return Wait.forTrue(
    () => (window as any).Sellout && (window as any).Sellout.status === status
  );
}

export async function open(
  eventId: string,
  seasonId: string,
  mode: EPurchasePortalModes = EPurchasePortalModes.BoxOffice,
  isComplimentary: boolean = false,
  memberId?: string
) {
  // await waitForStatus(EPurchasePortalStatus.Ready);
  // if (!eventId && !seasonId) return false;
  (window as any).Sellout.open(eventId, seasonId, mode, isComplimentary,memberId);
}

export async function preload(
  eventId: string,
  seasonId: string,
  mode: EPurchasePortalModes = EPurchasePortalModes.BoxOffice,
  isComplimentary: boolean = false,
  memberId?: string
) {
  await waitForStatus(EPurchasePortalStatus.Ready);
  if (!eventId) return;
  (window as any).Sellout.preload(eventId, seasonId, mode, isComplimentary,memberId);
}

export async function setToken(token: string | null) {
  await waitForStatus(EPurchasePortalStatus.Ready);
  if (!token) return;
  (window as any).Sellout.dispatch({
    type: "SET_TOKEN",
    payload: {
      token,
    },
  });
}
