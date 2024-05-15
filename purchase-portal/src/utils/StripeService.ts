import { Stripe, StripeElements } from "@stripe/stripe-js";
import { Terminal } from '@stripe/terminal-js';

/********************************************************************************
 *  Stripe JS & Stripe Elements
 *******************************************************************************/

let globalStripe: Stripe | null = null;
let globalElements: StripeElements | null = null;

type StripeInjection = {
  stripe: Stripe;
  elements: StripeElements;
}

export function setStripe(stripe: Stripe, elements: StripeElements) {
  globalStripe = stripe;
  globalElements = elements;
}

export function stripe(): StripeInjection | null {
  if(!globalStripe || !globalElements) return null;

  return {
    stripe: globalStripe,
    elements: globalElements,
  };
}

/********************************************************************************
 *  Stripe Terminal
 *******************************************************************************/

let globalStripeTerminal: Terminal | null = null;

type StripeTerminalInjection = {
  terminal: Terminal;
};

export function setStripeTerminal(stripeTerminal: Terminal | null) {
  globalStripeTerminal = stripeTerminal;
}

export function stripeTerminal(): StripeTerminalInjection | null {
  if(!globalStripeTerminal) return null;

  return {
    terminal: globalStripeTerminal,
  }
}
