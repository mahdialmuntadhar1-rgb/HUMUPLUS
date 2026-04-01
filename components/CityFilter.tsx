import React from 'react';
import { cities } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { Globe } from './icons';

interface CityFilterProps {
    selectedCity: string;
    onCityChange: (cityId: string) => void;
}

export const CityFilter: React.FC<CityFilterProps> = ({ selectedCity, onCityChange }) => {
    const { t } = useTranslations();
    
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-md mx-auto">
                 <label htmlFor="city-select" className="sr-only">{t('filter.city') || 'Filter by City'}</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <Globe className="w-5 h-5 text-white/50" />
                    </div>
                    <select
                        id="city-select"
                        value={selectedCity}
                        onChange={(e) => onCityChange(e.target.value)}
                        className="w-full ps-10 p-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white outline-none appearance-none focus:border-primary transition-colors"
                    >
                        {cities.map(city => (
                            <option key={city.id} value={city.id} className="bg-dark-bg">
                                {t(city.nameKey)}
                            </option>
                        ))}
                    </select>
                 </div>
            </div>
        </div>
    );
};
