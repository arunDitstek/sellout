export default function makeEventHandler(executeOnEvent: Function = () => {}) {
  return function (eventHandler: Function) {
    return function(event: React.FormEvent<HTMLInputElement>) {
      executeOnEvent();
      eventHandler(event.currentTarget.value as string);
    };
  }
}