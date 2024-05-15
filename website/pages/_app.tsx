// import "@/styles/globals.css";
import Loader from "@/components/layouts/loader";
import "@/styles/layout.css";
import type { AppProps } from "next/app";
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NEXT_PUBLIC_GOOGLE_TAG_ID, NEXT_PUBLIC_FACEBOOK_ID, NEXT_PUBLIC_INTERCOME_APP_ID } from "@/utils/global";
import Script from "next/script";
import Intercom from 'react-intercom';


export default function App({ Component, pageProps }: AppProps) {

 
  
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const start = () => {
      setLoading(true);
    };
    const end = () => {
      setLoading(false);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  return (
    <>
      {loading ? <Loader /> : <> </>}
      <GoogleAnalytics gaId={`${NEXT_PUBLIC_GOOGLE_TAG_ID}`} />
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;
        n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;
        n.push=n;
        n.loaded=!0;
        n.version='2.0';
        n.queue=[];
        t=b.createElement(e);
        t.async=!0;
        t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      }
      (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${NEXT_PUBLIC_FACEBOOK_ID}');
      fbq('track', 'PageView');
    `,
        }}
      />
        <Intercom
            appID={`${NEXT_PUBLIC_INTERCOME_APP_ID}`}
        />
      <Component isRouteChanging={isRouteChanging} {...pageProps} />
    </>
  );
}
