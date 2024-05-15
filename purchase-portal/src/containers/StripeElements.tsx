import React, { Fragment } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import * as StripeService from "../utils/StripeService";
import { loadStripe } from "@stripe/stripe-js";
import { STRIPE_PUBLIC_KEY } from "../env";
import { Elements } from "@stripe/react-stripe-js";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import Loader from "@sellout/ui/build/components/Loader";
import EventInfo from "../components/EventInfo";
import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import SeasonInfo from "../components/SeasonInfo";

const fonts = [
  {
    cssSrc: "https://use.typekit.net/suf4knx.css",
    family: "neue-haas-grotesk-display",
  },
];

type StripeServiceInjectorProps = {
  children: any;
};

const StripeServiceInjector: React.FC<StripeServiceInjectorProps> = ({
  children,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const { mode } = useSelector((state: PurchasePortalState) => state.app);

  React.useEffect(() => {
    if (stripe && elements) {
      StripeService.setStripe(stripe, elements);
    }
  }, [stripe, elements]);

  return children;
};

type StripeElementsProps = {
  children: any;
  useConnectedAccount: boolean;
};

const StripeElements: React.FC<StripeElementsProps> = ({
  children,
  useConnectedAccount = false,
}) => {
  /** Hooks **/
  const { event } = useEvent();
  const { season } = useSeason();

  /** State **/
  const [stripe, setStripe] = React.useState<any>(null);

  React.useEffect(() => {
    const doEffect = async () => {
      const what = await loadStripe(
        STRIPE_PUBLIC_KEY,
        useConnectedAccount
          ? {
              stripeAccount: event
                ? (event as any)?.organization?.stripeId
                : season?.organization?.stripeId,
            }
          : undefined
      );
      setStripe(what);
    };
    doEffect();
  }, []);

  if (!stripe || true) {
    <Fragment>
      {event ? (
        <EventInfo event={event as any} />
      ) : (
        <SeasonInfo season={season as any} />
      )}
      <Loader />
    </Fragment>;
  }

  return (
    <Elements stripe={stripe} options={{ fonts }}>
      <StripeServiceInjector>{children}</StripeServiceInjector>
    </Elements>
  );
};

export default StripeElements;
