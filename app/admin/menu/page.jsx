'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Package,
  DollarSign,
  Tag,
  FileText,
  Image as ImageIcon,
  ChefHat,
  Star,
  Eye,
  Filter
} from 'lucide-react'

export default function AdminMenuManagement() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState(['Burgers', 'Pizza', 'Pasta', 'Beverages', 'Desserts'])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingItem, setEditingItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true
  })

  useEffect(() => {
    checkAdminAccess()
    loadMenuItems()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || profile?.role?.toLowerCase() !== 'admin') {
        router.push('/user/dashboard')
        return
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/')
    }
  }

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual Supabase query
      const mockItems = [
        {
          id: 1,
          name: 'Cheese Burger',
          description: 'Juicy beef patty with cheese, lettuce, and tomato',
          price: 89.99,
          category: 'Burgers',
          image_url: '/burger.jpg',
          available: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce, mozzarella, and basil',
          price: 199.99,
          category: 'Pizza',
          image_url: '/pizza.jpg',
          available: true,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Pasta Carbonara',
          description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
          price: 149.99,
          category: 'Pasta',
          image_url: '/pasta.jpg',
          available: false,
          created_at: new Date().toISOString()
        }
      ]
      setMenuItems(mockItems)
    } catch (error) {
      console.error('Error loading menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      const itemToAdd = {
        ...newItem,
        price: parseFloat(newItem.price),
        id: Date.now(), // In real app, this would be handled by Supabase
        created_at: new Date().toISOString()
      }

      setMenuItems(prev => [itemToAdd, ...prev])
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        available: true
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleUpdateItem = async (id, updatedData) => {
    try {
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, ...updatedData, price: parseFloat(updatedData.price) }
            : item
        )
      )
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setMenuItems(prev => prev.filter(item => item.id !== id))
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const toggleAvailability = async (id, available) => {
    try {
      setMenuItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, available } : item
        )
      )
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="h-8 w-8 animate-pulse text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading menu items...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <ChefHat className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-gray-600">Add, edit, and manage your menu items</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menuItems.filter(item => item.available).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unavailable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menuItems.filter(item => !item.available).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-600">
              {searchQuery || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by adding your first menu item.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Item Image */}
                <div className="h-48 bg-gray-100 relative">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  
                  {/* Availability Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                    item.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  {editingItem === item.id ? (
                    <EditForm 
                      item={item}
                      categories={categories}
                      onSave={(updatedData) => handleUpdateItem(item.id, updatedData)}
                      onCancel={() => setEditingItem(null)}
                    />
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <span className="text-xl font-bold text-orange-600">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => toggleAvailability(item.id, !item.available)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            item.available
                              ? 'bg-gray-500 hover:bg-gray-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {item.available ? 'Hide' : 'Show'}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Menu Item</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <AddItemForm
                item={newItem}
                categories={categories}
                onChange={setNewItem}
                onSave={handleAddItem}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Edit Form Component
function EditForm({ item, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    category: item.category,
    image_url: item.image_url
  })

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        placeholder="Item name"
      />
      
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        rows={2}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none"
        placeholder="Description"
      />
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          placeholder="Price"
        />
        
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onSave(formData)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Add Item Form Component
function AddItemForm({ item, categories, onChange, onSave, onCancel }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onChange({...item, name: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter item name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={item.description}
          onChange={(e) => onChange({...item, description: e.target.value})}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          placeholder="Enter item description"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={item.price}
            onChange={(e) => onChange({...item, price: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={item.category}
            onChange={(e) => onChange({...item, category: e.target.value})}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
        <input
          type="url"
          value={item.image_url}
          onChange={(e) => onChange({...item, image_url: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="available"
          checked={item.available}
          onChange={(e) => onChange({...item, available: e.target.checked})}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="available" className="ml-2 text-sm text-gray-700">
          Available for ordering
        </label>
      </div>
      
      <div className="flex space-x-4 pt-4">
        <button
          onClick={onSave}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Add Item
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}