import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { AdminQuestion } from '../../../types/api';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    Archive, 
    Edit, 
    BookOpen, 
    CheckCircle2, 
    Loader2,
    Clock,
    User,
    Calendar
} from 'lucide-react';

export const QuestionReviewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: questionData, isLoading } = useQuery<{ data: AdminQuestion }>({
        queryKey: ['admin-question-review', id],
        queryFn: async () => {
            const res = await api.get<{ data: AdminQuestion }>(`/admin/questions/${id}`);
            return res.data;
        },
    });

    const statusMutation = useMutation({
        mutationFn: async (status: string) => {
            return api.patch(`/admin/questions/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-question-review', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
    });

    if (isLoading || !questionData?.data) {
        return (
            <AppLayout>
                <div className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm">Carregando questão para curadoria...</p>
                </div>
            </AppLayout>
        );
    }

    const q = questionData.data;

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/questions"
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Curadoria de Questão</h1>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    Status Atual: {q.status_label}
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                Analise os dados, enunciado, alternativas e aprove para publicação no feed público.
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/admin/questions/${q.id}/edit`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                    >
                        <Edit className="w-4 h-4" /> Editar Conteúdo
                    </Link>
                </div>

                {/* Card de Detalhes da Questão */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* Metadados */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                            Banca: {q.institution.name}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                            Ano: {q.year}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-lg">
                            {q.discipline.name}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 rounded-lg">
                            {q.topic.name}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg capitalize ml-auto">
                            Dificuldade: {q.difficulty}
                        </span>
                    </div>

                    {/* Enunciado */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Enunciado</h3>
                        <p className="text-base text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                            {q.statement}
                        </p>
                    </div>

                    {/* Alternativas */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Alternativas</h3>
                        <div className="space-y-2.5">
                            {q.options.map((opt) => {
                                const isCorrect = opt.id === q.correct_option_id;
                                return (
                                    <div
                                        key={opt.id}
                                        className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                                            isCorrect
                                                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                            isCorrect
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                        }`}>
                                            {opt.letter}
                                        </span>
                                        <span className="flex-1 text-sm leading-relaxed">{opt.text}</span>
                                        {isCorrect && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="w-4 h-4" /> Gabarito
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comentário Pedagógico */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            Comentário Pedagógico
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {q.explanation}
                        </p>
                    </div>

                    {/* Informações de Auditoria */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Criado por: <strong className="text-slate-700 dark:text-slate-300">{q.created_by?.name || 'Sistema'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Cadastrado em: {new Date(q.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>

                {/* Barra de Ações de Curadoria */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Alterar Status Editorial:</span>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => statusMutation.mutate('draft')}
                            disabled={statusMutation.isPending || q.status === 'draft'}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
                        >
                            Salvar como Rascunho
                        </button>

                        <button
                            onClick={() => statusMutation.mutate('review')}
                            disabled={statusMutation.isPending || q.status === 'review'}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                        >
                            Enviar para Revisão
                        </button>

                        <button
                            onClick={() => statusMutation.mutate('rejected')}
                            disabled={statusMutation.isPending || q.status === 'rejected'}
                            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Rejeitar
                        </button>

                        <button
                            onClick={() => statusMutation.mutate('published')}
                            disabled={statusMutation.isPending || q.status === 'published'}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar e Publicar
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};
