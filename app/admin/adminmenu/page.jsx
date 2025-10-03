'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Edit, Trash2, Search, DollarSign, Package } from 'lucide-react'

const AdminMenuPage = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        slug: '',
        available: true,
        image_url: ''
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploading, setUploading] = useState(false)

    const categories = ['all', 'burger', 'pizza', 'drink', 'dessert', 'snack']

    const uploadImage = async (file) => {
        if (!file) return null
        
        try {
            setUploading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `menu-items/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath)

            return data.publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        } finally {
            setUploading(false)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const getAllItems = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const { data, error } = await supabase
                .from('Items')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) {
                throw error
            }
            
            setItems(data || [])
            console.log('Fetched items:', data)
        } catch (err) {
            console.error('Error fetching items:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddItem = async (e) => {
        e.preventDefault()
        try {
            let imageUrl = formData.image_url
            
            // Upload image if file is selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile)
            }

            const { data, error } = await supabase
                .from('Items')
                .insert([{
                    ...formData,
                    price: parseFloat(formData.price),
                    slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
                    image_url: imageUrl
                }])
                .select()

            if (error) throw error

            setItems(prev => [data[0], ...prev])
            setShowAddForm(false)
            resetForm()
        } catch (err) {
            console.error('Error adding item:', err)
            setError(err.message)
        }
    }

    const handleUpdateItem = async (e) => {
        e.preventDefault()
        try {
            let imageUrl = formData.image_url
            
            // Upload new image if file is selected
            if (imageFile) {
                imageUrl = await uploadImage(imageFile)
            }

            const { data, error } = await supabase
                .from('Items')
                .update({
                    ...formData,
                    price: parseFloat(formData.price),
                    image_url: imageUrl
                })
                .eq('id', editingItem.id)
                .select()

            if (error) throw error

            setItems(prev => prev.map(item => 
                item.id === editingItem.id ? data[0] : item
            ))
            setEditingItem(null)
            resetForm()
        } catch (err) {
            console.error('Error updating item:', err)
            setError(err.message)
        }
    }

    const handleDeleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const { error } = await supabase
                .from('Items')
                .delete()
                .eq('id', id)

            if (error) throw error

            setItems(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            console.error('Error deleting item:', err)
            setError(err.message)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            slug: '',
            available: true,
            image_url: ''
        })
        setImageFile(null)
        setImagePreview('')
    }

    const startEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            category: item.category || '',
            slug: item.slug || '',
            available: item.available,
            image_url: item.image_url || ''
        })
        setImageFile(null)
        setImagePreview(item.image_url || '')
        setShowAddForm(true)
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    useEffect(() => {
        getAllItems()
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Menu Management</h1>
                    <p className="text-gray-600">Manage your canteen menu items</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(true)
                        setEditingItem(null)
                        resetForm()
                    }}
                    className="mt-4 md:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add New Item</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    Error: {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        {/* Item Image */}
                        {item.image_url && (
                            <div className="w-full h-48 overflow-hidden rounded-t-lg">
                                <img 
                                    src={item.image_url} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    item.available 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                            
                            {item.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <DollarSign size={16} className="text-green-600" />
                                    <span className="text-lg font-bold text-green-600">
                                        ${item.price}
                                    </span>
                                </div>
                                {item.category && (
                                    <div className="flex items-center space-x-1">
                                        <Package size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-500 capitalize">
                                            {item.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => startEdit(item)}
                                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                                >
                                    <Edit size={16} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                                >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-500">
                        {searchTerm || selectedCategory !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'Get started by adding your first menu item'
                        }
                    </p>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>
                        
                        <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="w-32 h-32 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
                                {uploading && (
                                    <div className="mt-2 text-sm text-blue-600">
                                        Uploading image...
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">Select Category</option>
                                    {categories.slice(1).map(category => (
                                        <option key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    placeholder="Auto-generated from name if empty"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={formData.available}
                                    onChange={(e) => setFormData({...formData, available: e.target.checked})}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                                    Available for order
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setEditingItem(null)
                                        resetForm()
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Add'} Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminMenuPage
