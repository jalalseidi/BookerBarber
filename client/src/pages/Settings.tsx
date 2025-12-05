import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../components/ui/theme-provider';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Globe, Bell, Palette, Monitor, Sun, Moon, AlertCircle, CheckCircle, X, Phone, Mail } from 'lucide-react';
import api from '../api/api';

interface SettingsData {
  language: string;
  theme: string;
  // Notification preferences
  primaryChannel: 'email' | 'sms';
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  bookingCancellations: boolean;
  bookingChanges: boolean;
  // For barbers only
  newBookingRequests: boolean;
  dailySummary: boolean;
  newReviews: boolean;
  // Reminder timing
  reminderTiming: {
    twentyFourHours: boolean;
    twoHours: boolean;
  };
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'barber';
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<'general' | 'notifications'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SettingsData>({
    language: i18n.language,
    theme: theme || 'system',
    primaryChannel: 'email',
    bookingConfirmations: true,
    bookingReminders: true,
    bookingCancellations: true,
    bookingChanges: true,
    newBookingRequests: true,
    dailySummary: true,
    newReviews: true,
    reminderTiming: {
      twentyFourHours: true,
      twoHours: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileResponse = await api.get('/api/auth/profile');
      setUserProfile(profileResponse.data.profile);
      
      // Load notification settings
      const settingsResponse = await api.get('/api/auth/settings');
      const loadedSettings = settingsResponse.data.settings;
      
      setSettings({
        ...loadedSettings,
        language: i18n.language,
        theme: theme || 'system'
      });
    } catch (err) {
      setError(t('common.failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.put('/api/auth/settings', settings);
      
      setSuccess(t('settings.settingsSaved'));
      setTimeout(() => setSuccess(null), 3000);
      
      // Apply language change
      if (settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
      }
      
      // Apply theme change
      if (settings.theme !== theme) {
        setTheme(settings.theme as 'light' | 'dark' | 'system');
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSettings({ ...settings, language: newLanguage });
    i18n.changeLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: string) => {
    setSettings({ ...settings, theme: newTheme });
    setTheme(newTheme as 'light' | 'dark' | 'system');
  };

  if (loading && !settings.language) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-destructive/15 border border-destructive/30 text-destructive px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:text-destructive/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-700 hover:text-green-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'general', label: t('settings.general'), icon: SettingsIcon },
            { key: 'notifications', label: t('settings.notifications'), icon: Bell }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'general' && (
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">{t('settings.general')}</h2>
            
            <div className="space-y-6">
              {/* Language Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <Globe className="w-5 h-5 text-foreground mr-2" />
                  <h3 className="text-lg font-medium text-foreground">{t('settings.language')}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{t('profile.preferredLanguage')}</p>
                
                <select
                  value={settings.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                >
                  <option value="tr">{t('profile.turkish')}</option>
                  <option value="en">{t('profile.english')}</option>
                </select>
              </div>

              {/* Theme Settings */}
              <div>
                <div className="flex items-center mb-2">
                  <Palette className="w-5 h-5 text-foreground mr-2" />
                  <h3 className="text-lg font-medium text-foreground">{t('settings.theme')}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{t('settings.chooseTheme')}</p>
                
                <div className="grid grid-cols-3 gap-4 max-w-md">
                  {[
                    { key: 'light', label: t('settings.light'), icon: Sun },
                    { key: 'dark', label: t('settings.dark'), icon: Moon },
                    { key: 'system', label: t('settings.system'), icon: Monitor }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className={`${
                        settings.theme === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-input bg-card text-foreground hover:bg-accent'
                      } border-2 rounded-lg p-4 flex flex-col items-center space-y-2 transition-colors`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">{t('settings.notifications')}</h2>
            
            <div className="space-y-8">
              {/* Notification Channel Selection */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Primary Notification Channel</h3>
                <p className="text-muted-foreground mb-4">Choose how you'd like to receive notifications (in-app notifications are always enabled)</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => setSettings({ ...settings, primaryChannel: 'email' })}
                    className={`${
                      settings.primaryChannel === 'email'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-input bg-card text-foreground hover:bg-accent'
                    } border-2 rounded-lg p-4 flex flex-col items-center space-y-2 transition-colors`}
                  >
                    <Mail className="w-6 h-6" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (userProfile?.phone) {
                        setSettings({ ...settings, primaryChannel: 'sms' });
                      } else {
                        setError('Please add your phone number in your profile to enable SMS notifications.');
                        setTimeout(() => setError(null), 5000);
                      }
                    }}
                    disabled={!userProfile?.phone}
                    className={`${
                      settings.primaryChannel === 'sms' && userProfile?.phone
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : !userProfile?.phone
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-input bg-card text-foreground hover:bg-accent'
                    } border-2 rounded-lg p-4 flex flex-col items-center space-y-2 transition-colors relative`}
                  >
                    <Phone className="w-6 h-6" />
                    <span className="text-sm font-medium">SMS</span>
                    {!userProfile?.phone && (
                      <span className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Phone required
                      </span>
                    )}
                  </button>
                </div>
                
                {!userProfile?.phone && settings.primaryChannel === 'sms' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      SMS notifications require a phone number. Please update your profile to add your phone number.
                    </p>
                  </div>
                )}
              </div>

              {/* Notification Types */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Notification Types</h3>
                <div className="space-y-4">
                  {[
                    { key: 'bookingConfirmations', label: 'Booking Confirmations', description: 'Get notified when your booking is confirmed' },
                    { key: 'bookingReminders', label: 'Appointment Reminders', description: 'Receive reminders before your appointments' },
                    { key: 'bookingCancellations', label: 'Booking Cancellations', description: 'Get notified if your appointment is cancelled' },
                    { key: 'bookingChanges', label: 'Booking Changes', description: 'Get notified when appointment details change' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <span className="text-foreground font-medium">{label}</span>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={settings[key as keyof SettingsData] as boolean}
                          onChange={(e) => setSettings({
                            ...settings,
                            [key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barber-specific notifications */}
              {userProfile?.role === 'barber' && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Barber Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'newBookingRequests', label: 'New Booking Requests', description: 'Get notified when customers book appointments' },
                      { key: 'dailySummary', label: 'Daily Summary', description: 'Receive a summary of tomorrow\'s appointments' },
                      { key: 'newReviews', label: 'New Reviews', description: 'Get notified when customers leave reviews' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-foreground font-medium">{label}</span>
                          <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={settings[key as keyof SettingsData] as boolean}
                            onChange={(e) => setSettings({
                              ...settings,
                              [key]: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder Timing */}
              {settings.bookingReminders && (
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">Reminder Timing</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'twentyFourHours', label: '24 Hours Before', description: 'Send reminder 1 day before appointment' },
                      { key: 'twoHours', label: '2 Hours Before', description: 'Send reminder 2 hours before appointment' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-foreground font-medium">{label}</span>
                          <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={settings.reminderTiming[key as keyof typeof settings.reminderTiming]}
                            onChange={(e) => setSettings({
                              ...settings,
                              reminderTiming: {
                                ...settings.reminderTiming,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>{loading ? t('common.loading') : t('common.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
