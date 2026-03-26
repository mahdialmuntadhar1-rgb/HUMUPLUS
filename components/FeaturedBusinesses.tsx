import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Business } from '../types';
import { Crown, MapPin } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { categories } from '../constants';

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/featured-business-placeholder/600/400';

export const FeaturedBusinesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslations();

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      try {
        const result = await api.getBusinesses({ limit: 10 });
        setBusinesses(result.data);
      } catch (error) {
        console.error('Error fetching featured businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          {t('featured.title')}
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {businesses.length === 0 ? (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center opacity-50">
              <Crown className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/60 text-sm">{t('featured.noFeatured') || 'No featured businesses at the moment.'}</p>
            </div>
          ) : (
            businesses.map((business) => {
              const displayName = business.name || 'N/A';
              const locationText = [business.address, business.city, business.governorate].filter(Boolean).join(', ') || 'N/A';
              const categoryKey = categories.find((c) => c.id === business.category)?.nameKey;
              const categoryLabel = categoryKey ? t(categoryKey) : (business.category || 'N/A');

              return (
                <GlassCard
                  key={business.id}
                  className="flex-shrink-0 w-80 snap-center overflow-hidden group hover:shadow-glow-primary p-0"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={PLACEHOLDER_IMAGE}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-start">
                        <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
                        <p className="text-white/60 text-sm">{categoryLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {locationText}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm hover:shadow-glow-primary transition-all duration-200">
                        {t('actions.book')}
                      </button>
                      <button className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-all duration-200">
                        {t('actions.details')}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            }))}
        </div>
      </div>
    </section>
  );
};
