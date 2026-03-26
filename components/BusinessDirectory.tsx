import React, { useState, useEffect } from 'react';
import { categories } from '../constants';
import { fetchBusinesses } from '../services/businesses';
import type { Business } from '../types';
import { Star, Grid3x3, List, MapPin, CheckCircle, ArrowLeft } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';

interface BusinessCardProps {
  business: Business;
  viewMode: 'grid' | 'list';
  onOpen: (businessId: string) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, viewMode, onOpen }) => {
  const { t, lang } = useTranslations();

  const displayName = lang === 'ar' && business.nameAr ? business.nameAr :
                      lang === 'ku' && business.nameKu ? business.nameKu :
                      business.name;

  const displayImage = business.imageUrl || business.image || business.coverImage || 'https://picsum.photos/seed/placeholder/400/300';
  const displayReviews = business.reviewCount ?? business.reviews ?? 0;
  const isVerified = business.isVerified ?? business.verified ?? false;

  if (viewMode === 'list') {
    return (
      <GlassCard className="p-4 flex flex-col sm:flex-row gap-4 text-start rtl:text-right">
        <img src={displayImage} alt={displayName} className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{displayName}</h3>
          <p className="text-white/60 text-sm mb-2">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white">{business.rating}</span></div>
            <div className="flex items-center gap-1 text-white/60"><MapPin className="w-4 h-4" />{business.distance || '—'} km</div>
          </div>
        </div>
        <button onClick={() => onOpen(String(business.id))} className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm">{t('directory.viewProfile')}</button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden group text-start p-0">
      <div className="relative h-48 overflow-hidden">
        <img src={displayImage} alt={displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {isVerified && <div className="absolute top-3 end-3 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-dark-bg" /></div>}
      </div>
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2">{displayName}</h3>
        <p className="text-white/60 text-sm mb-3">{t(categories.find(c => c.id === business.category)?.nameKey || business.category)}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="text-white font-medium">{business.rating}</span><span className="text-white/60 text-sm">({displayReviews})</span></div>
          <div className="flex items-center gap-1 text-white/60 text-sm"><MapPin className="w-4 h-4" />{business.distance || '—'} km</div>
        </div>
        <button onClick={() => onOpen(String(business.id))} className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all">{t('directory.viewProfile')}</button>
      </div>
    </GlassCard>
  );
};

interface BusinessDirectoryProps {
  initialFilter?: { categoryId: string };
  selectedGovernorate?: string;
  onBack?: () => void;
  onBusinessOpen: (businessId: string) => void;
}

export const BusinessDirectory: React.FC<BusinessDirectoryProps> = ({ initialFilter, selectedGovernorate = 'all', onBack, onBusinessOpen }) => {
  const [filters, setFilters] = useState({
    category: initialFilter?.categoryId || 'all',
    city: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [businessesData, setBusinessesData] = useState<Business[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: initialFilter?.categoryId || 'all' }));
    setCurrentPage(1);
  }, [initialFilter]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchBusinesses(selectedGovernorate, {
          category: filters.category,
          search: filters.city,
          offset: (currentPage - 1) * pageSize,
          limit: pageSize,
          signal: controller.signal,
        });
        setBusinessesData(result.data);
        setTotalCount(result.total);
      } catch (err) {
        setError('Could not load businesses.');
        setBusinessesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [filters, currentPage, pageSize, selectedGovernorate]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center relative mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute start-0 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">{t('header.backToHome')}</span>
            </button>
          )}
          <h2 className="text-3xl font-bold text-white text-center">{t('directory.title')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4 text-start rtl:text-right">
            <GlassCard className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
                {t('directory.filters')}
                <button onClick={() => setFilters({ category: 'all', city: '' })} className="text-xs text-secondary hover:text-secondary/80">
                  {t('directory.reset')}
                </button>
              </h3>

              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">{t('directory.city') || 'City'}</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder={t('directory.cityPlaceholder') || 'Search by city...'}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">{t('directory.category')}</label>
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none appearance-none bg-no-repeat bg-right-4" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'left 0.75rem center', backgroundSize: '1.5em 1.5em' }}>
                  <option value="all" className="bg-dark-bg">{t('directory.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id} className="bg-dark-bg">{t(category.nameKey)}</option>
                  ))}
                </select>
              </div>
            </GlassCard>
          </div>
          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <p className="text-white/80">{totalCount} {t('directory.businessesFound')}</p>
              <div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-1 self-start sm:self-auto">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary' : 'hover:bg-white/10'}`}><Grid3x3 className="w-5 h-5 text-white" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary' : 'hover:bg-white/10'}`}><List className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <GlassCard className="p-8 text-center text-white/80">{error}</GlassCard>
            ) : businessesData.length === 0 ? (
              <GlassCard className="p-8 text-center text-white/70">No businesses found for this filter.</GlassCard>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>
                {businessesData.map((business) => (<BusinessCard key={business.id} business={business} viewMode={viewMode} onOpen={onBusinessOpen} />))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-6 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white disabled:opacity-30 transition-all"
                >
                  {t('directory.previous') || 'Previous'}
                </button>
                <span className="text-white/70">{t('directory.page') || 'Page'} {currentPage} {t('directory.of') || 'of'} {totalPages}</span>
                <button
                  disabled={currentPage === totalPages || isLoading}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white disabled:opacity-30 transition-all"
                >
                  {t('directory.next') || 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
