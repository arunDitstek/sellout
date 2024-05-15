    import Image from 'next/image';
    import { ChangeEvent, useState } from 'react';

    interface EventSearchProps {
        events: any[]; 
        setEvents: React.Dispatch<React.SetStateAction<any[]>>; 
        totalEvent : any[];
        setLoading : React.Dispatch<React.SetStateAction<boolean>>; 
    }

    const EventSearch: React.FC<EventSearchProps> = ({ events, setEvents, totalEvent, setLoading }) => {
        const [searchTerm, setSearchTerm] = useState<string>('');
        const [typing, setTyping] = useState(false)

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setTyping(true)
            
            setSearchTerm(value);
            handleSearch(value);
        };

        const handleSearch = (value: string) => {
            if (value.trim() == '') {
                setTimeout(() => {
                    setEvents(totalEvent);
                    setTyping(false)
                    // setLoading(false);
                }, 500);
                
            } else {
                // setLoading(true);
                const filteredEvents = totalEvent.filter((event) =>
                    event.name.toLowerCase().includes(value.toLowerCase())   || 
                    event.venue.toLowerCase().includes(value.toLowerCase())

                );
                setTimeout(() => {
                    setEvents(filteredEvents);
                    setTyping(false)
                    // setLoading(false);
                }, 500);
            }
        };

        const handleSearchItem =() => {
            setSearchTerm('');
            setEvents(totalEvent);
            setLoading(false);
        };

        return (
            <div className={`event-inputBox relative ${typing ? 'border-[#EF3D07]' : 'border-[#9F8BDA]'} border-2 flex search border-solid rounded-lg h-12 px-10 bg-white flex align-center`}>
                <svg className={` absolute start-[10px] top-[11px] cursor-pointer `} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill='none'>
                    <path d="M10 18C11.775 17.9996 13.4988 17.4054 14.897 16.312L19.293 20.708L20.707 19.294L16.311 14.898C17.405 13.4997 17.9996 11.7754 18 10C18 5.589 14.411 2 10 2C5.589 2 2 5.589 2 10C2 14.411 5.589 18 10 18ZM10 4C13.309 4 16 6.691 16 10C16 13.309 13.309 16 10 16C6.691 16 4 13.309 4 10C4 6.691 6.691 4 10 4Z" fill={`${typing ? '#EF3D07' : '#452D8B'}`}/>
                </svg>
                {/* <Image 
                    src="/assets/images/search.svg" 
                    height={40} 
                    width={40} 
                    alt="search-icon" 
                    className={`w-[22px] absolute start-[10px] top-[13px] cursor-pointer `}
                />  */}
                <input 
                    type="text" 
                    placeholder="Find an Event" 
                    value={searchTerm} 
                    onChange={handleChange} 
                    className={`text-[18px] text-inter font-normal border-transparent focus-visible:outline-0 ${typing ? 'text-[#EF3D07]' : 'text-[#452D8B]'} placeholder:text-[#9F8BDA] w-full`}
                />
                {searchTerm && (
                    <svg onClick={handleSearchItem} className=" absolute end-[10px] top-[11px] cursor-pointer opacity-65 focus:opacity-100" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M16.192 6.34375L11.949 10.5858L7.70697 6.34375L6.29297 7.75775L10.535 11.9998L6.29297 16.2418L7.70697 17.6558L11.949 13.4137L16.192 17.6558L17.606 16.2418L13.364 11.9998L17.606 7.75775L16.192 6.34375Z" fill={`${typing ? '#EF3D07' : '#452D8B'}`} />
                    </svg>
                    // <Image 
                    //     src="/assets/images/close.svg" 
                    //     alt='logo' 
                    //     height={40} 
                    //     width={40} 
                    //     onClick={handleSearchItem} 
                    //     className="w-[16px] absolute end-[10px] top-[16px] cursor-pointer opacity-65 focus:opacity-100"
                    // />
                )}
            </div>
        );
    };

    export default EventSearch;
