import React from 'react';
import { SocialFeed } from './SocialFeed';
import { useTranslations } from '../hooks/useTranslations';
import type { Post, User } from '../types';
import { motion } from 'motion/react';

interface BusinessGridSectionProps {
    posts: Post[];
    isLoading: boolean;
    isLoggedIn: boolean;
    currentUser: User | null;
    onJoinOwner: () => void;
}

export const BusinessGridSection: React.FC<BusinessGridSectionProps> = ({ posts, isLoading, isLoggedIn, currentUser, onJoinOwner }) => {
    const { t } = useTranslations();

    return (
        <section className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight">{t('social.ecosystemTitle') || 'Social Ecosystem'}</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('social.liveFeed') || 'Live Feed'}</span>
                    </div>
                </div>
                
                <SocialFeed 
                    posts={posts}
                    isLoading={isLoading}
                    isLoggedIn={isLoggedIn}
                    currentUser={currentUser}
                    onRequestOwnerAccess={onJoinOwner}
                />
            </motion.div>
        </section>
    );
};
