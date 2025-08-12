'use client'
import Link from "next/link";
import { FiShoppingCart, FiUser, FiList, FiClock } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function Navbar() {

  const cartData=useSelector((state)=>state.cart)
  return (
    <header className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-white text-indigo-700 font-bold px-3 py-1 rounded">
            LOGO
          </div>
          <span className="text-xl font-semibold">Canteen App</span>
        </div>

        {/* Center: Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/user/menu" className="hover:text-gray-200">
            Menu
          </Link>
          <Link href="/user/orders" className="hover:text-gray-200">
            Orders
          </Link>
          <Link href="/user/history" className="hover:text-gray-200">
            History
          </Link>
        </nav>

        {/* Right: Icons */}
        <div className="flex items-center space-x-4">
          <Link href="/user/cart" className="relative hover:text-gray-200">
            <FiShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
              {cartData.length}
            </span>
          </Link>
          <Link href="/user/profile" className="hover:text-gray-200">
            <FiUser size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
