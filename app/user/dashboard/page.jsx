'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import {
  Utensils, Pizza, Coffee, IceCream, Gift
} from 'lucide-react'
import Image from 'next/image'

import { addCart } from '@/redux/slice'
import ButtonAnimation from '@/components/ButtonAnimation'

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
      image_url: '/Burger.png',
      category: 'meals',
      rating: 4.8,
      description: 'Juicy chicken patty with fresh vegetables',
      available: true
    },
    {
      id: 2,
      name: 'Crispy Fries',
      price: 149,
      image_url: '/Fries.png',
      category: 'snacks',
      rating: 4.6,
      description: 'Golden crispy french fries',
      available: true
    },
    {
      id: 3,
      name: 'Fresh Juice',
      price: 99,
      image_url: '/drink.png',
      category: 'beverages',
      rating: 4.7,
      description: 'Freshly squeezed fruit juice',
      available: true
    },
    {
      id: 4,
      name: 'Chocolate Cake',
      price: 199,
      image_url: '/plate.png',
      category: 'desserts',
      rating: 4.9,
      description: 'Rich chocolate cake with cream',
      available: true
    }
  ]

  const sendData = (item) => {
    dispatch(addCart(item))
    console.log(cart)
  }

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) return router.push('/')

        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) return router.push('/')

        const userRole = profile.role?.trim().toLowerCase()
        if (userRole === 'admin') return router.push('/admin/dashboard')

        await loadMenuItems()
        await loadOffers()
        setLoading(false)
      } catch (error) {
        console.error(error)
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

      if (error || !data) {
        setMenuItems(featuredItems)
      } else {
        setMenuItems(data)
      }
    } catch (err) {
      console.error(err)
      setMenuItems(featuredItems)
    }
  }

  const loadOffers = async () => {
    if (!user) return

    try {
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

      if (!error && data) setOffers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)

  const getCartQuantity = (id) => {
    const item = cart.find(c => c.id === id)
    return item ? item.quantity : 0
  }

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

      {/* Hero Image */}
      <div className="relative md:w-[90vw] mx-auto aspect-[1440/744] md:px-4">
        <Image
          src="/21.png"
          alt="Navratri Special Offer Banner"
          fill
          className="object-cover md:object-contain"
          priority
        />
      </div>

      {/* Categories */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${selectedCategory === cat.id
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 hover:border-orange-300 text-gray-600'
                    }`}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{cat.name}</span>
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
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg"
                >
                  {/* Image with Hover Zoom */}
                  <div className="relative h-[350px] bg-gray-200 group overflow-hidden">
                    <Image
                      src={item.image_url || '/fallback.png'}
                      alt={item.name || 'Food item'}
                      fill
                      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-grow p-4">
                    <div className="flex-grow">
                      <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                      <p className="mt-1 text-sm text-gray-400">Category: {item.category}</p>
                      <p className="mt-2 font-bold text-green-600">₹{item.price}</p>
                    </div>

                    <div className="my-3">
                      {item.available ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="mt-auto mx-auto md:w-[70%]">
                      <ButtonAnimation
                        onAddToCart={sendData}
                        item={item}
                        disabled={!item.available}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
