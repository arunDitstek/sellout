import { EventInterface } from '@/utils/interface/event';
import { useEffect } from 'react';
import moment from 'moment-timezone';

interface EventSchemaProps {
    event: EventInterface;
    PRODUCTION: String;
}

const EventSchema: React.FC<EventSchemaProps> = ({ event, PRODUCTION }) => {    
    useEffect(() => {
        var oldMetaTag = document.querySelector('meta[name="robots"]');
    if (oldMetaTag) {
        // If it exists, remove the old meta tag
        oldMetaTag?.parentNode?.removeChild(oldMetaTag);
    }
        if (PRODUCTION == "true") {
            if (new Date(event?.schedule?.announceAt).getTime() > Date.now()) {

                const metatag = document.createElement('meta');
                metatag.name = 'robots';
                metatag.content = 'noindex';
                document.head.prepend(metatag);
            }
        } else {
            const metatag = document.createElement('meta');
            metatag.name = 'robots';
            metatag.content = 'noindex';
            document.head.prepend(metatag);

        }

        function removeHTMLTags(html: any) {
            return html.replace(/(<([^>]+)>)/gi, "");
        }
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": `${event?.name}`,
            "startDate": `${moment.unix(event?.schedule?.startsAt).tz(event?.venue.address.timezone).format('ddd, MMM Do [at] h:mma')}`,
            "location": {
                "@type": "Place",
                "name": `${event?.venue?.name}`,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": `${event?.venue?.address?.address1}`,
                    "addressLocality": `${event?.venue?.address?.city}`,
                    "postalCode": `${event?.venue?.address?.zip}`,
                    "addressRegion": `${event?.venue?.address?.state}`,
                    "addressCountry": `${event?.venue?.address?.country}`,
                }
            },
            "image": `${event?.posterImageUrl}`,
            "description": `${removeHTMLTags(event?.description)}`,
            "offers": {
                "@type": "Offer",
                "url": `https://sellout.io/${event.stub ? event.stub : event?._id}`,
                "price": `${event.lowestPrice}`,
                "priceCurrency": "USD",
            },
            "performer": {
                "@type": "PerformingGroup",
                "name": `${event.name}`
            }
        });
        document.head.prepend(script);
        return () => {
            document.head.removeChild(script);
        };
    }, [event]);
    return null;
};

export default EventSchema;
