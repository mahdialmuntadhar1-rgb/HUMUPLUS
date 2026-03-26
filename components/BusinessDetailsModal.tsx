import React from 'react';
import type { Business } from '../types';
import { X, MapPin } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { categories } from '../constants';

interface BusinessDetailsModalProps {
  business: Business | null;
  onClose: () => void;
}

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/business-details-placeholder/800/600';

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({ business, onClose }) => {
  const { t } = useTranslations();

  if (!business) return null;

  const displayName = business.name || 'N/A';
  const categoryKey = categories.find((c) => c.id === business.category)?.nameKey;
  const categoryLabel = categoryKey ? t(categoryKey) : (business.category || 'N/A');
  const location = [business.address, business.city, business.governorate].filter(Boolean).join(', ') || 'N/A';
  const phone = business.phone || 'N/A';

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-dark-bg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64">
          <img src={PLACEHOLDER_IMAGE} alt={displayName} className="w-full h-full object-cover" />
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
              <p className="text-white/60">{categoryLabel}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <span className="text-white/50">☎</span>
              {business.phone ? (
                <a className="hover:text-white" href={`tel:${business.phone}`}>{phone}</a>
              ) : (
                <span>{phone}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/70 sm:col-span-2">
              <span className="text-white/50">📍</span>
              <span>{business.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
