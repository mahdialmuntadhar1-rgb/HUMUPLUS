import React, { useState, useEffect } from 'react';
import { categories } from '../constants';
import type { Category } from '../types';
import { Sparkles } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryCounts } from '../services/supabase';

interface CategoryGridProps {
  onCategoryClick: (category: Category) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const SkeletonCard: React.FC = () => (
    <div className="aspect-square backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-full mb-4"></div>
        <div className="h-4 w-3/4 bg-white/10 rounded mb-2"></div>
        <div className="h-6 w-1/2 bg-white/10 rounded"></div>
    </div>
);

const ITEMS_PER_PAGE = 100;

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategoryClick, currentPage, setCurrentPage }) => {
    const [loading, setLoading] = useState(true);
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
    const { t } = useTranslations();

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);
            try {
                const counts = await getCategoryCounts();
                setCategoryCounts(counts);
            } catch (error) {
                console.error('Error fetching category counts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    const getCategoryCount = (categoryId: string): number => {
        // Map frontend category IDs to ACTUAL database category names
        const categoryMap: Record<string, string[]> = {
            'food_drink': ['cafe', 'restaurant', 'bakery', 'coffee', 'tea', 'food', 'drink'],
            'shopping': ['clothes', 'electronics', 'furniture', 'supermarket', 'shop', 'store', 'retail', 'mall', 'market'],
            'events_entertainment': ['cinema', 'theater', 'events', 'entertainment', 'film'],
            'accommodation': ['hotel', 'accommodation', 'stay', 'bed'],
            'culture_heritage': ['mosque', 'culture', 'heritage', 'museum', 'historical', 'landmark'],
            'business_services': ['bank', 'business', 'services', 'office'],
            'health_wellness': ['hospital', 'pharmacy', 'gym', 'health', 'wellness', 'clinic'],
            'transport_mobility': ['fuel', 'bus_station', 'transport', 'car', 'taxi', 'mobility'],
            'public_essential': ['school', 'public', 'essential', 'government', 'siren'],
            'doctors': ['doctor', 'physician', 'medical doctor', 'gp', 'general practitioner'],
            'lawyers': ['lawyer', 'attorney', 'legal', 'law firm', 'advocate'],
            'clinics': ['clinic', 'medical clinic', 'health clinic', 'specialty clinic'],
            'hospitals': ['hospital', 'medical center', 'health center', 'infirmary'],
            'cafe': ['cafe', 'coffee', 'coffee shop', 'cafes'],
        };
        
        const possibleNames = categoryMap[categoryId] || [categoryId];
        let total = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
            if (possibleNames.some(name => cat.toLowerCase().includes(name.toLowerCase()))) {
                total += count as number;
            }
        }
        return total;
    };

    // Show all categories, no pagination
    const paginatedCategories = categories;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl font-bold text-white mb-2"
                >
                    {t('categories.title')}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-white/60"
                >
                    {t('categories.subtitle')}
                </motion.p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="skeleton"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                        >
                            {Array.from({ length: 9 }).map((_, index) => <SkeletonCard key={index} />)}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="col-span-full grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                        >
                            {paginatedCategories.map((category, index) => (
                                <GlassCard
                                    as="button"
                                    key={category.id}
                                    onClick={() => onCategoryClick(category)}
                                    className="group relative aspect-square p-0 hover:shadow-glow-primary hover:scale-105 cursor-pointer overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                                        <div className="text-4xl md:text-5xl mb-3 text-white transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(0,217,255,0.5)]">
                                            {category.icon}
                                        </div>
                                        <h3 className="text-white font-semibold text-sm md:text-base mb-2">
                                            {t(category.nameKey)}
                                        </h3>
                                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white/80">
                                            {getCategoryCount(category.id)} {t('categories.businesses')}
                                        </div>
                                        {category.recommended && (
                                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center animate-pulse">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
