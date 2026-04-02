import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Sparkles, User as UserIcon, LogOut, LayoutDashboard, ChevronDown } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import { motion, AnimatePresence } from 'motion/react';

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
    const [isScrolled, setIsScrolled] = useState(false);
    const { t } = useTranslations();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
                isScrolled 
                ? 'py-3 backdrop-blur-2xl bg-dark-bg/80 border-white/10 shadow-2xl' 
                : 'py-6 bg-transparent border-transparent'
            }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <button 
                    onClick={onHome} 
                    className="group flex items-center gap-2.5 text-2xl sm:text-3xl font-black text-white tracking-tighter"
                >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary group-hover:rotate-12 transition-transform duration-300 shadow-glow-primary/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="flex items-center">
                        Iraq<span className="text-primary group-hover:text-secondary transition-colors">Compass</span>
                    </span>
                </button>

                <nav className="flex items-center gap-3 sm:gap-6 rtl:flex-row-reverse">
                    <LanguageSelector />
                    
                    {isLoggedIn && user ? (
                        <div className="relative">
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)} 
                                className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 border ${
                                    dropdownOpen 
                                    ? 'bg-primary/20 border-primary/50 ring-4 ring-primary/10' 
                                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                                }`}
                            >
                                <div className="relative">
                                    <img 
                                        src={user.avatar} 
                                        alt={user.name} 
                                        className="w-9 h-9 rounded-full border-2 border-primary/20 object-cover" 
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg" />
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-white font-bold text-sm tracking-tight">{user.name}</span>
                                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-[-1]" 
                                            onClick={() => setDropdownOpen(false)} 
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute end-0 mt-3 w-64 backdrop-blur-3xl bg-dark-bg/95 border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 mb-2 border-b border-white/5">
                                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">{t('header.account') || 'Account'}</p>
                                                <p className="text-white font-bold truncate">{user.email}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => { onDashboard(); setDropdownOpen(false); }} 
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-primary/10 hover:text-primary transition-all group"
                                            >
                                                <LayoutDashboard className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                                                <span className="font-bold">{t('header.dashboard')}</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => { onSignOut(); setDropdownOpen(false); }} 
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-accent hover:bg-accent/10 transition-all group"
                                            >
                                                <LogOut className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                                                <span className="font-bold">{t('header.logout')}</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button 
                            onClick={onSignIn} 
                            className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold hover:shadow-glow-primary transition-all duration-300 flex items-center gap-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <UserIcon className="w-5 h-5 relative z-10" /> 
                            <span className="relative z-10 hidden sm:inline">{t('header.signIn')}</span>
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};
