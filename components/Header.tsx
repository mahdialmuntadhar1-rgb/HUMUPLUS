import React, { useState } from 'react';
import type { User } from '../types';
import { Sparkles, User as UserIcon } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
    isLoggedIn: boolean;
    user: User | null;
    onSignIn: () => void;
    onSignOut: () => void;
    onDashboard: () => void;
    onHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isLoggedIn, user, onSignIn, onSignOut, onDashboard, onHome }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { t } = useTranslations();

    return (
        <header className="sticky top-0 z-50 py-4 backdrop-blur-xl bg-dark-bg/80 border-b border-glass-border">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <button onClick={onHome} className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white">
                    <Sparkles className="text-primary" />
                    Iraq<span className="text-secondary">Compass</span>
                </button>
                <nav className="flex items-center gap-4 rtl:flex-row-reverse">
                    <LanguageSelector />
                    {isLoggedIn && user ? (
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3 p-2 rounded-full bg-glass-surface hover:bg-glass-hover border border-glass-border transition-colors">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                <span className="hidden md:block text-white/90 font-medium">{user.name}</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute end-0 mt-2 w-48 backdrop-blur-2xl bg-dark-bg/90 border border-white/20 rounded-xl shadow-soft p-2" onMouseLeave={() => setDropdownOpen(false)}>
                                    <button onClick={onDashboard} className="w-full text-start px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">{t('header.dashboard')}</button>
                                    <button onClick={onSignOut} className="w-full text-start px-4 py-2 rounded-lg text-accent hover:bg-white/10 transition-colors">{t('header.logout')}</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={onSignIn} className="p-2 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-glow-primary transition-all duration-300 flex items-center gap-2">
                           <UserIcon className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{t('header.signIn')}</span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}