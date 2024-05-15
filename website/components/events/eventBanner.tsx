import { EventInterface } from "@/utils/interface/event";
import Link from "next/link";

interface EventBannerProps {
    event: EventInterface;
}

const EventBanner: React.FC<EventBannerProps> = ({ event }) => {

    return (
        <div  className="banner-container flex w-full h-[275px] md:h-[502px] justify-center relative before:content-[''] before:absolute before:bg-[#130C27] before:w-full before:h-full before:left-20px before:right-20px before:z-10">
            <div style={{backgroundImage : `url(${event?.posterImageUrl})`, } } className="absolute banner-wrapper absolute  after:content-[''] after:absolute after:w-full after:h-full mx-auto w-full md:px-[15px] px-[0px] h-full z-0 "></div>
                <div style={{backgroundImage : `url(${event?.posterImageUrl})`, backgroundSize: 'contain'}}  className={`banner-imageelement flex items-end h-[275px] md:h-[502px] z-10 w-full xl:max-w-[1130px] max-w-[100%] mx-auto md:px-[15px] px-[0px] bg-contain bg-no-repeat bg-center bg-[url('${event?.posterImageUrl}')] `}>
                    <div className="bg-[#130C27] mb-4 md:block hidden p-4 rounded-lg z-10">
                        <Link href="https://sellout.io/">
                            <h1 className="text-white m-0 flex items-center gap-2 text-2xl font-extrabold">
                                <span className="text-lg leading-[18px]">Ticketing by</span>
                                <img src="/assets/images/sellout.svg" alt="sellout" style={{width: '100.593px', height: '24px'}}/> 
                            </h1>
                        </Link>
                    </div>
                </div>
        </div>
    );
};
// style={{backgroundImage : `url(${event?.posterImageUrl})`}}

export default EventBanner;