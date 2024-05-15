import * as Wait from './wait';

const SELLOUT_GOOGLE_ANALYTICS_ID = 'UA-112750612-5';
const SELLOUT_GOOGLE_TAG_ID = 'GTM-WX7FFS6';

async function waitForGTag() {
  return await Wait.forTrue(() => Boolean((window as any).gtag));
}

/****************************************************************************************
  Initialization
****************************************************************************************/

export function initialize(googleAnalyticsId?: string | null): void {
  try {
    injectGoogleAnalytics(SELLOUT_GOOGLE_ANALYTICS_ID);
    injectGoogleTagManager(SELLOUT_GOOGLE_TAG_ID);
    if (googleAnalyticsId) {
      injectGoogleAnalytics(googleAnalyticsId);
    } else {
      console.log('Google Analytics not configured');
    }
  } catch (e) {
    console.error('Failed to inject Google Analaytics');
    console.error(e);
  }
}

function injectGoogleAnalytics(googleAnalyticsId: string): void {
  const headCode = `
    < !--Global site tag(gtag.js) - Google Analytics-- >
    <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleAnalyticsId}');
    </script>
  `;

  const headScript = document.createRange().createContextualFragment(headCode);
  document.head.prepend(headScript);
}

function injectGoogleTagManager(googleTagManagerAccountId: string): void {
  const headCode = `
      <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${googleTagManagerAccountId}');</script>
      <!-- End Google Tag Manager -->
    `;

  const headScript = document.createRange().createContextualFragment(headCode);
  document.head.prepend(headScript);

  const bodyCode = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${googleTagManagerAccountId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
  `;

  const bodyScript = document.createRange().createContextualFragment(bodyCode);
  document.body.prepend(bodyScript);
}

/****************************************************************************************
  Tracking
****************************************************************************************/

export async function track(type: string, action: string, params: object): Promise<void> {
  try {
    await waitForGTag();
    (window as any).gtag(type, action, params);
  } catch (e) {
    console.error('Google Analytics failed to track event');
  }
}
