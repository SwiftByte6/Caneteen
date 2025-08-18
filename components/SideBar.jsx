'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { BsFillFileBarGraphFill } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { BiSolidFoodMenu } from "react-icons/bi";
import { FiMenu } from "react-icons/fi";
import { useRouter } from 'next/navigation';

const SideBar = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true); // toggle state for mobile

    const dashBoardItems = [
        { Icon: BsFillFileBarGraphFill, name: "Dashboard", route: "/admin/dashboard" },
        { Icon: FaShoppingCart, name: "Food Orders", route: "/admin/live_orders" },
        { Icon: BiSolidFoodMenu, name: "Manage Menu", route: "/admin/adminmenu" },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md bg-orange-500 text-white shadow-lg"
                >
                    <FiMenu size={24} />
                </button>
            </div>

            <aside className={` h-screen bg-orange-500/20 border-r-2 border-orange-400 rounded-r-3xl p-4
                transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-[20vw] w-64`}>
                
                {/* Logo */}
                <div className='flex justify-center md:justify-start mb-8 border-b-2 border-orange-300 pb-4'>
                    <Image src={'/Logo.png'} width={80} height={80} alt="Logo"/>
                </div>

                {/* Menu Items */}
                <ul className='space-y-6'>
                    {dashBoardItems.map((item, i) => (
                        <li 
                            key={i} 
                            onClick={() => router.push(item.route)} 
                            className='flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-orange-200 transition-colors'>
                            <item.Icon className="text-2xl text-orange-900"/>
                            <span className="text-xl font-medium text-orange-900 hidden md:inline">{item.name}</span>
                        </li>
                    ))}
                </ul>

                {/* Other Section */}
                <div className='mt-12 text-orange-900 hidden md:block'>
                    <h3 className='text-lg font-semibold mb-2'>Others</h3>
                    <ul className='space-y-2'>
                        <li className='hover:text-orange-700 cursor-pointer'>Settings</li>
                        <li className='hover:text-orange-700 cursor-pointer'>Payment</li>
                        <li className='hover:text-orange-700 cursor-pointer'>Account</li>
                        <li className='hover:text-orange-700 cursor-pointer'>Help</li>
                    </ul>
                </div>
            </aside>
        </>
    );
}

export default SideBar;
