import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { DashboardStats } from '../../types/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { useTheme } from '../../context/ThemeContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { CheckCircle, XCircle, Award, Target, BookX, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
    const { isDark } = useTheme();
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get<DashboardStats>('/dashboard/stats');
            return data;
        },
    });

    if (isLoading || !stats) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 dark:text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
                    <p className="font-medium text-sm">Carregando métricas de desempenho...</p>
                </div>
            </AppLayout>
        );
    }

    const gridColor = isDark ? '#1E293B' : '#E2E8F0';
    const axisTextColor = isDark ? '#64748B' : '#94A3B8';
    const tooltipStyle = isDark
        ? { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '0.5rem' }
        : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', borderRadius: '0.5rem' };

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Painel de Desempenho</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Acompanhe sua taxa de retenção, precisão e evolução diária nos estudos.
                    </p>
                </div>

                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Respondidas</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.overview.answered}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Acertos</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.overview.correct}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Erros</p>
                            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.overview.incorrect}</p>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors duration-200">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Taxa de Precisão</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.overview.accuracy}%</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Evolução Diária */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Evolução de Resoluções (14 Dias)</h2>
                        <div className="h-64">
                            {stats.daily.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.daily}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="date" stroke={axisTextColor} fontSize={11} />
                                        <YAxis stroke={axisTextColor} fontSize={11} allowDecimals={false} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Line type="monotone" dataKey="correct" name="Acertos" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="incorrect" name="Erros" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                    Nenhuma resolução registrada nos últimos 14 dias.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Precisão por Disciplina */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Taxa de Acerto por Disciplina (%)</h2>
                        <div className="h-64">
                            {stats.disciplines.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.disciplines}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="name" stroke={axisTextColor} fontSize={10} interval={0} />
                                        <YAxis domain={[0, 100]} stroke={axisTextColor} fontSize={11} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Bar dataKey="accuracy" name="Precisão (%)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                                    Resolva questões para visualizar suas métricas por disciplina.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Caderno de Erros Rápido */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookX className="w-5 h-5 text-rose-500" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Caderno de Erros Recentes</h2>
                        </div>
                        <Link to="/errors" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
                            Ver caderno completo <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {stats.errors.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                                Nenhum erro pendente no momento. Excelente trabalho!
                            </div>
                        ) : (
                            stats.errors.map((q) => (
                                <div key={q.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{q.institution}</span>
                                        <span>•</span>
                                        <span className="text-blue-700 dark:text-blue-400">{q.discipline}</span>
                                        <span>•</span>
                                        <span>{q.topic}</span>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{q.statement}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
