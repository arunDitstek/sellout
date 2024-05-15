import { useEffect, useState } from "react";

interface VenueProps {
    latitude: any;
    longitude : any;
    Key : any
}

const Venue: React.FC<VenueProps>  = ({latitude, longitude, Key}) => {
    const [loading, setLoading] = useState(true);  
    useEffect(() => {
       setTimeout( () => {
        setLoading(false)
       }, 500)        
    }, [latitude, longitude]);
    
    return (        
        <div className="self-stretch h-[461px] rounded-2xl flex-col justify-start items-start gap-8 flex w-full detail-page-content venue-event-module">
            <iframe
            className="md:w-[700px] h-[461px] rounded w-full"
            src={`https://www.google.com/maps/embed/v1/place?key=${Key}&q=${latitude},${longitude}`}
            loading="lazy"
            />                                
        </div>           
    )
}   

export default Venue;