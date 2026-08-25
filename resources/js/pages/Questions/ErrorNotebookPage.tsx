import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Question } from '../../types/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { QuestionCard } from '../../components/question/QuestionCard';
import { BookX, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaginatedResponse {
    data: Question[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

export const ErrorNotebookPage: React.FC = () => {
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching, refetch } = useQuery<PaginatedResponse>({
        queryKey: ['error-notebook', page],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse>(`/questions/errors?page=${page}`);
            return response.data;
        },
    });

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <BookX className="w-6 h-6 text-rose-600" />
                        Caderno de Erros
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Refaça as questões que você errou nos simulados e exercícios para fixar os pontos fracos.
                    </p>
                </div>

                {/* Banner de Orientações */}
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-900 leading-relaxed">
                        <span className="font-bold">Como funciona:</span> Sempre que você erra uma questão, ela é automaticamente enviada para cá. Assim que você refizer e acertar, ela será removida do seu caderno de erros.
                    </div>
                </div>

                {/* Total de Erros Pendentes */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                        {data?.meta?.total !== undefined
                            ? `${data.meta.total} questão(ões) pendente(s) para revisão`
                            : 'Verificando caderno de erros...'}
                    </span>
                    {isFetching && (
                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Atualizando...
                        </span>
                    )}
                </div>

                {/* Lista de Questões no Caderno de Erros */}
                {isLoading ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-600" />
                        <p className="font-medium text-sm">Carregando seu caderno de erros...</p>
                    </div>
                ) : data?.data && data.data.length > 0 ? (
                    <div>
                        {data.data.map((question) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                onAnswered={() => refetch()}
                            />
                        ))}

                        {/* Paginação */}
                        {data.meta.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 mt-6">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1 || isFetching}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </button>

                                <span className="text-sm font-semibold text-slate-700">
                                    Página {data.meta.current_page} de {data.meta.last_page}
                                </span>

                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, data.meta.last_page))}
                                    disabled={page === data.meta.last_page || isFetching}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Próxima <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white border border-emerald-200 rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">Caderno de Erros Limpo!</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                            Você não possui nenhuma questão pendente de revisão. Continue resolvendo questões no banco para manter sua preparação afiada!
                        </p>
                        <Link
                            to="/questions"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                        >
                            Ir para o Banco de Questões
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};
