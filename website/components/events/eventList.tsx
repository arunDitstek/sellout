import Link from 'next/link';
import { EventInterface } from '@/utils/interface/event';
import moment from 'moment-timezone';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// import Loader from '../layouts/loader';


interface EventListProps {
    events: EventInterface[];
    loading : boolean;
    setLoading : any;
}

const EventList: React.FC<EventListProps>  = ({events, loading, setLoading}) => {
    const router = useRouter();

    useEffect(() => {
        window?.Sellout?.close();        
    }, [])
    
    const handleChangeUrl = (url :string) => {
        setLoading(true)
        router.push(url).then(() => setLoading(false))
    }

    return (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 grid-cols-1 mx-auto relative"> 
            {/* {events.length == 0 && <h2 className="flex text-2xl absolute whitespace-nowrap justify-center w-full text-gray-500 font-bold col-span-3">No data found</h2>} */}
            {
                events.length == 0 &&
                <div className=" text-2xl border p-5 rounded-lg col-start-2 whitespace-wrap text-gray-500 font-bold">
                    <div className="text-sm font-medium text-gray-700">No results found.</div>
                    <div className="mt-1 text-sm text-gray-500">There are no results with this criteria. Try changing your search.</div>
                </div>
            }
            
            {events.length > 0 && events.map((event, i) => {
                let url = event?.stub ? event?.stub : event._id;
               return (
                <div key={i} onClick={() => handleChangeUrl(url)} className="event_listing_section lg:max-w-lg w-full bg-white col-span-1 border-gray-200 rounded-2xl overflow-hidden mb-6">
                    <div className="flex flex-col relative">                       
                            {event?.status == "On Sale" ? `` :  <p className="sale-tag sale-main letter-spacing absolute tab-sale-tag font-semibold rounded-full py-3 py-5 bg-[#F7F5FF] text-lg z-10 text-[#130C27] text-inter">{event?.status}</p>}
                        <div style={{backgroundImage : `url(${event?.posterImageUrl})`, backgroundSize: "cover"}} className="date-preview1 w-full h-[210px] z-0 rounded-[24px] overflow-hidden ">
                            <div style={{backdropFilter: "blur(10px)", height: "100%", padding: "0 10px"} } className={`flex items-center justify-center z-10 w-full  mx-auto px-[45px] `}>
                                <img className="card-image w-auto h-full object-cover"  src={event?.posterImageUrl} alt="Event Image"  />
                            </div>
                        </div>
                        <button className='letter-spacing view-event-btn rounded-full p-3 absolute z-10 text-white flex' onClick={() => handleChangeUrl(url)}>View Event 
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M5.293 12.293L6.707 13.707L13.414 6.99997L6.707 0.292969L5.293 1.70697L9.586 5.99997H0V7.99997H9.586L5.293 12.293Z" fill="white"/>
                            </svg>
                        </button>
                    </div>
                    <div className="pb-[78px] px-6 pt-24 pb-32 relative h-[calc(100%-260px)]">
                        <div className="date-preview h-10 px-4 bg-violet-50 rounded-[43px] backdrop-blur-sm justify-center items-center gap-3 inline-flex mb-3">
                            <span className="tab-sale-tag letter-spacing text-indigo-950 text-inter text-lg font-semibold leading-[18px]">
                                { moment.unix(event?.startsAt).tz(event?.venueTimezone).format('ddd MMM Do [@]h:mma') }
                                {/* {formatDate3(event?.startsAt, event?.venueTimezone)}  */}
                            </span>
                        </div>
                        <div className=' '>
                        <Link href={`/${url}`} className="no-underline caption-animation">
                            <h5 className="event-name text-indigo-950 font-bold text-5xl uppercase leading-[48px] event-caption overflow-hidden text-ellipsis">{event?.name}</h5>
                        </Link>
                        </div>
                        <Link href={`/${url}`} className="text-inter absolute bottom-[-40px] left-[24px] pb-[20px]  whitespace-nowrap me-6 no-underline inline-flex gap-3 items-center text-[18px] text-center rounded-lg text-[#EF3D07] font-semibold letter-spacing leading-[18px]">
                            <img src="/assets/images/map.svg"  alt="Map icon" className="max-w-[15px]"/> {event?.venue}
                        </Link>
                    </div>
                </div>
            )
                })}
        </div>
    )
}

export default EventList;