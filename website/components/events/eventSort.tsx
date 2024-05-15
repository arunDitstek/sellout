import { useEffect, useState, useRef } from "react";

interface EventSortProps {
    events: any[]; 
    setEvents: React.Dispatch<React.SetStateAction<any[]>>; 
    totalEvent: any[];
    setLoading: React.Dispatch<React.SetStateAction<boolean>>; 
}

const EventSort: React.FC<EventSortProps> = ({ events, setEvents, totalEvent, setLoading }) => {
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortType, setSortType] = useState('Date - Asc');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleFilterSelection = (str: string) => {
        setShowSortDropdown(false);        
        handleSorting(str, sortType);
    }

    const handleSorting = (name: string, sort: string) => {
        setLoading(true);
        setShowSortDropdown(false);

        if (name === 'Name') {
            sort === 'Asc' 
                ? setEvents(totalEvent.slice().sort((a, b) => a.name.localeCompare(b.name)))
                : setEvents(totalEvent.slice().sort((a, b) => b.name.localeCompare(a.name)));
        } 
        else if (name === 'Date') {
            sort === 'Asc' 
                ? setEvents(totalEvent.slice().sort((a, b) => a.startsAt - b.startsAt))
                : setEvents(totalEvent.slice().sort((a, b) => b.startsAt - a.startsAt));
        } 
        else {
            setEvents(totalEvent);
        }
        setSortType(`${name} - ${sort}`)

        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }

    useEffect(() => {
        const handleClickOutside = (event : any) => {
            if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="search relative flex gap-4">        
            <div>
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="relative cursor-pointer text-[18px] text-inter font-semibold bg-transparent border-0 py-2.5 text-center inline-flex items-center text-[#EF3D07]" type="button">
                    Sorting: {sortType} 
                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                    </svg>
                </button>
                {showSortDropdown &&
                    <div ref={dropdownRef} className="dropdown z-11 rounded z-11 bg-white divide-y shadow w-44 absolute">
                        <ul className="p-0 my-2 list-none text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">                             
                            <li>
                                <button onClick={() => handleSorting('Date', 'Asc')} className="letter-spacing block px-4 py-2 hover:bg-gray-100 no-underline text-black text-[16px] w-full text-left">Date - Asc</button>
                            </li>  
                            <li>
                                <button onClick={() => handleSorting('Date', 'Desc')} className="letter-spacing block px-4 py-2 hover:bg-gray-100 no-underline text-black text-[16px] w-full text-left">Date - Desc</button>
                            </li>         
                            <li>
                                <button onClick={() => handleSorting('Name', 'Asc')} className="letter-spacing block px-4 py-2 hover:bg-gray-100 no-underline text-black text-[16px] w-full text-left">Name - Asc</button>
                            </li>  
                            <li>
                                <button onClick={() => handleSorting('Name', 'Desc')} className="letter-spacing block px-4 py-2 hover:bg-gray-100 no-underline text-black text-[16px] w-full text-left">Name - Desc</button>
                            </li>                             
                        </ul>
                    </div>
                }
            </div>
        </div>
    )
}

export default EventSort;
