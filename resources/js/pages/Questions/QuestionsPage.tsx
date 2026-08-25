import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Question } from '../../types/api';
import { AppLayout } from '../../components/Layout/AppLayout';
import { QuestionCard } from '../../components/question/QuestionCard';
import { QuestionFilter, FilterState } from '../../components/question/QuestionFilter';
import { ChevronLeft, ChevronRight, HelpCircle, Loader2 } from 'lucide-react';

interface PaginatedResponse {
    data: Question[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    links: {
        prev: string | null;
        next: string | null;
    };
}

export const QuestionsPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>({});

    const { data, isLoading, isFetching, refetch } = useQuery<PaginatedResponse>({
        queryKey: ['questions', page, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (filters.discipline_id) params.append('discipline_id', filters.discipline_id.toString());
            if (filters.topic_id) params.append('topic_id', filters.topic_id.toString());
            if (filters.institution_id) params.append('institution_id', filters.institution_id.toString());
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.year) params.append('year', filters.year.toString());
            if (filters.unanswered) params.append('unanswered', '1');

            const response = await api.get<PaginatedResponse>(`/questions?${params.toString()}`);
            return response.data;
        },
    });

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPage(1); // Reinicia para a página 1 ao alterar filtros
    };

    const handleResetFilters = () => {
        setFilters({});
        setPage(1);
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Banco de Questões
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Pratique com milhares de questões reais de concursos públicos comentadas.
                    </p>
                </div>

                {/* Filtros de Busca */}
                <QuestionFilter
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleResetFilters}
                />

                {/* Feedback de Carregamento e Total de Resultados */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span>
                        {data?.meta?.total !== undefined
                            ? `Exibindo ${data.data.length} de ${data.meta.total} questões encontradas`
                            : 'Buscando questões...'}
                    </span>
                    {isFetching && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Atualizando...
                        </span>
                    )}
                </div>

                {/* Lista de Questões */}
                {isLoading ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 dark:text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                        <p className="font-medium text-sm">Carregando questões do banco de dados...</p>
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
                            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mt-6">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1 || isFetching}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Anterior
                                </button>

                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Página {data.meta.current_page} de {data.meta.last_page}
                                </span>

                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, data.meta.last_page))}
                                    disabled={page === data.meta.last_page || isFetching}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                                >
                                    Próxima <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
                        <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Nenhuma questão encontrada</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Tente ajustar ou limpar os filtros de disciplina, banca ou dificuldade.
                        </p>
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                            Limpar Todos os Filtros
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};
