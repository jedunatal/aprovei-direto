import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, HelpCircle, BookX, CreditCard, LogOut, ShieldCheck, Database } from 'lucide-react';
import { PixCheckoutModal } from '../Subscription/PixCheckoutModal';
import { ThemeToggle } from '../common/ThemeToggle';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, subscription, logout } = useAuth();
    const location = useLocation();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const isStaff = user?.roles?.some((r) => ['super_admin', 'admin', 'teacher'].includes(r)) ||
                    user?.permissions?.some((p) => ['questions.create', 'questions.import', 'questions.update'].includes(p));

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/questions', label: 'Banco de Questões', icon: HelpCircle },
        { path: '/errors', label: 'Caderno de Erros', icon: BookX },
    ];

    if (isStaff) {
        navItems.push(
            { path: '/admin/questions', label: 'Gestão de Conteúdo', icon: Database }
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                                A
                            </div>
                            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">AproveiDireto</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                                return (
                                    <Link 
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {subscription?.has_subscription && subscription.subscription?.is_active ? (
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-semibold">
                                <ShieldCheck className="w-3.5 h-3.5" /> Assinante Pro
                            </span>
                        ) : (
                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                            >
                                <CreditCard className="w-3.5 h-3.5" /> Assinar Premium
                            </button>
                        )}

                        <ThemeToggle />

                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{user?.email}</p>
                        </div>

                        <button
                            onClick={logout}
                            title="Sair da conta"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {isCheckoutOpen && (
                <PixCheckoutModal plan="monthly" onClose={() => setIsCheckoutOpen(false)} />
            )}
        </div>
    );
};
