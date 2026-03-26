import React from 'react';
import { GlassCard } from './GlassCard';
import { ArrowLeft, MapPin, Star, Globe } from './icons';
import type { Business } from '../types';
import { fetchBusinessById } from '../services/businesses';

interface BusinessDetailsPageProps {
  businessId: string;
  onBack: () => void;
}

export const BusinessDetailsPage: React.FC<BusinessDetailsPageProps> = ({ businessId, onBack }) => {
  const [business, setBusiness] = React.useState<Business | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    fetchBusinessById(businessId, controller.signal)
      .then((result) => {
        setBusiness(result);
        setError(result ? null : 'Business not found.');
      })
      .catch(() => setError('Could not load this business.'))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [businessId]);

  React.useEffect(() => {
    if (!business) return;

    const originalTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]') || document.createElement('meta');
    descriptionTag.setAttribute('name', 'description');
    descriptionTag.setAttribute('content', `${business.name} in ${business.city || business.governorate || 'Iraq'} - Iraq Compass business profile.`);
    document.head.appendChild(descriptionTag);

    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', `${business.name} | Iraq Compass`);
    document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', business.description || `${business.name} in ${business.city || business.governorate || 'Iraq'}`);
    document.head.appendChild(ogDescription);

    document.title = `${business.name} | Iraq Compass`;

    return () => {
      document.title = originalTitle;
    };
  }, [business]);

  return (
    <section className="container mx-auto px-4 py-10">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
      ) : error ? (
        <GlassCard className="p-8 text-center text-white/70">{error}</GlassCard>
      ) : business ? (
        <GlassCard className="p-0 overflow-hidden">
          <img src={business.coverImage || business.imageUrl || 'https://picsum.photos/seed/placeholder/1000/500'} alt={business.name} className="w-full h-56 sm:h-72 object-cover" />
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-white mb-3">{business.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 mb-6">
              <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-accent" /> {business.rating}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {business.city || business.governorate || 'Iraq'}</span>
            </div>
            {business.description && <p className="text-white/85 mb-6">{business.description}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/80">
              {business.phone && <p className="inline-flex items-center gap-2">📞 {business.phone}</p>}
              {business.website && <p className="inline-flex items-center gap-2"><Globe className="w-4 h-4" /> {business.website}</p>}
            </div>
          </div>
        </GlassCard>
      ) : null}
    </section>
  );
};
