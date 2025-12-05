import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Settings, Lock, Trash2, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../api/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  preferredLanguage: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'delete'>('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    preferredLanguage: i18n.language
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load user profile data
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/profile');
      setProfileData({
        ...response.data.profile,
        preferredLanguage: i18n.language
      });
    } catch (err) {
      setError(t('common.failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await api.put('/api/auth/profile', profileData);
      setSuccess(t('profile.profileUpdated'));
      setTimeout(() => setSuccess(null), 3000);
      
      // Update language if changed
      if (profileData.preferredLanguage !== i18n.language) {
        i18n.changeLanguage(profileData.preferredLanguage);
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError(t('auth.confirmPassword'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess(t('profile.passwordChanged'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete('/api/auth/delete-account');
      logout();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name) {
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('profile.title')}</h1>
        <p className="text-muted-foreground">{t('profile.personalInfo')}</p>
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
            { key: 'personal', label: t('profile.personalInfo'), icon: User },
            { key: 'security', label: t('profile.securitySettings'), icon: Lock },
            { key: 'delete', label: t('profile.deleteAccount'), icon: Trash2 }
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
        {activeTab === 'personal' && (
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">{t('profile.personalInfo')}</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('auth.fullName')}
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('profile.dateOfBirth')}
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('profile.address')}
                  </label>
                  <textarea
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('profile.preferredLanguage')}
                  </label>
                  <select
                    value={profileData.preferredLanguage}
                    onChange={(e) => setProfileData({...profileData, preferredLanguage: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  >
                    <option value="tr">{t('profile.turkish')}</option>
                    <option value="en">{t('profile.english')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? t('common.loading') : t('profile.updateProfile')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">{t('profile.securitySettings')}</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('profile.currentPassword')}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('profile.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground bg-background"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? t('common.loading') : t('profile.changePassword')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'delete' && (
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">{t('profile.deleteAccount')}</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">{t('common.warning')}</h3>
                  <p className="mt-1 text-sm text-red-700">{t('profile.deleteAccountWarning')}</p>
                </div>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('profile.deleteAccount')}</span>
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-foreground">{t('profile.deleteAccountConfirmText')}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{loading ? t('common.loading') : t('profile.deleteAccountConfirm')}</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
