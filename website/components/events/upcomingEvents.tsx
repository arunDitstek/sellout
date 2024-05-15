import { EventInterface } from "@/utils/interface/event";
import Link from "next/link";
import Image from 'next/image';
import moment from 'moment-timezone';
import { useRouter } from 'next/router';

interface UpomingEventProps {
    events : EventInterface[];
    event : EventInterface;
    setLoading: any;
}

const UpcomingEvents: React.FC<UpomingEventProps> = ({events, event, setLoading}) => {    
    const router = useRouter();
    const handleChangeUrl = (url :string) => {
        setLoading(true)
        router.push(url).then(() => setLoading(false))
    }
    
    let filterEvents = events.filter(Ievent => {
        const eventStartTime = Ievent.startsAt * 1000;
        const now = Date.now();
        return Ievent.orgId === event.orgId && eventStartTime > now && Ievent._id != event._id;
    });
    
    filterEvents = filterEvents.length > 2 ? filterEvents.slice(0, 2) : filterEvents
    
    return (  
        <>
        {   filterEvents && filterEvents.length > 0 &&  (
            <div className="detail-page-content upcoming-details-event md:h-[572px] h-full flex-col justify-start items-start gap-6 flex">
                <h2 className="self-stretch text-indigo-950 text-5xl font-bold uppercase leading-[48px] m-0">Upcoming Events</h2>
                <div className="self-stretch md:flex-row flex-col justify-start items-start gap-6 inline-flex relative upcoming-eventcard">     
                    {
                        filterEvents.map((item, id) => {
                            let url = item?.stub ? item?.stub : item._id;
                            return (
                                 <div key={id} onClick={() => handleChangeUrl(url)} className="event_listing_section upcoming-card-flow grow shrink max-w-[344px] h-[500px] bg-white rounded-2xl flex-col justify-start items-start inline-flex relative rounded-[24px] overflow-hidden ">   
                                    <div className="md:h-[206px] h-full w-full relative flex justify-center rounded-[24px] overflow-hidden relative">
                                        {event?.status == "On Sale" ? `` :  <p className="sale-tag sale-main letter-spacing absolute tab-sale-tag font-semibold rounded-full py-3 py-5 bg-[#F7F5FF] text-lg z-10 text-[#130C27] text-inter">{event?.status}</p>}
                                        {/* <div className="sale-tag sale-main absolute font-semibold rounded-full py-3 py-5 bg-[#F7F5FF] text-lg z-10 text-[#130C27] text-inter">{item?.status == "On Sale" ? `${moment.unix(item?.schedule?.ticketsAt).tz(item?.venueTimezone).format('MMM Do')} ${getDateAndMonth(event?.schedule?.ticketsAt, event?.venueTimezone)}` : event?.status} </div> */}
                                        <div style={{backgroundImage : `url(${item?.posterImageUrl})`, backgroundSize: "cover"}} className=" w-full h-full z-0 rounded-[24px] overflow-hidden ">
                                            <div style={{backdropFilter: "blur(10px)", height: "100%", padding: "0 10px"} } className={` flex items-center justify-center z-10 w-full  mx-auto px-[45px] `}>
                                                <img src={`${item?.posterImageUrl}`} alt="" className=" card-image h-full object-cover" /> 
                                            </div>
                                        </div>
                                        <button className='letter-spacing view-event-btn rounded-full p-3 absolute z-10 text-white flex' onClick={() => handleChangeUrl(url)}>View Event 
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M5.293 12.293L6.707 13.707L13.414 6.99997L6.707 0.292969L5.293 1.70697L9.586 5.99997H0V7.99997H9.586L5.293 12.293Z" fill="white"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="self-stretch grow shrink basis-0 px-4 pt-4 pb-8 flex-col justify-start items-start gap-6 flex">
                                        <div className="self-stretch grow shrink basis-0 flex-col justify-start items-start gap-3 flex ">
                                            <div className="date-preview h-8 px-4 bg-violet-50 rounded-[43px] backdrop-blur-sm justify-center items-center gap-3 inline-flex">
                                                <span className="text-indigo-950 text-base font-bold leading-none">
                                                { moment.unix(item?.startsAt).tz(item?.venueTimezone).format('ddd MMM Do [@]h:mma') }
                                                    </span>
                                            </div>
                                            <div className="self-stretch min-h-[72px] flex-col justify-start items-start gap-2 flex">
                                                <h3 className="self-stretch card-heading-content max-w-[300px] text-indigo-950 text-4xl font-bold uppercase leading-9 m-0">{item?.name}</h3>
                                            </div>
                                        </div>
                                        <div className="self-stretch h-6 flex-col justify-start items-start gap-2 flex relative">
                                            <div className="self-stretch justify-start items-center gap-3 inline-flex">
                                                <div className="w-6 h-6 relative" />                        
                                                <Link href={`/${url}`} className=" absolute bottom-[0px] left-[24px] whitespace-nowrap me-6 no-underline inline-flex gap-2 items-center text-[18px] text-center rounded-lg text-[#EF3D07] font-semibold">
                                                    <img src="/assets/images/map.svg"  alt="Map icon" className="max-w-[15px]"/> {item?.venue}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }                  
                </div>                     
            </div> 
            )
        }  
        </>
    )
}

export default UpcomingEvents;