import { ILogManager, ILogManagerOpts } from "./interfaces";

class ConsoleLogManager implements ILogManager {
  public opts: ILogManagerOpts;

  constructor(opts: ILogManagerOpts) {
    this.opts = opts;
  }

  public info(msg: string, ...params: string[]): void {
    console.info(msg, ...params);
  }

  public warn(msg: string, ...params: string[]): void {
    console.warn(msg, ...params);
  }

  public error(msg: string, ...params: string[]): void {
    console.error(msg, ...params);
  }
}

export default ConsoleLogManager;
