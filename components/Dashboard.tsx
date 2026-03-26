import React from 'react';
import type { User, Post } from '../types';
import { Heart, ShieldCheck } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { SocialPostBox } from './SocialPostBox';
import { DataArchitect } from './DataArchitect';
import { api } from '../services/api';
import { AgentMonitor } from './AgentMonitor';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'architect' | 'agents'>('profile');

  const handleCreatePost = async (postData: Partial<Post>) => {
    try {
      const result = await api.createPost({
        ...postData,
        businessId: user.businessId,
        businessName: user.name,
        businessAvatar: user.avatar,
      });
      if (result.success) {
        alert('Post created successfully!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 text-center md:text-start rtl:md:text-right">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6 md:mb-0">
          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-primary" />
          <div>
            <h1 className="text-3xl font-bold text-white">{t('dashboard.welcome')}, {user.name}!</h1>
            <p className="text-white/70">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
              {user.role === 'owner' && (
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider">{t('auth.roleOwner') || 'Business Owner'}</span>
              )}
              {user.role === 'admin' && (
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> System Admin
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={onLogout} className="px-6 py-2 rounded-full bg-accent/20 border border-accent text-accent font-semibold hover:bg-accent/30 transition-colors">{t('dashboard.logout')}</button>
      </div>

      {user.role === 'admin' && (
        <div className="flex justify-center mb-12">
          <div className="flex p-1 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-x-auto">
            <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'profile' ? 'bg-primary text-white shadow-glow-primary' : 'text-white/60 hover:text-white'}`}>My Profile</button>
            <button onClick={() => setActiveTab('architect')} className={`px-6 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'architect' ? 'bg-primary text-white shadow-glow-primary' : 'text-white/60 hover:text-white'}`}>Data Architect</button>
            <button onClick={() => setActiveTab('agents')} className={`px-6 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'agents' ? 'bg-primary text-white shadow-glow-primary' : 'text-white/60 hover:text-white'}`}>Agent Monitor</button>
          </div>
        </div>
      )}

      {activeTab === 'architect' && user.role === 'admin' ? (
        <DataArchitect />
      ) : activeTab === 'agents' && user.role === 'admin' ? (
        <AgentMonitor />
      ) : (
        <>
          {user.role === 'owner' && user.businessId && (
            <div className="max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">{t('dashboard.createPost') || 'Create a Post'}</h2>
              <SocialPostBox businessId={user.businessId} businessName={user.name} businessAvatar={user.avatar} onSubmit={handleCreatePost} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start rtl:text-right">
            <GlassCard className="lg:col-span-1 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{t('dashboard.profileSettings')}</h2>
              <form className="space-y-4">
                <div><label className="block text-white/70 text-sm mb-2">{t('auth.fullName')}</label><input type="text" defaultValue={user.name} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-primary transition-colors" /></div>
                <div><label className="block text-white/70 text-sm mb-2">{t('auth.email')}</label><input type="email" defaultValue={user.email} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white outline-none focus:border-primary transition-colors" /></div>
                <button type="submit" className="w-full !mt-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all">{t('dashboard.saveChanges')}</button>
              </form>
            </GlassCard>

            <div className="lg:col-span-2 space-y-8">
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Heart className="text-accent" /> {t('dashboard.myFavorites')}</h2>
                <p className="text-white/70">No favorites yet. Start exploring to save businesses.</p>
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
