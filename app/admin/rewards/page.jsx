'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Trophy,
  Target,
  Percent
} from 'lucide-react'

export default function AdminRewardsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rewardRules, setRewardRules] = useState([])
  const [editingRule, setEditingRule] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    item_slug: '',
    required_purchases: 1,
    discount_percent: 10,
    description: '',
    active: true
  })

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/')
          return
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || profile?.role !== 'admin') {
          router.push('/user/dashboard')
          return
        }

        setUser(user)
        await loadRewardRules()
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/')
      }
    }

    checkUserAndLoadData()
  }, [router])

  const loadRewardRules = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reward_rules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading reward rules:', error)
      } else {
        setRewardRules(data || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading reward rules:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('reward_rules')
          .update(formData)
          .eq('id', editingRule.id)

        if (error) throw error
      } else {
        // Create new rule
        const { error } = await supabase
          .from('reward_rules')
          .insert([formData])

        if (error) throw error
      }

      // Reset form and reload data
      setFormData({
        item_slug: '',
        required_purchases: 1,
        discount_percent: 10,
        description: '',
        active: true
      })
      setEditingRule(null)
      setShowForm(false)
      await loadRewardRules()
    } catch (error) {
      console.error('Error saving reward rule:', error)
      alert('Error saving reward rule. Please try again.')
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData({
      item_slug: rule.item_slug,
      required_purchases: rule.required_purchases,
      discount_percent: rule.discount_percent,
      description: rule.description || '',
      active: rule.active
    })
    setShowForm(true)
  }

  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this reward rule?')) return

    try {
      const { error } = await supabase
        .from('reward_rules')
        .delete()
        .eq('id', ruleId)

      if (error) throw error

      await loadRewardRules()
    } catch (error) {
      console.error('Error deleting reward rule:', error)
      alert('Error deleting reward rule. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({
      item_slug: '',
      required_purchases: 1,
      discount_percent: 10,
      description: '',
      active: true
    })
    setEditingRule(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading reward rules...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-3 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reward Rules Management</h1>
                <p className="text-gray-600">Manage loyalty rewards and discount rules</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {editingRule ? 'Edit Reward Rule' : 'Add New Reward Rule'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Slug
                  </label>
                  <input
                    type="text"
                    value={formData.item_slug}
                    onChange={(e) => setFormData({ ...formData, item_slug: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., burger, fries, drink"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Purchases
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.required_purchases}
                    onChange={(e) => setFormData({ ...formData, required_purchases: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe this reward rule..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingRule ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reward Rules List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reward Rules</h2>
          </div>

          {rewardRules.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reward rules found. Create your first rule to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required Purchases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rewardRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {rule.item_slug.replace('-', ' ')}
                        </div>
                        {rule.description && (
                          <div className="text-sm text-gray-500">{rule.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rule.required_purchases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 mr-1 text-green-600" />
                          {rule.discount_percent}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rule.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="text-red-600 hover:text-red-900"
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
