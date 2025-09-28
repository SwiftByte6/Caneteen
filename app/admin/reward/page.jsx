'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Gift, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Percent,
  Tag,
  FileText,
  Target,

} from 'lucide-react'

import { ToggleLeft } from 'lucide-react'

const RewardManagement = () => {
  const [rewardRules, setRewardRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [formData, setFormData] = useState({
    item_slug: '',
    required_purchases: '',
    discount_percent: '',
    description: '',
    active: true
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })

  // Fetch reward rules on component mount
  useEffect(() => {
    fetchRewardRules()
  }, [])

  const fetchRewardRules = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reward_rules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRewardRules(data || [])
    } catch (error) {
      console.error('Error fetching reward rules:', error)
      setMessage({ type: 'error', text: 'Failed to fetch reward rules' })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.item_slug.trim()) {
      newErrors.item_slug = 'Item slug is required'
    }

    if (!formData.required_purchases || formData.required_purchases < 1) {
      newErrors.required_purchases = 'Required purchases must be at least 1'
    }

    if (!formData.discount_percent || formData.discount_percent < 0 || formData.discount_percent > 100) {
      newErrors.discount_percent = 'Discount percent must be between 0 and 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const dataToSubmit = {
        ...formData,
        required_purchases: parseInt(formData.required_purchases),
        discount_percent: parseFloat(formData.discount_percent)
      }

      let result
      if (editingRule) {
        result = await supabase
          .from('reward_rules')
          .update(dataToSubmit)
          .eq('id', editingRule.id)
      } else {
        result = await supabase
          .from('reward_rules')
          .insert([dataToSubmit])
      }

      if (result.error) throw result.error

      setMessage({ 
        type: 'success', 
        text: editingRule ? 'Reward rule updated successfully!' : 'Reward rule created successfully!' 
      })
      
      resetForm()
      fetchRewardRules()
    } catch (error) {
      console.error('Error saving reward rule:', error)
      setMessage({ type: 'error', text: 'Failed to save reward rule' })
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData({
      item_slug: rule.item_slug,
      required_purchases: rule.required_purchases.toString(),
      discount_percent: rule.discount_percent.toString(),
      description: rule.description || '',
      active: rule.active
    })
    setShowForm(true)
    setErrors({})
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reward rule?')) return

    try {
      const { error } = await supabase
        .from('reward_rules')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Reward rule deleted successfully!' })
      fetchRewardRules()
    } catch (error) {
      console.error('Error deleting reward rule:', error)
      setMessage({ type: 'error', text: 'Failed to delete reward rule' })
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('reward_rules')
        .update({ active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: `Reward rule ${!currentStatus ? 'activated' : 'deactivated'} successfully!` 
      })
      fetchRewardRules()
    } catch (error) {
      console.error('Error toggling reward rule status:', error)
      setMessage({ type: 'error', text: 'Failed to update reward rule status' })
    }
  }

  const resetForm = () => {
    setFormData({
      item_slug: '',
      required_purchases: '',
      discount_percent: '',
      description: '',
      active: true
    })
    setEditingRule(null)
    setShowForm(false)
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reward rules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Gift className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reward Rules Management</h1>
                <p className="text-gray-600">Create and manage customer reward criteria</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Rule</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRule ? 'Edit Reward Rule' : 'Create New Reward Rule'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Slug */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="h-4 w-4" />
                    <span>Item Slug *</span>
                  </label>
                  <input
                    type="text"
                    name="item_slug"
                    value={formData.item_slug}
                    onChange={handleInputChange}
                    placeholder="e.g., burger-combo, pizza-special"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.item_slug ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.item_slug && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.item_slug}
                    </p>
                  )}
                </div>

                {/* Required Purchases */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Target className="h-4 w-4" />
                    <span>Required Purchases *</span>
                  </label>
                  <input
                    type="number"
                    name="required_purchases"
                    value={formData.required_purchases}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g., 5"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.required_purchases ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.required_purchases && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.required_purchases}
                    </p>
                  )}
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Percent className="h-4 w-4" />
                    <span>Discount Percentage *</span>
                  </label>
                  <input
                    type="number"
                    name="discount_percent"
                    value={formData.discount_percent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g., 15.50"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors.discount_percent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.discount_percent && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.discount_percent}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4" />
                    <span>Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Optional description of the reward rule..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <ToggleLeft className="h-5 w-5 text-gray-600" />
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingRule ? 'Update Rule' : 'Create Rule'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reward Rules List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Existing Reward Rules</h2>
            <p className="text-gray-600 text-sm mt-1">Manage all reward criteria and their settings</p>
          </div>

          {rewardRules.length === 0 ? (
            <div className="p-12 text-center">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reward Rules Found</h3>
              <p className="text-gray-600 mb-6">Create your first reward rule to start incentivizing customer loyalty.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Create First Rule</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Item Slug
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Required Purchases
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Discount %
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rewardRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{rule.item_slug}</span>
                        </div>
                        {rule.description && (
                          <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-900">{rule.required_purchases}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4 text-green-500" />
                          <span className="text-gray-900">{rule.discount_percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(rule.id, rule.active)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            rule.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          {rule.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit Rule"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RewardManagement
