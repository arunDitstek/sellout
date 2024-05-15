import { EventInterface } from "@/utils/interface/event";
import { useEffect, useState } from "react";
import copy from "copy-text-to-clipboard";
import moment from "moment";


interface EventListProps {
  event: EventInterface;
}

declare global {
  interface Window {
    Sellout: any;
  }
}

const Ticket: React.FC<EventListProps> = ({ event }) => {

  const [copyText, setCopyText] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isTimeCompleted, setIsTimeCompleted] = useState(false);
 

  const handleTicketArea = () => {
    window.Sellout.open(event._id, "undefined", "checkout", false, "arun");
  };

  const now = moment(new Date()); //todays date
  const end = moment(event.schedule.ticketsAt * 1000); // another date
  const duration = moment.duration(end.diff(now));
  const days = Math.floor(duration.asDays());
  const time = moment(event.schedule.ticketsEndAt * 1000 );

  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = moment(new Date());
      const end = moment(event.schedule.ticketsAt * 1000);
      const duration = moment.duration(end.diff(now));
      setRemainingTime(duration.asMilliseconds());
      if (duration.asMilliseconds() <= 0) {
        setIsTimeCompleted(true);
      }
    };   
    calculateRemainingTime();
    const intervalId = setInterval(calculateRemainingTime, 1000);
    return () => clearInterval(intervalId);
  }, [event]);


  return (
    <div className="ticket-widget-wrapper md:w-80 w-full relative xl:h-[484px] bg-[url(/assets/images/browse-events-header.svg)] px-6 pt-16 xl:pb-6 pb-16 rounded-2xl border-b-16 border-orange-600 flex-col justify-start items-start xl:gap-8 gap-10 inline-flex bg-center bg-no-repeat bg-cover">
      {event.status === "Sold Out" && (
        <div className="soldout-wrapper w-full">
          <div className="soldout-items h-[106px] flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-white w-full text-lg font-semibold leading-[18px] text-center">
              This event is
            </span>
            <h3 className="mobile-price text-white text-6xl w-full font-bold uppercase leading-[72px] m-0 text-center">
              SOLD OUT
            </h3>            
          </div>
          <div className="h-[108px] flex-col justify-center items-start gap-3 flex w-full action-button flex-wrap">
          <button
            onClick={handleTicketArea}
              className="letter-spacing text-white self-stretch h-12 px-6 py-2.5 bg-orange-600 rounded-xl text-lg font-semibold leading-[18px] whitespace-nowrap"
            >
              Wait List
            </button>
            <button
              className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap "
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
              {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>
          <div className="tag-line flex justify-center gap-2 w-full">
            <span className="text-lg text-white text-lg">Ticketing by</span>
            <span className="font-bold uppercase font-['Sofia Sans'] text-white  text-xl">
              Sellout
            </span>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}

      {event.status == "Live" && event?.remainingQty == "0" && (
        <div className="soldout-wrapper w-full">
          <div className="soldout-items h-[106px] flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-white w-full text-lg font-semibold leading-[18px] text-center">
              This event is
            </span>
            <h3 className="mobile-price text-white text-6xl w-full font-bold uppercase leading-[72px] m-0 text-center">
              SOLD OUT
            </h3>
          </div>
          <div className="h-[108px] flex-col justify-center items-start gap-3 flex w-full action-button wait-list-feild flex-wrap">
          <button onClick={handleTicketArea} className="letter-spacing text-white self-stretch h-12 px-6 py-2.5 bg-orange-600 rounded-xl text-lg font-semibold leading-[18px] whitespace-nowrap">
            Wait List
          </button>
          <button
              className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap "
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
              {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>
          <div className="tag-line flex justify-center gap-2 w-full">
            <span className="text-lg text-white text-lg">Ticketing by</span>
            <span className="font-bold uppercase font-['Sofia Sans'] text-white  text-xl">
              Sellout
            </span>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}

      {event.status === "On Sale" && (
        <div className="open-tickets w-full">
          <div className="ticket-amount flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-white text-lg font-semibold leading-[18px] ">
              Starting At
            </span>
            <h3 className="mobile-price mobile-text-element text-white text-7xl font-bold uppercase leading-[72px] m-0">
              ${(event?.lowestPrice ?? 0) / 100}
            </h3>
          </div>
          <div className="h-[108px] flex-col justify-center items-start gap-3 flex w-full action-button flex-wrap">
            <button
              onClick={handleTicketArea}
              className="letter-spacing text-white self-stretch h-12 px-6 py-2.5 bg-orange-600 rounded-xl text-lg font-semibold leading-[18px] whitespace-nowrap"
            >
              Get Tickets
            </button>
            <button className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap"
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
            {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>

          <div className="tag-line flex justify-center items-center gap-2 w-full">
            <span className="tag-title text-lg text-white text-lg">Ticketing by</span>
            {/* <span className="font-bold uppercase font-['Sofia Sans'] text-white  text-xl">
              Sellout
            </span> */}
            <span className="">
            <svg xmlns="http://www.w3.org/2000/svg" width="55" height="13" viewBox="0 0 55 13" fill="none">
                <path d="M54.7166 0.240356H46.8857V2.54454H49.5119V12.778H52.0904V2.54454H54.7166V0.240356Z" fill="white"/>
                <path d="M43.3513 0.23938V9.34283C43.3513 10.1754 42.9328 10.692 42.0611 10.6911C41.1885 10.6911 40.7709 10.1754 40.7709 9.34283V0.23938H38.1924V9.11168C38.1924 11.6691 39.5824 12.9943 42.0611 12.9943C44.5398 12.9943 45.9298 11.8817 45.9298 9.11168V0.23938H43.3513Z" fill="white"/>
                <path d="M33.326 0.0285645C30.7145 0.0285645 29.3877 1.76361 29.3877 3.91952V9.08228C29.3877 11.4095 30.8976 12.9999 33.326 12.9999C35.7544 12.9999 37.2643 11.4095 37.2643 9.08228V3.91952C37.2643 1.76361 35.9375 0.0285645 33.326 0.0285645ZM34.684 9.10715C34.684 10.169 34.1748 10.6985 33.326 10.6985C32.4772 10.6985 31.9552 10.1828 31.9552 9.10715V3.91583C31.9552 2.93504 32.4177 2.32814 33.326 2.32814C34.2344 2.32814 34.684 2.9728 34.684 3.91583V9.10715Z" fill="white"/>
                <path d="M25.1694 10.4075V0.240356H22.5918V12.7863H28.6105V10.4075H25.1694Z" fill="white"/>
                <path d="M18.1879 10.4075V0.240356H15.6094V12.7863H21.6281V10.4075H18.1879Z" fill="white"/>
                <path d="M14.6743 2.53441V0.240356H8.61621V12.778H14.6743V10.4342H11.1947V7.49457H14.3474V5.30458H11.1947V2.53441H14.6743Z" fill="white"/>
                <path d="M3.98527 12.9991C2.11272 12.9991 0.283203 12.0689 0.283203 9.32176V8.4791H2.80955V9.31623C2.80955 10.4149 3.27837 10.728 3.87905 10.728H4.02007C4.89728 10.728 5.17839 10.2399 5.17839 9.36412C5.17839 8.57764 4.83044 8.14572 4.12262 7.78656L2.31508 6.86194C1.06336 6.20807 0.375686 5.21623 0.375686 3.50052C0.375686 1.23134 1.83344 0.0129395 3.93491 0.0129395H4.07226C6.48231 0.0129395 7.60951 1.56195 7.60951 3.48487V4.0844H5.12071V3.42132C5.12071 2.70852 4.73612 2.28765 4.03563 2.28765H3.92575C3.13369 2.28765 2.8709 2.83008 2.8709 3.42132C2.8709 4.07887 3.13003 4.44356 3.68585 4.74931L5.7864 5.86549C6.88063 6.43554 7.68551 7.42831 7.68551 9.29597C7.68551 11.6904 6.30009 12.9991 4.15376 12.9991H3.98619H3.98527Z" fill="white"/>
              </svg>
            </span>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}

      {event.status === "Announced" && (
        <div className="soldout-wrapper w-full">
          <div className="soldout-items h-[106px] flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-purple w-full text-lg font-semibold leading-[18px] text-center">
              Tickets on sale in
            </span>
            <h3 className="mobile-price text-white text-6xl w-full font-bold uppercase leading-[72px] m-0 text-center" suppressHydrationWarning={true}>
              {remainingTime <= 86400000  ? moment.utc(duration.asMilliseconds()).format("HH:mm:ss") : Math.floor(remainingTime / (1000 * 60 * 60 * 24)) + " days"} 
            </h3>
            {/* <h3 className="mobile-price text-white text-6xl w-full font-bold uppercase leading-[72px] m-0 text-center">
              {days} days
            </h3> */}
          </div>
          <div className="h-[108px] flex-col justify-center items-start gap-3 flex w-full action-button flex-wrap">
            <button onClick={handleTicketArea} className="letter-spacing text-white self-stretch h-12 px-6 py-2.5 bg-orange-600 rounded-xl text-lg font-semibold leading-[18px] whitespace-nowrap">
              Notify Me
            </button>
            <button
              className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap "
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
              {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}

      {event.status === "Sales Ended" && (
        <div className="soldout-wrapper w-full">
          <div className="soldout-items h-[106px] flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-purple w-full text-lg font-semibold leading-[18px] text-center">
            Ticket sales for this event have
            </span>
            <h3 className="mobile-price text-white text-6xl w-full font-bold uppercase leading-[72px] m-0 text-center">
              Ended
            </h3>
          </div>
          <div className="h-[108px] flex-col justify-center items-start gap-3 flex w-full action-button flex-wrap">
            <button
              className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap "
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
              {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}
      {event.status == "Live" && now < time && event.remainingQty > "0" && (
        <div className="open-tickets w-full">
          <div className="ticket-amount flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-white text-lg font-semibold leading-[18px] ">
              Starting At
            </span>
            <h3 className="mobile-price mobile-text-element text-white text-7xl font-bold uppercase leading-[72px] m-0">
              ${(event?.lowestPrice ?? 0) / 100}
            </h3>
          </div>
          <div className="h-[108px] flex-col justify-center items-start gap-3 flex w-full action-button flex-wrap">
            <button
              onClick={handleTicketArea}
              className="letter-spacing text-white self-stretch h-12 px-6 py-2.5 bg-orange-600 rounded-xl text-lg font-semibold leading-[18px] whitespace-nowrap"
            >
              Get Tickets
            </button>
            <button className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap"
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
            {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>

          <div className="tag-line flex justify-center items-center gap-2 w-full">
            <span className="tag-title text-lg text-white text-lg">Ticketing by</span>
            {/* <span className="font-bold uppercase font-['Sofia Sans'] text-white  text-xl">
              Sellout
            </span> */}
            <span className="">
            <svg xmlns="http://www.w3.org/2000/svg" width="55" height="13" viewBox="0 0 55 13" fill="none">
                <path d="M54.7166 0.240356H46.8857V2.54454H49.5119V12.778H52.0904V2.54454H54.7166V0.240356Z" fill="white"/>
                <path d="M43.3513 0.23938V9.34283C43.3513 10.1754 42.9328 10.692 42.0611 10.6911C41.1885 10.6911 40.7709 10.1754 40.7709 9.34283V0.23938H38.1924V9.11168C38.1924 11.6691 39.5824 12.9943 42.0611 12.9943C44.5398 12.9943 45.9298 11.8817 45.9298 9.11168V0.23938H43.3513Z" fill="white"/>
                <path d="M33.326 0.0285645C30.7145 0.0285645 29.3877 1.76361 29.3877 3.91952V9.08228C29.3877 11.4095 30.8976 12.9999 33.326 12.9999C35.7544 12.9999 37.2643 11.4095 37.2643 9.08228V3.91952C37.2643 1.76361 35.9375 0.0285645 33.326 0.0285645ZM34.684 9.10715C34.684 10.169 34.1748 10.6985 33.326 10.6985C32.4772 10.6985 31.9552 10.1828 31.9552 9.10715V3.91583C31.9552 2.93504 32.4177 2.32814 33.326 2.32814C34.2344 2.32814 34.684 2.9728 34.684 3.91583V9.10715Z" fill="white"/>
                <path d="M25.1694 10.4075V0.240356H22.5918V12.7863H28.6105V10.4075H25.1694Z" fill="white"/>
                <path d="M18.1879 10.4075V0.240356H15.6094V12.7863H21.6281V10.4075H18.1879Z" fill="white"/>
                <path d="M14.6743 2.53441V0.240356H8.61621V12.778H14.6743V10.4342H11.1947V7.49457H14.3474V5.30458H11.1947V2.53441H14.6743Z" fill="white"/>
                <path d="M3.98527 12.9991C2.11272 12.9991 0.283203 12.0689 0.283203 9.32176V8.4791H2.80955V9.31623C2.80955 10.4149 3.27837 10.728 3.87905 10.728H4.02007C4.89728 10.728 5.17839 10.2399 5.17839 9.36412C5.17839 8.57764 4.83044 8.14572 4.12262 7.78656L2.31508 6.86194C1.06336 6.20807 0.375686 5.21623 0.375686 3.50052C0.375686 1.23134 1.83344 0.0129395 3.93491 0.0129395H4.07226C6.48231 0.0129395 7.60951 1.56195 7.60951 3.48487V4.0844H5.12071V3.42132C5.12071 2.70852 4.73612 2.28765 4.03563 2.28765H3.92575C3.13369 2.28765 2.8709 2.83008 2.8709 3.42132C2.8709 4.07887 3.13003 4.44356 3.68585 4.74931L5.7864 5.86549C6.88063 6.43554 7.68551 7.42831 7.68551 9.29597C7.68551 11.6904 6.30009 12.9991 4.15376 12.9991H3.98619H3.98527Z" fill="white"/>
              </svg>
            </span>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}
      {event.status == "Live" && now >  time  && event.remainingQty > "0" && (
        <div className="soldout-wrapper w-full">
          <div className="soldout-items h-[106px] flex-col justify-start items-start gap-4 flex mb-8">
            <span className="text-purple w-full text-lg font-semibold leading-[18px] text-center">
            Ticket sales for this event have
            </span>
            <h3 className="mobile-price text-white text-6xl w-full font-bold uppercase leading-[72px] m-0 text-center">
              Ended
            </h3>
          </div>
          <div className="h-[108px] w-full action-button flex-wrap">
            <button
              className="letter-spacing text-white text-lg font-semibold self-stretch h-12 px-6 py-2.5 bg-violet-500 rounded-xl leading-[18px] whitespace-nowrap "
              onClick={() => {
                copy(window.location.href);
                setCopyText(true);
                setTimeout(() => {
                  setCopyText(false);
                }, 800);
              }}
            >
              {copyText ? "Link Copied" : `Share Event`}
            </button>
          </div>
          <div className="widget-circle w-[73px] h-[73px] bg-white rounded-full absolute bottom-[-50px] left-[50%] -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default Ticket;
