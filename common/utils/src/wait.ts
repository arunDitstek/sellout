export default function wait(timeoutMs: number, value: any = null): Promise<any> {
  return new Promise<any>((resolve) => {
    setTimeout(() => resolve(value), timeoutMs);
  });
}

export async function forTrue(fn: () => boolean) {
  const count = 0;
  return new Promise<any>((resolve, reject) => {
    if(fn()) {
      resolve(true);
      return;
    }

    const interval = setInterval(async () => {
      if (fn()) {
        clearInterval(interval);
        resolve(true);
        return;
      }
      if (count >= 100) reject();
    }, 50);
  });
}
