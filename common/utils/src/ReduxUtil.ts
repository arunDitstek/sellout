export function makeCache(items: any[], key: string, start: any) {
  return items?.reduce(
    (cur, item) => {
      cur[item[key]] = item;
      return cur;
    },
    { ...start }
  );
}
