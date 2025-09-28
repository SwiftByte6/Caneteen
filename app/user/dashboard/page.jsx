'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { 
  ShoppingCart, 
  Star,
  Plus,
  Minus,
  Heart,
  Coffee,
  Pizza,
  IceCream,
  Utensils,
  Gift,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react'
import ButtonAnimation from '@/components/ButtonAnimation'
import AchievementProgress from '@/components/AchievementProgress'

export default function UserDashboard() {
  const router = useRouter()
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart || [])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [menuItems, setMenuItems] = useState([])
  const [offers, setOffers] = useState([])

  const categories = [
    { id: 'all', name: 'All Items', icon: Utensils },
    { id: 'snacks', name: 'Snacks', icon: Pizza },
    { id: 'beverages', name: 'Beverages', icon: Coffee },
    { id: 'meals', name: 'Meals', icon: Utensils },
    { id: 'desserts', name: 'Desserts', icon: IceCream },
    { id: 'combos', name: 'Combos', icon: Gift }
  ]

  const featuredItems = [
    {
      id: 1,
      name: 'Chicken Burger',
      price: 299,
      image: '/Burger.png',
      category: 'meals',
      rating: 4.8,
      description: 'Juicy chicken patty with fresh vegetables'
    },
    {
      id: 2,
      name: 'Crispy Fries',
      price: 149,
      image: '/Fries.png',
      category: 'snacks',
      rating: 4.6,
      description: 'Golden crispy french fries'
    },
    {
      id: 3,
      name: 'Fresh Juice',
      price: 99,
      image: '/drink.png',
      category: 'beverages',
      rating: 4.7,
      description: 'Freshly squeezed fruit juice'
    },
    {
      id: 4,
      name: 'Chocolate Cake',
      price: 199,
      image: '/plate.png',
      category: 'desserts',
      rating: 4.9,
      description: 'Rich chocolate cake with cream'
    }
  ]

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/')
          return
        }

        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found or error:', profileError)
          router.push('/')
          return
        }

        const userRole = profile.role?.trim().toLowerCase()
        if (userRole === 'admin') {
          router.push('/admin/dashboard')
          return
        }

        await loadMenuItems()
        await loadOffers()
        setLoading(false)
      } catch (error) {
        console.error('Error checking user access:', error)
        router.push('/')
      }
    }

    checkUserAccess()
  }, [router])

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('Items')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading menu items:', error)
        setMenuItems(featuredItems) // Fallback to mock data
      } else {
        setMenuItems(data || featuredItems)
      }
    } catch (error) {
      console.error('Error loading menu items:', error)
      setMenuItems(featuredItems)
    }
  }

  const loadOffers = async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from('discount_coupons')
          .select(`
            *,
            reward_rules (
              id,
              item_slug,
              required_purchases,
              discount_percent,
              description
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')

        if (!error && data) {
          setOffers(data)
        }
      }
    } catch (error) {
      console.error('Error loading offers:', error)
    }
  }

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      dispatch({
        type: 'cart/updateQuantity',
        payload: { id: item.id, quantity: existingItem.quantity + 1 }
      })
    } else {
      dispatch({
        type: 'cart/addItem',
        payload: { ...item, quantity: 1 }
      })
    }
  }

  const removeFromCart = (itemId) => {
    dispatch({
      type: 'cart/removeItem',
      payload: itemId
    })
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      dispatch({
        type: 'cart/updateQuantity',
        payload: { id: itemId, quantity }
      })
    }
  }

  const getCartQuantity = (itemId) => {
    const item = cart.find(cartItem => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory)

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading delicious menu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Delicious Meals Delivered Fresh Daily
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Experience the finest flavors at our canteen
            </p>
            <button
              onClick={() => router.push('/user/menu')}
              className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-gray-200 hover:border-orange-300 text-gray-600'
                  }`}
                >
                  <IconComponent className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Featured Items */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Featured Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const quantity = getCartQuantity(item.id)
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                      {quantity > 0 ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                            className="bg-orange-100 text-orange-600 p-1 rounded-full hover:bg-orange-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-semibold">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                            className="bg-orange-100 text-orange-600 p-1 rounded-full hover:bg-orange-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Offers & Loyalty Section */}
      {offers.length > 0 && (
        <div className="bg-orange-50 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Your Active Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-center mb-3">
                    <Gift className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{offer.code}</h3>
                  </div>
                  <p className="text-green-600 font-bold text-lg mb-2">
                    {offer.discount_percent}% OFF
                  </p>
                  <p className="text-sm text-gray-600">
                    {offer.reward_rules?.description || 'Discount coupon'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Expires: {new Date(offer.expires_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      {user && (
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <AchievementProgress userId={user.id} />
          </div>
        </div>
      )}

      {/* Floating Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-colors cursor-pointer"
               onClick={() => router.push('/user/cart')}>
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 mr-2" />
              <span className="font-semibold">₹{cartTotal}</span>
              <span className="ml-2 bg-white text-orange-500 rounded-full px-2 py-1 text-xs font-bold">
                {cart.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Canteen App</h3>
              <p className="text-gray-400">
                Delicious meals delivered fresh daily. Experience the finest flavors at our canteen.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-gray-400">info@canteenapp.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-gray-400">123 Food Street, City</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Canteen App. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ButtonAnimation/>
    </div>
  )
}

