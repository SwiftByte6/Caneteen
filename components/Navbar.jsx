'use client'
import Link from "next/link";
import { useState } from "react";
import { 
  FiShoppingCart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiHome, 
  FiList, 
  FiClock, 
  FiGift,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiCheckCircle
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const cartData = useSelector((state) => state.cart);

  const navigationItems = [
    { href: "/user/dashboard", label: "Home", icon: FiHome },
    { href: "/user/menu", label: "Menu", icon: FiList },
    { href: "/user/cart", label: "Cart", icon: FiShoppingCart },
    { href: "/user/orders", label: "Orders", icon: FiClock },
    { href: "/user/history", label: "History", icon: FiCheckCircle },
    { href: "/user/rewards", label: "Rewards", icon: FiGift },
    { href: "/user/profile", label: "Profile", icon: FiUser },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white text-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => {
              router.push('/user/dashboard');
              closeMenu();
            }}
            className="flex items-center cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="flex-shrink-0">
              <Image
                src="/LogoCan.png"
                height={120}
                width={120}
                alt="Caneteen Logo"
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.slice(1, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group flex items-center space-x-1"
              >
                <item.icon size={18} className="opacity-75" />
                <span>{item.label}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon - Always visible with counter */}
            <Link 
              href="/user/cart" 
              className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors duration-200 hover:bg-orange-50 rounded-lg group"
            >
              <FiShoppingCart size={22} />
              {cartData.length > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartData.length}
                </motion.span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Cart ({cartData.length})
              </span>
            </Link>

            {/* Profile Icon - Desktop */}
            <Link 
              href="/user/profile" 
              className="hidden md:block p-2 text-gray-700 hover:text-orange-500 transition-colors duration-200 hover:bg-orange-50 rounded-lg group relative"
            >
              <FiUser size={22} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Profile
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors duration-200 hover:bg-orange-50 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Navigation
                </div>
                
                {navigationItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center px-3 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 group"
                      >
                        <IconComponent className="mr-3 h-5 w-5 group-hover:text-orange-500" />
                        <span className="font-medium">{item.label}</span>
                        {item.href === '/user/cart' && cartData.length > 0 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartData.length}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>
                
                {/* Additional Actions */}
                <div className="px-3 py-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Account
                </div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navigationItems.length + 1) * 0.1 }}
                >
                  <button
                    onClick={() => {
                      // Add logout functionality here
                      closeMenu();
                    }}
                    className="flex items-center w-full px-3 py-3 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  >
                    <FiLogOut className="mr-3 h-5 w-5 group-hover:text-red-500" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0  bg-opacity-25 z-40 md:hidden"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
