import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StoriesRing } from './components/StoriesRing';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedBusinesses } from './components/FeaturedBusinesses';
import { PersonalizedEvents } from './components/PersonalizedEvents';
import { DealsMarketplace } from './components/DealsMarketplace';
import { CommunityStories } from './components/CommunityStories';
import { BusinessDirectory } from './components/BusinessDirectory';
import { InclusiveFeatures } from './components/InclusiveFeatures';
import { SocialFeed } from './components/SocialFeed';
import { AuthModal } from './components/AuthModal';
import { SubcategoryModal } from './components/SubcategoryModal';
import { GovernorateFilter } from './components/GovernorateFilter';
import { SearchPortal } from './components/SearchPortal';
import { api } from './services/api';
import { supabase } from './services/supabase';
import type { User, Category, Subcategory, Post } from './types';
import { TranslationProvider } from './hooks/useTranslations';

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 text-center">
          <div className="max-w-md p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-white/60 mb-6">
              {this.state.error?.message?.includes('{') 
                ? "A database error occurred. Please try again later." 
                : "An unexpected error occurred. Please refresh the page."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:shadow-glow-primary transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [page, setPage] = useState<'home' | 'listing'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [listingFilter, setListingFilter] = useState<{ categoryId?: string; city?: string; governorate?: string } | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSocialLoading, setIsSocialLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('iraq-compass-high-contrast') === 'true';
    }
    return false;
  });

  useEffect(() => {
    let isMounted = true;

    const applySession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!isMounted) return;

      if (session?.user) {
        const pendingRole = sessionStorage.getItem('pending_role') as 'user' | 'owner' | null;
        const user = await api.getOrCreateProfile(session.user, pendingRole || 'user');
        if (!isMounted) return;
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setAuthError(null);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
          setAuthError('Unable to complete sign-in. Please try again.');
          await supabase.auth.signOut();
        }
        sessionStorage.removeItem('pending_role');
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      setIsAuthReady(true);
    };

    const hydrateSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await applySession(session);
    };

    hydrateSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('pending_role');
      }
      await applySession(session);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsSocialLoading(true);
    const unsubscribe = api.subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setIsSocialLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
      localStorage.setItem('iraq-compass-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-contrast');
      localStorage.setItem('iraq-compass-high-contrast', 'false');
    }
  }, [highContrast]);

  const handleAuthStarted = () => {
    setAuthError(null);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPage('home');
  };
  
  const navigateHome = () => {
    setPage('home');
    setListingFilter(null);
  };

  const handleCategoryClick = (category: Category) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setSelectedCategory(category);
    } else {
      setListingFilter({ categoryId: category.id });
      setPage('listing');
    }
  };
  
  const handleSubcategorySelect = (category: Category, subcategory: Subcategory) => {
    setListingFilter({ categoryId: category.id });
    setPage('listing');
    setSelectedCategory(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setListingFilter({ city: query, governorate: selectedGovernorate !== 'all' ? selectedGovernorate : undefined });
    setPage('listing');
  };

  const handleGovernorateChange = (gov: string) => {
    setSelectedGovernorate(gov);
    if (page === 'listing') {
        setListingFilter(prev => ({ ...prev, governorate: gov !== 'all' ? gov : undefined }));
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header 
        isLoggedIn={isLoggedIn}
        user={currentUser}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleLogout}
        onHome={navigateHome}
      />
      <main>
        {authError && (
          <div className="container mx-auto px-4 pt-4">
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {authError}
            </div>
          </div>
        )}
        {page === 'home' && (
          <>
            <HeroSection />
            <StoriesRing />
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold text-white mb-8">Social Ecosystem</h2>
                        <SocialFeed posts={posts} isLoading={isSocialLoading} />
                    </div>
                    <div className="space-y-12">
                        <SearchPortal onSearch={handleSearch} />
                        <GovernorateFilter 
                          selectedGovernorate={selectedGovernorate}
                          onGovernorateChange={handleGovernorateChange}
                        />
                         <CategoryGrid 
                          onCategoryClick={handleCategoryClick} 
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
            <FeaturedBusinesses />
            <PersonalizedEvents />
            <DealsMarketplace />
            <CommunityStories />
            <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />
          </>
        )}
        {page === 'listing' && listingFilter && (
            <BusinessDirectory 
                initialFilter={listingFilter} 
                onBack={navigateHome} 
            />
        )}
      </main>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthStarted={handleAuthStarted} />}
      <SubcategoryModal 
        category={selectedCategory} 
        onClose={() => setSelectedCategory(null)}
        onSubcategorySelect={handleSubcategorySelect}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TranslationProvider>
        <MainContent />
      </TranslationProvider>
    </ErrorBoundary>
  );
}

export default App;
