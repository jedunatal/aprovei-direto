import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { AdminQuestion, Discipline, Institution } from '../../../types/api';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { Link } from 'react-router-dom';
import { 
    Plus, 
    Upload, 
    Search, 
    Filter, 
    Edit, 
    CheckSquare, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    History
} from 'lucide-react';

interface PaginatedAdminQuestions {
    data: AdminQuestion[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

export const AdminQuestionsListPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');
    const [disciplineFilter, setDisciplineFilter] = useState('');

    const { data: disciplines } = useQuery<Discipline[]>({
        queryKey: ['disciplines'],
        queryFn: async () => {
            const res = await api.get<{ data: Discipline[] }>('/disciplines');
            return res.data.data;
        },
    });

    const { data, isLoading, isFetching } = useQuery<PaginatedAdminQuestions>({
        queryKey: ['admin-questions', page, search, statusFilter, difficultyFilter, disciplineFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (difficultyFilter) params.append('difficulty', difficultyFilter);
            if (disciplineFilter) params.append('discipline_id', disciplineFilter);

            const res = await api.get<PaginatedAdminQuestions>(`/admin/questions?${params.toString()}`);
            return res.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/admin/questions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
        },
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta questão permanentemente?')) {
            deleteMutation.mutate(id);
        }
    };

    const getStatusBadge = (status: string, label: string) => {
        switch (status) {
            case 'published':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">{label}</span>;
            case 'review':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">{label}</span>;
            case 'draft':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{label}</span>;
            case 'rejected':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">{label}</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{label}</span>;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header de Ações */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestão de Questões</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Curadoria, cadastro, aprovação e importação de questões do banco.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/admin/questions/imports"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                        >
                            <History className="w-4 h-4" /> Histórico de Importações
                        </Link>
                        <Link
                            to="/admin/questions/import"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        >
                            <Upload className="w-4 h-4" /> Importar JSON
                        </Link>
                        <Link
                            to="/admin/questions/create"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Nova Questão
                        </Link>
                    </div>
                </div>

                {/* Barra de Filtros e Busca */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Buscar por enunciado ou ID externo..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                        <option value="">Todos os Status</option>
                        <option value="published">Publicada</option>
                        <option value="review">Em Revisão</option>
                        <option value="draft">Rascunho</option>
                        <option value="approved">Aprovada</option>
                        <option value="rejected">Rejeitada</option>
                        <option value="archived">Arquivada</option>
                    </select>

                    <select
                        value={disciplineFilter}
                        onChange={(e) => { setDisciplineFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                        <option value="">Todas as Disciplinas</option>
                        {disciplines?.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>

                    <select
                        value={difficultyFilter}
                        onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                        <option value="">Todas as Dificuldades</option>
                        <option value="easy">Fácil</option>
                        <option value="medium">Média</option>
                        <option value="hard">Difícil</option>
                    </select>
                </div>

                {/* Tabela de Questões */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                            <p className="text-sm font-medium">Carregando catálogo administrativo...</p>
                        </div>
                    ) : data?.data && data.data.length > 0 ? (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                        <tr>
                                            <th className="px-4 py-3">ID / Ext</th>
                                            <th className="px-4 py-3">Disciplina / Tópico</th>
                                            <th className="px-4 py-3">Banca / Ano</th>
                                            <th className="px-4 py-3">Enunciado</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.data.map((q) => (
                                            <tr key={q.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                                                    #{q.id}
                                                    {q.external_id && (
                                                        <span className="block text-[10px] font-normal text-slate-400">{q.external_id}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{q.discipline.name}</span>
                                                    <span className="block text-[11px] text-slate-400">{q.topic.name}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{q.institution.name}</span>
                                                    <span className="block text-[11px] text-slate-400">{q.year}</span>
                                                </td>
                                                <td className="px-4 py-3 max-w-md">
                                                    <p className="line-clamp-2 text-slate-800 dark:text-slate-200">{q.statement}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(q.status, q.status_label)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            to={`/admin/questions/${q.id}/review`}
                                                            title="Revisar e Publicar"
                                                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                                                        >
                                                            <CheckSquare className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/questions/${q.id}/edit`}
                                                            title="Editar Questão"
                                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(q.id)}
                                                            title="Excluir Questão"
                                                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            {data.meta.last_page > 1 && (
                                <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                        disabled={page === 1 || isFetching}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                                    </button>

                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        Página {data.meta.current_page} de {data.meta.last_page} (Total: {data.meta.total})
                                    </span>

                                    <button
                                        onClick={() => setPage((p) => Math.min(p + 1, data.meta.last_page))}
                                        disabled={page === data.meta.last_page || isFetching}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
                                    >
                                        Próxima <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <p className="text-sm font-medium">Nenhuma questão encontrada com os filtros selecionados.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};
