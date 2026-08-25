import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, SubscriptionStatus } from '../types/api';
import api from '../lib/axios';

interface AuthContextType {
    user: User | null;
    token: string | null;
    subscription: SubscriptionStatus | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => Promise<void>;
    refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const cached = localStorage.getItem('@AproveiDireto:user');
        return cached ? JSON.parse(cached) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('@AproveiDireto:token'));
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSubscription = async () => {
        try {
            const { data } = await api.get<SubscriptionStatus>('/subscriptions/status');
            setSubscription(data);
        } catch {
            setSubscription(null);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (token) {
                try {
                    const { data } = await api.get<{ user: User }>('/auth/user');
                    setUser(data.user);
                    localStorage.setItem('@AproveiDireto:user', JSON.stringify(data.user));
                    await refreshSubscription();
                } catch {
                    setUser(null);
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        init();
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('@AproveiDireto:token', newToken);
        localStorage.setItem('@AproveiDireto:user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        refreshSubscription();
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('@AproveiDireto:token');
            localStorage.removeItem('@AproveiDireto:user');
            setUser(null);
            setToken(null);
            setSubscription(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                subscription,
                isAuthenticated: !!user && !!token,
                isLoading,
                login,
                logout,
                refreshSubscription,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
