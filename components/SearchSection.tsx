import React from 'react';
import { SearchPortal } from './SearchPortal';
import { CityFilter } from './CityFilter';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'motion/react';

interface SearchSectionProps {
    onSearch: (query: string) => void;
    selectedCity: string;
    onCityChange: (city: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({ 
    onSearch, 
    selectedCity, 
    onCityChange 
}) => {
    const { t } = useTranslations();

    return (
        <section className="space-y-12">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
            >
                <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        {t('search.title') || 'Search Iraq'}
                    </h3>
                    <SearchPortal onSearch={onSearch} />
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        </div>
                        {t('cities.title') || 'Cities'}
                    </h3>
                    <CityFilter 
                        selectedCity={selectedCity}
                        onCityChange={onCityChange}
                    />
                </div>
            </motion.div>
        </section>
    );
};
