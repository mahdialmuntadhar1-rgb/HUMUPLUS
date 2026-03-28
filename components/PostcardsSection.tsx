import React from 'react';
import { api } from '../services/api';
import type { BusinessPostcard } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { GlassCard } from './GlassCard';
import { MapPin, Star, X } from './icons';
import { mockData, type GovernorateId } from '../services/mockData';

interface PostcardsSectionProps {
  selectedGovernorate: string;
}

export const PostcardsSection: React.FC<PostcardsSectionProps> = ({ selectedGovernorate }) => {
  const { t } = useTranslations();
  const [cards, setCards] = React.useState<BusinessPostcard[]>([]);
  const [selected, setSelected] = React.useState<BusinessPostcard | null>(null);

  React.useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await api.getPostcards(selectedGovernorate !== 'all' ? selectedGovernorate : undefined);
        const fallback = mockData.postcards((selectedGovernorate || 'all') as GovernorateId);
        setCards(data.length > 0 ? data : fallback);
      } catch (error) {
        console.error('Error loading postcards', error);
        setCards(mockData.postcards((selectedGovernorate || 'all') as GovernorateId));
      }
    };
    void fetchCards();
  }, [selectedGovernorate]);

  return (
    <section className="py-16" id="postcards-section">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">{t('postcards.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <button key={card.id} onClick={() => setSelected(card)} className="text-start">
              <GlassCard className="p-0 overflow-hidden hover:border-primary/40 border-white/10 transition-all h-full">
                <img src={card.hero_image} alt={card.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-white font-bold mb-2">{card.title}</h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2"><MapPin className="w-4 h-4" /> {card.city} · {card.neighborhood}</div>
                  <div className="flex items-center gap-2 text-accent text-sm"><Star className="w-4 h-4 fill-accent" /> {card.rating} ({card.review_count})</div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg bg-dark-bg border border-white/20 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h3 className="text-white text-xl font-bold">{selected.title}</h3><button onClick={() => setSelected(null)}><X className="w-5 h-5 text-white/60" /></button></div>
            <p className="text-white/70 mb-3">{selected.postcard_content}</p>
            <a href={selected.google_maps_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('postcards.openMap')}</a>
          </div>
        </div>
      )}
    </section>
  );
};
