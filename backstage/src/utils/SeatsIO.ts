import client from "../graphql/client";
import GET_SEATING from "@sellout/models/.dist/graphql/queries/seating.query";
import { SeatsioClient, Region } from "seatsio";

type SeatsIOClient = any;

// HANDLE ERROR
export default async function SeatIO(): Promise<SeatsIOClient> {
  let seatsIOClient = null;

  try {
    if (!seatsIOClient) {
      const { data } = await client.query({
        query: GET_SEATING,
      });
      const { organization } = data as any;
      const secretKey: string = organization?.seating?.secretKey;
      if (secretKey && !seatsIOClient) {
        seatsIOClient = new SeatsioClient(Region.EU(), secretKey);
      }
    }
  } catch (e) {
    console.error(e);
    const errorMsg =
      "There was an error loading the seating configuration. Please try again or contact support";
    return Promise.reject(errorMsg);
  }

  return Promise.resolve(seatsIOClient);
}
