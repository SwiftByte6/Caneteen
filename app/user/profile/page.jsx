'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  Bell,
  Heart,
  Settings,
  ChefHat,
  Star,
  Award,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react'

export default function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/')
          return
        }

        setUser(user)

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
          // Create default profile if doesn't exist
          setProfile({
            id: user.id,
            email: user.email,
            full_name: '',
            phone: '',
            address: '',
            preferences: {},
            created_at: user.created_at
          })
        } else {
          setProfile(profileData)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading profile:', error)
        router.push('/')
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  const handleEditStart = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    })
    setEditing(true)
  }

  const handleEditCancel = () => {
    setEditing(false)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setProfile(prev => ({
        ...prev,
        full_name: editForm.full_name,
        phone: editForm.phone,
        address: editForm.address
      }))

      setEditing(false)
      setEditForm({})
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    }
    setSaving(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Header Section */}
        <div className="relative mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-orange-500 rounded-3xl"></div>
          <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
          <div className="absolute inset-0 backdrop-blur-sm rounded-3xl"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 text-white/30">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="absolute bottom-4 left-4 text-white/20">
            <Star className="h-6 w-6" />
          </div>
          
          {/* Content */}
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  {getInitials(profile?.full_name, user?.email)}
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left text-white flex-1">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  {profile?.full_name || 'Welcome Back!'}
                </h1>
                <p className="text-xl text-white/90 mb-4">{user?.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm text-white/80">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user?.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Food Enthusiast</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {editing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditStart}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center space-x-1 mb-8 bg-white/50 backdrop-blur-md rounded-2xl p-2 shadow-lg">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'preferences', label: 'Preferences', icon: Heart },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-white/70'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Contact Information */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-600" />
                  Contact Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                    <Mail className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-800 font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-orange-100 rounded-xl">
                    <User className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                          className="w-full mt-1 px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-gray-800 font-medium">{profile?.full_name || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-orange-200 rounded-xl">
                    <Phone className="h-5 w-5 text-orange-700 flex-shrink-0" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600">Phone Number</label>
                      {editing ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full mt-1 px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <p className="text-gray-800 font-medium">{profile?.phone || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-orange-300 rounded-xl">
                    <MapPin className="h-5 w-5 text-orange-800 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      {editing ? (
                        <textarea
                          value={editForm.address}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          rows={3}
                          className="w-full mt-1 px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          placeholder="Enter your address"
                        />
                      ) : (
                        <p className="text-gray-800 font-medium">{profile?.address || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <ChefHat className="h-5 w-5 mr-2 text-orange-600" />
                  Account Overview
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-400 p-4 rounded-xl text-white text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm opacity-90">Total Orders</div>
                  </div>
                  <div className="bg-orange-500 p-4 rounded-xl text-white text-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-sm opacity-90">Favorites</div>
                  </div>
                  <div className="bg-orange-600 p-4 rounded-xl text-white text-center">
                    <div className="text-2xl font-bold">₹2,450</div>
                    <div className="text-sm opacity-90">Total Spent</div>
                  </div>
                  <div className="bg-orange-700 p-4 rounded-xl text-white text-center">
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-sm opacity-90">Avg Rating</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm text-gray-600">{formatDate(user?.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Account Status</span>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Loyalty Level</span>
                    <span className="text-sm text-orange-600 font-medium">Gold Member</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content placeholders */}
          {activeTab === 'preferences' && (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 text-center">
              <Heart className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Preferences</h3>
              <p className="text-gray-600">Customize your food preferences and dietary restrictions.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 text-center">
              <Shield className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Security Settings</h3>
              <p className="text-gray-600">Manage your password and security preferences.</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 text-center">
              <Bell className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Notifications</h3>
              <p className="text-gray-600">Control how and when you receive notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}