import Link from "next/link";

interface FooterProps {
    SITE_URL: any
}

const Footer: React.FC<FooterProps> = ({ SITE_URL }) => {
    return (
        <div className="flex px-[15px] bg-[#26194D] py-20 footer-class">
            <div className="w-full max-w-[1130px] mx-auto text-white text-center">
                <div className="flex justify-center">
                <Link href={`${SITE_URL}`} className="m-auto" style={{
                        width: "166px"
                    }}>
                    <img src="/assets/images/sellout.svg" alt="sellout"  style={{
                        width: "166px",
                        height: "39.605px"
                    }} />
                </Link>
                </div>
                
                <ul className="footer-list w-full justify-center list-none flex gap-8 p-0 flex-col m-0 pt-8 md:flex-row">
                    <li><Link href="/" className="text-white no-underline"><span className="text-[18px] leading-[27px] font-normal">Browse Events</span></Link></li>
                    <li><Link href={`${SITE_URL}/about`} className="text-white no-underline"><span className="text-[18px] leading-[27px] font-normal">About</span></Link></li>
                    <li><Link href='http://help.sellout.io' className="text-white no-underline"><span className="text-[18px] leading-[27px] font-normal">Support</span></Link></li>
                </ul>
                <div className="divide-solid divide-x-2 bg-[#F7F5FF] w-full h-0.5 opacity-15 mt-10 mb-8"></div>
                <div className="flex justify-center gap-6 flex-wrap flex-col md:flex-row">
                    <span className="text-[16px] leading-[24px] font-normal">© 2024 Sellout | All rights reserved.</span>
                    <div className="flex gap-6 justify-center">
                        <Link href={`${SITE_URL}/privacy`}><span className="text-[16px] leading-[24px] font-normal">Privacy Policy</span> </Link>
                        <Link href={`${SITE_URL}/terms`}><span className="text-[16px] leading-[24px] font-normal">Terms of Service</span></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer;