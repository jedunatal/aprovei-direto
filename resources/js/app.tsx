import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { QuestionsPage } from './pages/Questions/QuestionsPage';
import { ErrorNotebookPage } from './pages/Questions/ErrorNotebookPage';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { AdminQuestionsListPage } from './pages/Admin/Questions/AdminQuestionsListPage';
import { ImportQuestionsPage } from './pages/Admin/Questions/ImportQuestionsPage';
import { ImportBatchesPage } from './pages/Admin/Questions/ImportBatchesPage';
import { QuestionFormPage } from './pages/Admin/Questions/QuestionFormPage';
import { QuestionReviewPage } from './pages/Admin/Questions/QuestionReviewPage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos de cache
            retry: 1,
        },
    },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; staffOnly?: boolean }> = ({ children, staffOnly = false }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-950">
                Carregando plataforma...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (staffOnly) {
        const isStaff = user?.roles?.some((r) => ['super_admin', 'admin', 'teacher'].includes(r)) ||
                        user?.permissions?.some((p) => ['questions.create', 'questions.import', 'questions.update'].includes(p));
        if (!isStaff) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export const App: React.FC = () => {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            
                            {/* Rotas de Alunos */}
                            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
                            <Route path="/errors" element={<ProtectedRoute><ErrorNotebookPage /></ProtectedRoute>} />

                            {/* Rotas de Backoffice / Admin */}
                            <Route path="/admin/questions" element={<ProtectedRoute staffOnly><AdminQuestionsListPage /></ProtectedRoute>} />
                            <Route path="/admin/questions/import" element={<ProtectedRoute staffOnly><ImportQuestionsPage /></ProtectedRoute>} />
                            <Route path="/admin/questions/imports" element={<ProtectedRoute staffOnly><ImportBatchesPage /></ProtectedRoute>} />
                            <Route path="/admin/questions/create" element={<ProtectedRoute staffOnly><QuestionFormPage /></ProtectedRoute>} />
                            <Route path="/admin/questions/:id/edit" element={<ProtectedRoute staffOnly><QuestionFormPage /></ProtectedRoute>} />
                            <Route path="/admin/questions/:id/review" element={<ProtectedRoute staffOnly><QuestionReviewPage /></ProtectedRoute>} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

const rootElement = document.getElementById('app');
if (rootElement) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}