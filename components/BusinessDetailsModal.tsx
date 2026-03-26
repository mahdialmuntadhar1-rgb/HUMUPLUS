import React from 'react';
import type { Business } from '../types';
import { X, MapPin, Star, Globe } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { categories } from '../constants';

interface BusinessDetailsModalProps {
  business: Business | null;
  onClose: () => void;
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({ business, onClose }) => {
  const { t, lang } = useTranslations();

  if (!business) return null;

  const displayName =
    lang === 'ar' && business.nameAr ? business.nameAr :
    lang === 'ku' && business.nameKu ? business.nameKu :
    business.name;

  const displayDescription =
    lang === 'ar' && business.descriptionAr ? business.descriptionAr :
    lang === 'ku' && business.descriptionKu ? business.descriptionKu :
    business.description;

  const displayImage = business.coverImage || business.imageUrl || business.image || 'https://picsum.photos/seed/placeholder/800/600';
  const websiteHref = business.website
    ? business.website.startsWith('http://') || business.website.startsWith('https://')
      ? business.website
      : `https://${business.website}`
    : null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-dark-bg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64">
          <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-3 end-3 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-start rtl:text-right">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{displayName}</h3>
              <p className="text-white/60">
                {t(categories.find((c) => c.id === business.category)?.nameKey || business.category)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-white">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span>{business.rating ?? 0}</span>
              <span className="text-white/60 text-sm">({business.reviewCount ?? business.reviews ?? 0})</span>
            </div>
          </div>

          {displayDescription && <p className="text-white/80 leading-relaxed">{displayDescription}</p>}

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {(business.governorate || business.city || business.address) && (
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                {[business.address, business.city, business.governorate].filter(Boolean).join(', ')}
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2 text-white/70">
                <span className="text-white/50">☎</span>
                <a className="hover:text-white" href={`tel:${business.phone}`}>{business.phone}</a>
              </div>
            )}
            {websiteHref && (
              <div className="flex items-center gap-2 text-white/70 sm:col-span-2">
                <Globe className="w-4 h-4" />
                <a className="hover:text-white break-all" href={websiteHref} target="_blank" rel="noreferrer">{business.website}</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
