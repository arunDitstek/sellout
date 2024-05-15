import * as Wait from './wait';

const SELLOUT_FACEBOOK_PIXEL_ID = '205397967210775';

async function waitForPixel() {
  return await Wait.forTrue(() => Boolean((window as any).fbq));
}

/****************************************************************************************
  Initialization
****************************************************************************************/

export function initialize(facebookPixelId?: string | null): void {
  try {
    injectPixel(SELLOUT_FACEBOOK_PIXEL_ID);
    if (facebookPixelId) {
      injectPixel(facebookPixelId);
    } else {
      console.log('Facebook Pixel not configured');
    }
  } catch (e) {
    console.error('Failed to inject Facebook Pixel');
    console.error(e);
  }
}

function injectPixel(facebookPixelId: string): void {
  const headCode = `
    < !--Facebook Pixel Code-- >
    <script>
      !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
        n.callMethod.apply(n, arguments) : n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${facebookPixelId}');
    fbq('track', 'PageView');
  </script>
    <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!--End Facebook Pixel Code-- >
  `;

  const headScript = document.createRange().createContextualFragment(headCode);
  document.head.prepend(headScript);
}

/****************************************************************************************
  Tracking
****************************************************************************************/

export async function track(type: string, action: string, params: object): Promise<void> {
  try {
    await waitForPixel();
    (window as any).fbq(type, action, params);
  } catch (e) {
    console.error('Facebook Pixel failed to track event');
  }
}
