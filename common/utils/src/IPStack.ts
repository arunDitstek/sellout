import * as request from 'request-promise-native';
import { 
  IP_STACK_API_KEY,
  LOAD_TEST_ENABLED,
} from "./env";

export async function gecodeIPAddress(ipAddress) {
  // Return mock data for load testing
  if(LOAD_TEST_ENABLED) {
    console.log('LOAD_TEST_ENABLED=true');
    return { 
      city: 'Polson',
      region_code: 'MT',
      zip: '59860',
      country_code: 'US',
      latitude: 47.6932,
      longitude: 114.1631
    };
  }

  const url = `http://api.ipstack.com/${ipAddress}?access_key=${IP_STACK_API_KEY}`;
  return await request.get(url, {
    json: true
  });
}
