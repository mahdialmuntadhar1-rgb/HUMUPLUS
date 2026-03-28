import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle } from './icons';
import { GlassCard } from './GlassCard';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'motion/react';
import type { Post, User } from '../types';

interface SocialFeedProps {
    posts: Post[];
    isLoading?: boolean;
    isLoggedIn?: boolean;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
    currentUser?: User | null;
    onRequestOwnerAccess?: () => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ posts, isLoading, isLoggedIn, onLike, onComment, onShare, currentUser, onRequestOwnerAccess }) => {
    const { t, lang } = useTranslations();
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const canPost = currentUser?.role === 'owner' || currentUser?.role === 'admin';

    const handleLike = (postId: string) => {
        const newLikedPosts = new Set(likedPosts);
        if (newLikedPosts.has(postId)) {
            newLikedPosts.delete(postId);
        } else {
            newLikedPosts.add(postId);
        }
        setLikedPosts(newLikedPosts);
        onLike?.(postId);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/10" />
                            <div className="space-y-2 flex-1">
                                <div className="w-32 h-4 bg-white/10 rounded" />
                                <div className="w-20 h-3 bg-white/10 rounded" />
                            </div>
                        </div>
                        <div className="w-full h-4 bg-white/10 rounded mb-2" />
                        <div className="w-2/3 h-4 bg-white/10 rounded mb-4" />
                        <div className="w-full aspect-video bg-white/10 rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {isLoggedIn && !canPost && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
                    <p className="text-sm mb-3">{t('social.ownerOnlyNotice')}</p>
                    <button onClick={onRequestOwnerAccess} className="px-4 py-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 transition-colors text-sm font-semibold">
                        {t('actions.joinOwner')}
                    </button>
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {posts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <MessageCircle className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">{t('social.noPostsTitle')}</h3>
                        <p className="text-white/50 text-base max-w-xs mx-auto">
                            {t('social.noPostsDesc')}
                        </p>
                    </motion.div>
                ) : (
                    posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <GlassCard className="p-0 overflow-hidden border-white/10 hover:border-white/20 transition-all duration-300 group">
                                {/* Header */}
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img 
                                                src={post.businessAvatar} 
                                                alt={post.businessName} 
                                                className="w-12 h-12 rounded-full border-2 border-primary/20 group-hover:border-primary/50 transition-colors" 
                                            />
                                            {post.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-dark-bg">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg flex items-center gap-1.5">
                                                {post.businessName}
                                                {post.isVerified && <CheckCircle className="w-4 h-4 text-primary" />}
                                            </h3>
                                            <p className="text-sm text-white/40">
                                                {post.createdAt.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-IQ' : 'ku-Arab-IQ', { 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all">
                                        <MoreHorizontal className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-5 pb-5">
                                    <p className="text-white/80 text-lg leading-relaxed">{post.caption}</p>
                                </div>

                                {/* Image */}
                                {post.imageUrl && (
                                    <div className="relative aspect-video bg-white/5 overflow-hidden">
                                        <img 
                                            src={post.imageUrl} 
                                            alt="Post content" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        />
                                    </div>
                                )}

                                {/* Footer / Actions */}
                                <div className="p-4 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-8">
                                        <button 
                                            onClick={() => isLoggedIn && handleLike(post.id)}
                                            disabled={!isLoggedIn}
                                            className={`flex items-center gap-2.5 transition-all transform active:scale-90 ${!isLoggedIn ? 'opacity-30 cursor-not-allowed' : likedPosts.has(post.id) ? 'text-accent' : 'text-white/50 hover:text-accent'}`}
                                            title={!isLoggedIn ? t('social.loginToLike') : ""}
                                        >
                                            <Heart className={`w-6 h-6 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                                            <span className="text-base font-bold">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                                        </button>
                                        <button 
                                            onClick={() => isLoggedIn && onComment?.(post.id)}
                                            disabled={!isLoggedIn}
                                            className={`flex items-center gap-2.5 transition-all transform active:scale-90 ${!isLoggedIn ? 'opacity-30 cursor-not-allowed' : 'text-white/50 hover:text-primary'}`}
                                            title={!isLoggedIn ? t('social.loginToComment') : ""}
                                        >
                                            <MessageCircle className="w-6 h-6" />
                                            <span className="text-base font-bold">{t('social.comments')}</span>
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => onShare?.(post.id)}
                                        className="flex items-center gap-2.5 text-white/50 hover:text-secondary transition-all transform active:scale-95"
                                    >
                                        <Share2 className="w-6 h-6" />
                                        <span className="text-base font-bold">{t('social.share')}</span>
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    );
};

