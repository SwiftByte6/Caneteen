'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  Utensils,
  Heart
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" }
  ]

  const quickLinks = [
    { name: "Menu", href: "/user/menu" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Orders", href: "/user/orders" },
    { name: "Rewards", href: "/user/rewards" }
  ]

  const contactInfo = [
    { icon: Phone, text: "+1 (555) 123-4567" },
    { icon: Mail, text: "hello@caneteen.com" },
    { icon: MapPin, text: "123 University Ave, Campus City" },
    { icon: Clock, text: "Mon-Fri: 7AM-9PM, Sat-Sun: 8AM-8PM" }
  ]

  return (
    <motion.footer 
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
                <Utensils size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Caneteen
              </h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Your favorite campus dining destination. Fresh, delicious meals prepared with love and served with a smile.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="bg-gray-800 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 p-2 rounded-lg transition-all duration-300 group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <social.icon size={18} className="group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start space-x-3 text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg mt-0.5">
                    <info.icon size={14} className="text-white" />
                  </div>
                  <span className="text-sm leading-relaxed">{info.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-white">Stay Updated</h4>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to get notifications about new menu items and special offers!
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <motion.button
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <motion.div 
        className="border-t border-gray-800 bg-gray-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>&copy; {currentYear} Caneteen. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-red-500 animate-pulse" />
              <span>for hungry students</span>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.footer>
  )
}

export default Footer