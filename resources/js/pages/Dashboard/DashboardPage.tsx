import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { DashboardStats } from '../../types/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { CheckCircle, XCircle, Award, Target, BookX, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
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
                <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="font-medium text-sm">Carregando métricas de desempenho...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Painel de Desempenho</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Acompanhe sua taxa de retenção, precisão e evolução diária nos estudos.
                    </p>
                </div>

                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Total Respondidas</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.overview.answered}</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Target className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Acertos</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.overview.correct}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Erros</p>
                            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.overview.incorrect}</p>
                        </div>
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold uppercase">Taxa de Precisão</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.overview.accuracy}%</p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Evolução Diária */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900 mb-4">Evolução de Resoluções (14 Dias)</h2>
                        <div className="h-64">
                            {stats.daily.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.daily}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                                        <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="correct" name="Acertos" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="incorrect" name="Erros" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    Nenhuma resolução registrada nos últimos 14 dias.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Precisão por Disciplina */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-base font-bold text-slate-900 mb-4">Taxa de Acerto por Disciplina (%)</h2>
                        <div className="h-64">
                            {stats.disciplines.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.disciplines}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} interval={0} />
                                        <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                                        <Tooltip />
                                        <Bar dataKey="accuracy" name="Precisão (%)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    Resolva questões para visualizar suas métricas por disciplina.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Caderno de Erros Rápido */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookX className="w-5 h-5 text-rose-500" />
                            <h2 className="text-base font-bold text-slate-900">Caderno de Erros Recentes</h2>
                        </div>
                        <Link to="/errors" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold">
                            Ver caderno completo <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {stats.errors.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Nenhum erro pendente no momento. Excelente trabalho!
                            </div>
                        ) : (
                            stats.errors.map((q) => (
                                <div key={q.id} className="p-5 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                                        <span className="font-bold text-slate-700">{q.institution}</span>
                                        <span>•</span>
                                        <span className="text-blue-700">{q.discipline}</span>
                                        <span>•</span>
                                        <span>{q.topic}</span>
                                    </div>
                                    <p className="text-slate-800 text-sm line-clamp-2">{q.statement}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
