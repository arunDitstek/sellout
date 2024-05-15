import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import EventList from "@/components/events/eventList";
import EventSearch from "@/components/events/eventSearch";
import Footer from "@/components/layouts/footer";
import { EventInterface } from "@/utils/interface/event";
import { baseURL, SITE_URL } from "@/utils/global";
import EventSort from "@/components/events/eventSort";
import Loader from "@/components/layouts/loader";
import Head from "next/head";


const inter = Inter({ subsets: ["latin"] });

const Events = ({eventData, SITE_URL}: any) => {

    const [ events, setEvents ] = useState<EventInterface[]>(eventData);   
    const [loading, setLoading] = useState(false)
    const [totalEvent, setTotalEvent] = useState<EventInterface[]>([])

    useEffect(() => {
        if (eventData) {         
            setEvents(eventData);
            setTotalEvent(eventData);
            setLoading(false);   
        }
    }, []);  


  return (
    <>
        { loading ? <Loader /> : <>  </>   }   
        <Head>
            <title>Sellout Events</title>
            <meta name="description" content="Discover exclusive and highly sought-after events before they're gone! Explore our curated selection of sellout events happening soon" />
            <meta property="og:description" content="Discover exclusive and highly sought-after events before they're gone! Explore our curated selection of sellout events happening soon" />
            <meta property="og:image" content="https://storage.googleapis.com/sellout-assets/default-images/event/general-event.jpeg" />
            <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
            <meta property="og:type" content="website" />
        </Head>     
        <div className="flex w-full h-[388px] md:h-[502px] justify-center bg-[#392574]">
        {/* <div className="flex w-full h-[388px] md:h-[502px] justify-center bg-[url(/assets/images/browse-events-header.svg)] bg-cover"> */}
            <div className="flex items-end h-full w-full banner-width mx-auto px-[15px]">
                <h1 className="find-event event-banner-module text-violet-50 font-bold uppercase mb-10">Find an Event</h1>
            </div>
        </div>
        <div className="flex flex-col bg-[#F7F5FF]">
            <div className="container-width event-list w-full mx-auto pt-[112px] pb-[177px] flex flex-col align-center px-[15px]">
                <div className="flex gap-5 mb-10 justify-between align-center flex-wrap">
                    <EventSearch events={events} setEvents={setEvents} totalEvent={totalEvent} setLoading={setLoading}/>
                    <EventSort setEvents={setEvents} events={events} totalEvent={totalEvent} setLoading={setLoading} />
                </div>
                <EventList events={events} setLoading={setLoading} loading={loading}/> 
            </div>
        </div>
        <Footer SITE_URL={SITE_URL} />
    </>
       
  )
}

export const getServerSideProps = async () => {    
    try {
        const res = await fetch(`${baseURL}/getEventList`);
        if (!res.ok) {
            throw new Error(`Failed to fetch event listing`);
        }
        const { events } = await res.json();
        return { 
            props:  { eventData: events, SITE_URL } 
        };
    } 
    catch (error) {
        return { 
            props: 
                { eventData: [], SITE_URL } 
        };
    } 
  
}

export default Events;
