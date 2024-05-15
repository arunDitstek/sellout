import * as Time from './time';
import * as request from 'request-promise-native';
import {
  GOOGLE_TIMEZONE_API_KEY
} from './env';

export async function info(lat, lng): Promise<any> {
  const baseUrl = 'https://maps.googleapis.com/maps/api/timezone/json';
  const url = `${baseUrl}?location=${lat},${lng}&timestamp=${Time.now()}&key=${GOOGLE_TIMEZONE_API_KEY}`;
  const response = await request.get(url, {
    json: true
  });
  return response;
}
  