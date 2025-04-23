import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { X, Save, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileSettingsProps {
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user, refreshProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [writingLanguage, setWritingLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('name, writing_language')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setName(data.name || '');
        setWritingLanguage(data.writing_language || 'en');
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setShowSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          writing_language: writingLanguage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setShowSuccess(true);
      await refreshProfile();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    const dialog = document.querySelector('.profile-settings-dialog');
    dialog?.classList.add('animate-out');
    setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="profile-settings-dialog bg-card p-6 rounded-lg shadow-lg w-full max-w-md relative animate-in slide-in-from-bottom-4 duration-200">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 hover:bg-muted rounded-md transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-100 dark:bg-green-900/20 rounded-md">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium mb-1">
              Writing Language
            </label>
            <div className="relative">
              <select
                id="language"
                value={writingLanguage}
                onChange={(e) => setWritingLanguage(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background appearance-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};