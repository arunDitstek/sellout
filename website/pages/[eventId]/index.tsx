import parse from 'html-react-parser';
import Footer from "@/components/layouts/footer";
import Ticket from "@/components/events/ticket";
import Venue from '@/components/events/venue';
import UpcomingEvents from '@/components/events/upcomingEvents';
import { baseURL, SITE_URL, NEXT_PUBLIC_GOOGLE_API_KEY, PRODUCTION } from '@/utils/global';
import moment from 'moment-timezone';
import EventBanner from '@/components/events/eventBanner';
import React, { useState, useEffect } from 'react';
import Loader from '@/components/layouts/loader';
import EventSchema from '@/components/events/eventSchema';
import { useRouter } from 'next/router';
import Script from "next/script";
import Head from "next/head";

const EventDetail = ({ event, events,SITE_URL, NEXT_PUBLIC_GOOGLE_API_KEY , PRODUCTION}: any) => { 

    const [loading, setLoading] = useState(false);
    const [scrolltopdata, setscrolltopdata] = useState("");

  const router = useRouter();  
    useEffect(() => {
        const handleScroll = () => {
        const windowHeight = window.innerHeight;
        const footerElement: any = document.querySelector(".footer-class");
        const footerTop = footerElement?.offsetTop;
        // const distanceToFooter = footerTopSITE_URL
        //     ? footerTop - (window.scrollY + windowHeight)
        //     : 0;

        if (window.scrollY < 625) {
            setscrolltopdata("");
        } else {
            setscrolltopdata("get-ticket-widget");
        }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const handlePopstate = () => {
          const event = router.query.event;
        };
        window.addEventListener('popstate', handlePopstate);
        return () => {
          window.removeEventListener('popstate', handlePopstate);
        };
    }, [router]);



    function trimStringTo150Characters(input : any) {
        if (input.length <= 150) {
            return input;
        } else {
            return input.substring(0, 150) + '...';
        }
    }

    function removeHTMLTags(html : any) {
        return html.replace(/(<([^>]+)>)/gi, "");
    }

    if (!event) {
        return <div>Event Not Found</div>;
    }

    return (
        <>
         <Script>{`window.history.scrollRestoration = "manual"`}</Script>
        { loading ? <Loader /> : <>  </>   }    
            <Head>
                <title>{event.name}</title>
                <meta name="description" content={`${trimStringTo150Characters(removeHTMLTags(event.description))}`} />
                <meta property="og:title" content={removeHTMLTags(event.name)} />
                <meta property="og:description" content={trimStringTo150Characters(removeHTMLTags(event.description))} />
                <meta property="og:image" content={event?.posterImageUrl} />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:type" content="website" />
            </Head>   
           <EventBanner event={event}/>
            <div className="ticket-event xl:w-[1200px] flex w-[100%] mx-auto bg-white pt-20 pb-40 px-16] relative">
                <div className="flex justify-between flex-col w-full heading-event">
                    <div className="w-full flex justify-between md:flex-row flex-col heading-banner-content">
                        <div className="flex-col detail-page-content event-retail-content justify-start items-start gap-6 inline-flex">
                            <div className="self-stretch flex-col justify-start items-start gap-6 flex">
                                {event?.venue && (<h3 className="self-stretch text-orange-600 text-4xl font-extrabold uppercase leading-9 m-0">{moment.unix(event.schedule.startsAt).tz(event.venue.address.timezone).format('dddd, MMMM Do')} </h3>)}
                                {/* <p className="w-[100px] h-[100px] relative"> </p> */}
                                <h1 className="self-stretch text-indigo-950 xl:text-8xl font-bold uppercase leading-[128px] m-0 main-event">{event?.name}</h1>
                            </div>
                            {event?.subtitle ? <span className="self-stretch text-indigo-950 text-lg font-normal leading-9">{event?.subtitle}</span> :  ''}
                        </div>
                        <div className={`w-[320px] scroll-widget ${scrolltopdata}`}>
                            {event && <Ticket event={event}/>}
                        </div> 
                    </div>                    
                    <div className="w-full detail-page-content flex-col justify-start items-start gap-4 inline-flex mt-20">
                        <h4 className="self-stretch text-indigo-950 text-5xl font-bold uppercase leading-[48px] m-0">DATE & TIME</h4>
                        {event?.venue && event?.performances[0]?.schedule.map((time : any, index: number) => {
                            return (
                                <div key={index} className="self-stretch flex-col justify-start items-start gap-2 flex">
                                    <div className="self-stretch time-lead"><span className="text-violet-900 text-xl font-semibold leading-[30px]">{ moment.unix(time.startsAt).tz(event?.venue.address.timezone).format('dddd, MMMM Do') }  </span>
                                    <span className="text-violet-200 time-leaddivide text-xl font-semibold leading-[30px]"> | </span>
                                    <span className="text-violet-900 text-xl font-semibold leading-[30px]">{`${moment.unix(time.startsAt).tz(event?.venue.address.timezone).format('h:mm a')} - ${moment.unix(time.endsAt).tz(event?.venue.address.timezone).format('h:mm a')} ${moment.tz(event?.venue.address.timezone).format('z')}`}</span></div>
                                    <div className="self-stretch">
                                        <span className="text-violet-900 text-lg font-normal leading-[27px]">Doors Open:</span>
                                        <span className="text-indigo-950 text-lg font-normal leading-[27px]"> {moment.unix(time.doorsAt).tz(event?.venue.address.timezone).format('h:mm a')} </span>
                                    </div>
                                    <div className="self-stretch">
                                        <span className="text-violet-900 text-lg font-normal leading-[27px]">Show Starts:</span>
                                        <span className="text-indigo-950 text-lg font-normal leading-[27px]"> {moment.unix(time.startsAt).tz(event?.venue.address.timezone).format('h:mm a')} </span>
                                    </div>
                                </div> 
                            )
                        })}
                    </div>
                    <div className="w-full detail-page-content flex-col justify-start items-start gap-4 inline-flex mt-20">
                        <h4 className=" text-indigo-950 text-5xl font-bold uppercase leading-[48px] m-0">LOCATION</h4>
                        {event?.venue && (
                        <div className="self-stretch justify-start items-start inline-flex">
                            <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
                                <span className="self-stretch text-violet-900 text-xl font-semibold leading-[30px]">{event?.venue?.name}</span>
                                <span className="self-stretch text-indigo-950 text-base font-normal leading-normal">
                                    {`${event && event.venue && event.venue.address.address1} 
                                    ${event && event.venue && event.venue.address.address2 ? event.venue.address.address2 + ',' : ''}
                                    ${event && event.venue && event.venue.address.city},
                                    ${event && event.venue && event.venue.address.state}
                                    ${event && event.venue && event.venue.address.zip}`}
                                </span>
                            </div>
                        </div>)}
                    </div>
                    <div className="w-full detail-page-content flex-col justify-start items-start gap-4 inline-flex mt-20">
                        <div className="paragraph-parent flex-col justify-start items-start gap-4 inline-flex">
                            <h4 className="self-stretch text-indigo-950 text-5xl uppercase font-bold leading-[48px] m-0">ABOUT THE EVENT</h4>
                            { parse(event?.description ? event?.description : '<p></p>') }
                        </div>
                    </div>
                    <div className="w-full detail-page-content flex-col justify-start items-start gap-4 inline-flex mt-20">
                        <h4 className="self-stretch text-indigo-950 text-5xl font-bold uppercase leading-[48px] m-0">THE VENUE</h4>
                        { event?.venue?.address?.lat && event?.venue?.address?.lng &&  <Venue latitude={event?.venue?.address?.lat} longitude={event?.venue?.address?.lng} Key={NEXT_PUBLIC_GOOGLE_API_KEY}/> }
                        <div className="self-stretch h-[54px] flex-col justify-start items-start flex">
                        {event?.venue && (
                            <>
                                <p className="self-stretch text-violet-900 text-xl font-semibold leading-[30px] m-0">{event?.venue?.name}</p>
                                <span className="self-stretch text-indigo-950 text-base font-normal leading-normal">{`${event && event.venue && event.venue.address.address1},
                                    ${event && event.venue && event.venue.address.address2 ? event.venue.address.address2 + ',' : ''},
                                    ${event && event.venue && event.venue.address.city},
                                    ${event && event.venue && event.venue.address.state}
                                    ${event && event.venue && event.venue.address.zip}`}
                                </span>
                            </>
                        )}
                        </div>
                    </div>
                </div>                               
            </div>
            <div className={`w-full pt-20 pb-[184px]  bg-violet-50 flex-col justify-start items-center gap-2 inline-flex relative`}>
                <div className="xl:w-[1200px] w-[90%] mx-auto flex-col justify-start items-start gap-2 z-10 absolute top-[-25px]">
                    <div className="pl-[22.99px] pr-[23.01px] pt-[7.69px] pb-[6.31px] bg-orange-600 rounded-[43.47px] justify-center items-center inline-flex">
                        <h4 className="text-white md:text-4xl text-3xl font-extrabold uppercase leading-9 m-0">Event ORganizer</h4>
                    </div>
                </div>
                <div className="xl:w-[1200px] w-[90%] flex-col justify-start items-start gap-20 inline-flex">
                    <div className="flex-col justify-start items-start gap-6 flex detail-page-content">
                        <h2 className="self-stretch text-indigo-950 text-5xl md:text-7xl font-bold uppercase leading-[54px]  md:leading-[72px] m-0">{event?.organization?.orgName}</h2>
                        <div className="self-stretch text-indigo-950 text-lg font-normal leading-9 m-0">{parse(event?.organization.bio ?? '<p></p>')}</div>
                    </div>                   
                    <UpcomingEvents events={events} setLoading={setLoading} event={event}/>                       
                </div>                
            </div>
            <Footer SITE_URL={SITE_URL} />            
            <EventSchema event={event} PRODUCTION={PRODUCTION}/> 
        </>
    );
};

export async function getServerSideProps({ req , params}: any) {
    const eventId = params?.eventId;
    try {
        let res = await fetch(`${baseURL}/getEventDetail?id=${eventId}`);
        if (!res.ok) {
            res = await fetch(`${baseURL}/getEventDetail?name=${eventId}`);
        }
        if (!res.ok) {
            throw new Error(`Failed to fetch event details for eventId: ${eventId}`);
        }
        const { event } = await res.json();
        const listingsRes = await fetch(`${baseURL}/getEventList`);
        if (!listingsRes.ok) {
            throw new Error(`Failed to fetch event listings`);
        }
        const { events } = await listingsRes.json();
        return {
            props: {
                event,
                events,
                SITE_URL,
                NEXT_PUBLIC_GOOGLE_API_KEY,
                PRODUCTION
            },
        };
    } catch (error) {
        return {
            props: {
                event: null,
                events: [],
                siteUrl: SITE_URL,
                NEXT_PUBLIC_GOOGLE_API_KEY,
                PRODUCTION
            },
        };
    }
}



export default EventDetail;

