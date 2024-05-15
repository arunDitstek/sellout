import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import GET_PROMO_CODE from "@sellout/models/.dist/graphql/queries/promoCodeVerify.query";

type usePromoCode = {
  ticket: any;
};

type UsePromoCodeHook = (
  eventId?: string,
  seasonId?: string,
  promoCode?: string
) => usePromoCode;

const usePromoCodeHook: UsePromoCodeHook = (eventId, promoCode, seasonId) => {
  /* State */

  /* Hooks */

  const { data, loading, error } = useQuery(GET_PROMO_CODE, {
    variables: {
      seasonId,
      eventId,
      promoCode,
    },
    onCompleted: (data:any) => {},
  });
  return {
    ticket: data?.eventTickets,
  };
};

export default usePromoCodeHook;
