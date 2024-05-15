import { AsyncParser } from 'json2csv';

export function fromJson(fields: any[], data: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data);
    const opts = { fields };
    const transformOpts = {};
    const asyncParser = new AsyncParser(opts, transformOpts);

    let csv = '';
    asyncParser.processor
      .on('data', chunk => {
        // console.log(chunk.toString());
        csv += chunk.toString();
      })
      .on('end', () => resolve(csv))
      .on('error', err => reject(err));
      
    asyncParser.input.push(json);
    asyncParser.input.push(null); 
  });
}
