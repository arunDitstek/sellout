import { EPurchasePortalStatus } from "@sellout/models/.dist/enums/EPurchasePortalStatus";

export function close() {
  window.parent.postMessage({
    action: 'CLOSE_WINDOW',
    args: null,
  }, '*');
}

export function setStatus(status: EPurchasePortalStatus) {
  window.parent.postMessage({
    action: 'SET_STATUS',
    args: { status },
  }, '*');
}
