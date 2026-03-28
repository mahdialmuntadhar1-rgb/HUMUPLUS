import React from 'react';
import { HeroSection } from './HeroSection';
import { StoriesRing } from './StoriesRing';
import { CategoriesSection } from './CategoriesSection';
import { BusinessGridSection } from './BusinessGridSection';
import { SearchSection } from './SearchSection';
import { FeaturedSection } from './FeaturedSection';
import { PersonalizedEvents } from './PersonalizedEvents';
import { DealsMarketplace } from './DealsMarketplace';
import { CommunityStories } from './CommunityStories';
import { CityGuide } from './CityGuide';
import { InclusiveFeatures } from './InclusiveFeatures';
import { FooterSection } from './FooterSection';
import type { Post, Category, User } from '../types';
import { PostcardsSection } from './PostcardsSection';

interface HomePageProps {
  posts: Post[];
  isSocialLoading: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;
  onCategoryClick: (category: Category) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onSearch: (query: string) => void;
  selectedGovernorate: string;
  onGovernorateChange: (gov: string) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  onJoinOwner: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  isSocialLoading,
  isLoggedIn,
  currentUser,
  onCategoryClick,
  currentPage,
  setCurrentPage,
  onSearch,
  selectedGovernorate,
  onGovernorateChange,
  highContrast,
  setHighContrast,
  onJoinOwner,
}) => {
  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary/30 selection:text-white">
      <HeroSection onJoinOwner={onJoinOwner} />
      <StoriesRing selectedGovernorate={selectedGovernorate} />
      
      <CategoriesSection 
        onCategoryClick={onCategoryClick} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="container mx-auto px-4 py-24 relative" id="search-section">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <BusinessGridSection 
                posts={posts} 
                isLoading={isSocialLoading} 
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
                onJoinOwner={onJoinOwner}
              />
              
              <SearchSection 
                onSearch={onSearch} 
                selectedGovernorate={selectedGovernorate}
                onGovernorateChange={onGovernorateChange}
              />
          </div>
      </div>

      <FeaturedSection selectedGovernorate={selectedGovernorate} />
      <PostcardsSection selectedGovernorate={selectedGovernorate} />
      
      <div className="space-y-32 py-24">
        <PersonalizedEvents selectedGovernorate={selectedGovernorate} />
        <DealsMarketplace />
        <CommunityStories selectedGovernorate={selectedGovernorate} />
        <CityGuide />
      </div>

      <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />
      
      <FooterSection />
    </div>
  );
};
