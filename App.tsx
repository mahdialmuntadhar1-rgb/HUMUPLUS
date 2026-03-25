import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StoriesRing } from './components/StoriesRing';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedBusinesses } from './components/FeaturedBusinesses';
import { PersonalizedEvents } from './components/PersonalizedEvents';
import { DealsMarketplace } from './components/DealsMarketplace';
import { CommunityStories } from './components/CommunityStories';
import { CityGuide } from './components/CityGuide';
import { BusinessDirectory } from './components/BusinessDirectory';
import { InclusiveFeatures } from './components/InclusiveFeatures';
import { SocialFeed } from './components/SocialFeed';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { SubcategoryModal } from './components/SubcategoryModal';
import { GovernorateFilter } from './components/GovernorateFilter';
import { SearchPortal } from './components/SearchPortal';
import { mockUser } from './constants';
import { api } from './services/api';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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

const mockPosts: Post[] = [
  {
    id: '1',
    businessId: 'b1',
    businessName: 'Grand Millennium Sulaimani',
    businessAvatar: 'https://picsum.photos/seed/b1/128/128',
    caption: 'Experience the best view of Sulaymaniyah from our rooftop restaurant. Book your table now for an unforgettable evening! 🌆✨ #Sulaymaniyah #LuxuryStay',
    imageUrl: 'https://picsum.photos/seed/post1/800/600',
    createdAt: new Date('2026-03-24T18:30:00'),
    likes: 245,
    verified: true
  },
  {
    id: '2',
    businessId: 'b2',
    businessName: 'Saj Al-Reef',
    businessAvatar: 'https://picsum.photos/seed/b2/128/128',
    caption: 'Our new family meal deal is here! Enjoy a variety of traditional Iraqi dishes at a special price. Perfect for your weekend gathering. 🥘👨‍👩‍👧‍👦 #IraqiFood #FamilyTime',
    imageUrl: 'https://picsum.photos/seed/post2/800/600',
    createdAt: new Date('2026-03-25T10:15:00'),
    likes: 182,
    verified: true
  }
];

const MainContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [page, setPage] = useState<'home' | 'dashboard' | 'listing'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [listingFilter, setListingFilter] = useState<{ categoryId: string } | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('all');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('iraq-compass-high-contrast') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch profile from Firestore
        // We'll use a default role of 'user' if not found, or prompt for it
        const user = await api.login(firebaseUser.email || '', 'user');
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
        const apiPosts = await api.getPosts();
        if (apiPosts && apiPosts.length > 0) {
            setPosts(apiPosts);
        }
    };
    fetchPosts();
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

  const handleLogin = async (email: string, role: 'user' | 'owner') => {
    // Auth is handled in AuthModal via signInWithPopup, 
    // which triggers onAuthStateChanged above.
    // We just need to ensure the role is correctly set if it's a new user.
    if (auth.currentUser) {
        const user = await api.login(email, role);
        if (user) {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
    }
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPage('home');
  };
  
  const navigateTo = (targetPage: 'home' | 'dashboard') => {
      if (targetPage === 'dashboard' && !isLoggedIn) {
          setShowAuthModal(true);
      } else {
          setPage(targetPage);
          if (targetPage === 'home') {
            setListingFilter(null);
          }
      }
  }

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
        onDashboard={() => navigateTo('dashboard')}
        onHome={() => navigateTo('home')}
      />
      <main>
        {page === 'home' && (
          <>
            <HeroSection />
            <StoriesRing />
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold text-white mb-8">Social Ecosystem</h2>
                        <SocialFeed posts={posts} />
                    </div>
                    <div className="space-y-12">
                        <SearchPortal />
                        <GovernorateFilter 
                          selectedGovernorate={selectedGovernorate}
                          onGovernorateChange={setSelectedGovernorate}
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
            <CityGuide />
            <BusinessDirectory />
            <InclusiveFeatures highContrast={highContrast} setHighContrast={setHighContrast} />
          </>
        )}
        {page === 'listing' && listingFilter && (
            <BusinessDirectory 
                initialFilter={listingFilter} 
                onBack={() => navigateTo('home')} 
            />
        )}
        {page === 'dashboard' && currentUser && <Dashboard user={currentUser} onLogout={handleLogout} />}
      </main>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />}
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