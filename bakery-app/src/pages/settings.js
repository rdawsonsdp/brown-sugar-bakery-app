import { useState, useEffect } from 'react'
import {
  CogIcon,
  BuildingStorefrontIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const SettingCard = ({ title, description, icon: Icon, children }) => (
  <div className="card-bakery p-6">
    <div className="flex items-center mb-4">
      <Icon className="w-5 h-5 text-bakery-500 mr-2" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    {children}
  </div>
)

export default function Settings() {
  const [settings, setSettings] = useState({
    // Business Information
    businessName: 'Brown Sugar Bakery',
    address: '328 E 75th St, Chicago, IL 60619',
    phone: '(773) 224-6804',
    email: 'info@brownsugar-bakery.com',
    website: 'https://brownsugar-bakery.com',
    
    // Operating Hours
    hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '08:00', close: '19:00', closed: false },
      sunday: { open: '10:00', close: '17:00', closed: false }
    },
    
    // Order Settings
    defaultOrderType: 'In-Store',
    requirePickupTime: true,
    allowAdvanceOrders: true,
    maxAdvanceDays: 30,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    newOrderAlerts: true,
    lowInventoryAlerts: true,
    
    // Payment Settings
    taxRate: 8.25,
    currency: 'USD',
    acceptCash: true,
    acceptCard: true,
    acceptDigital: true,
    
    // System Settings
    timezone: 'America/Chicago',
    dateFormat: 'MM/DD/YYYY',
    theme: 'bakery'
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save settings to localStorage for now
      localStorage.setItem('bakery-settings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('bakery-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your bakery application preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {saved && (
            <span className="text-green-600 text-sm font-medium">Settings saved!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-bakery disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Business Information */}
      <SettingCard
        title="Business Information"
        description="Update your bakery's basic information"
        icon={BuildingStorefrontIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => updateSetting('businessName', e.target.value)}
              className="input-bakery"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => updateSetting('phone', e.target.value)}
              className="input-bakery"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
              className="input-bakery"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => updateSetting('website', e.target.value)}
              className="input-bakery"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              className="input-bakery"
            />
          </div>
        </div>
      </SettingCard>

      {/* Operating Hours */}
      <SettingCard
        title="Operating Hours"
        description="Set your bakery's open hours for each day"
        icon={ClockIcon}
      >
        <div className="space-y-4">
          {Object.entries(settings.hours).map(([day, hours]) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700">
                  {dayNames[day]}
                </span>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => updateSetting(`hours.${day}.closed`, !e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Open</span>
              </label>
              {!hours.closed && (
                <>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateSetting(`hours.${day}.open`, e.target.value)}
                      className="input-bakery w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateSetting(`hours.${day}.close`, e.target.value)}
                      className="input-bakery w-32"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Order Settings */}
      <SettingCard
        title="Order Settings"
        description="Configure how orders are handled"
        icon={DocumentTextIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Order Type
            </label>
            <select
              value={settings.defaultOrderType}
              onChange={(e) => updateSetting('defaultOrderType', e.target.value)}
              className="input-bakery"
            >
              <option value="In-Store">In-Store</option>
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Advance Order Days
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={settings.maxAdvanceDays}
              onChange={(e) => updateSetting('maxAdvanceDays', parseInt(e.target.value))}
              className="input-bakery"
            />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.requirePickupTime}
              onChange={(e) => updateSetting('requirePickupTime', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Require pickup time for all orders</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.allowAdvanceOrders}
              onChange={(e) => updateSetting('allowAdvanceOrders', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Allow advance orders</span>
          </label>
        </div>
      </SettingCard>

      {/* Payment Settings */}
      <SettingCard
        title="Payment & Pricing"
        description="Configure payment methods and tax settings"
        icon={CurrencyDollarIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="50"
              value={settings.taxRate}
              onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value))}
              className="input-bakery"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => updateSetting('currency', e.target.value)}
              className="input-bakery"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</p>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.acceptCash}
                onChange={(e) => updateSetting('acceptCash', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Cash</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.acceptCard}
                onChange={(e) => updateSetting('acceptCard', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Credit/Debit Cards</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.acceptDigital}
                onChange={(e) => updateSetting('acceptDigital', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Digital Payments (Apple Pay, Google Pay)</span>
            </label>
          </div>
        </div>
      </SettingCard>

      {/* Notification Settings */}
      <SettingCard
        title="Notifications"
        description="Manage alert preferences and notifications"
        icon={BellIcon}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Notification Methods</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">SMS notifications</span>
              </label>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Alert Types</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.newOrderAlerts}
                  onChange={(e) => updateSetting('newOrderAlerts', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">New order alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.lowInventoryAlerts}
                  onChange={(e) => updateSetting('lowInventoryAlerts', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Low inventory alerts</span>
              </label>
            </div>
          </div>
        </div>
      </SettingCard>

      {/* System Settings */}
      <SettingCard
        title="System Preferences"
        description="Configure system-wide settings and preferences"
        icon={CogIcon}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="input-bakery"
            >
              <option value="America/Chicago">Central Time (Chicago)</option>
              <option value="America/New_York">Eastern Time (New York)</option>
              <option value="America/Denver">Mountain Time (Denver)</option>
              <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="input-bakery"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </SettingCard>
    </div>
  )
}