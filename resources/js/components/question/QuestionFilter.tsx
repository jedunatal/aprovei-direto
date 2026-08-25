import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Discipline, Institution } from '../../types/api';
import { Filter, RotateCcw } from 'lucide-react';

export interface FilterState {
    discipline_id?: number;
    topic_id?: number;
    institution_id?: number;
    difficulty?: string;
    year?: number;
    unanswered?: boolean;
}

interface QuestionFilterProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    onReset: () => void;
}

export const QuestionFilter: React.FC<QuestionFilterProps> = ({ filters, onChange, onReset }) => {
    const { data: disciplines } = useQuery<Discipline[]>({
        queryKey: ['disciplines'],
        queryFn: async () => {
            const { data } = await api.get<{ data: Discipline[] }>('/disciplines');
            return data.data;
        },
    });

    const { data: institutions } = useQuery<Institution[]>({
        queryKey: ['institutions'],
        queryFn: async () => {
            const { data } = await api.get<{ data: Institution[] }>('/institutions');
            return data.data;
        },
    });

    const selectedDiscipline = disciplines?.find((d) => d.id === filters.discipline_id);
    const availableTopics = selectedDiscipline?.topics || [];

    const handleDisciplineChange = (disciplineId: number | undefined) => {
        onChange({
            ...filters,
            discipline_id: disciplineId,
            topic_id: undefined, // Limpa tópico ao trocar de disciplina
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm mb-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                    <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Filtrar Questões</span>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Disciplina */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Disciplina</label>
                    <select
                        value={filters.discipline_id || ''}
                        onChange={(e) => handleDisciplineChange(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    >
                        <option value="">Todas as Disciplinas</option>
                        {disciplines?.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name} {d.questions_count ? `(${d.questions_count})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tópico / Assunto */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Assunto / Tópico</label>
                    <select
                        disabled={!filters.discipline_id || availableTopics.length === 0}
                        value={filters.topic_id || ''}
                        onChange={(e) => onChange({ ...filters, topic_id: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:opacity-40"
                    >
                        <option value="">Todos os Assuntos</option>
                        {availableTopics.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Banca Examinadora */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Banca Examinadora</label>
                    <select
                        value={filters.institution_id || ''}
                        onChange={(e) => onChange({ ...filters, institution_id: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    >
                        <option value="">Todas as Bancas</option>
                        {institutions?.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                                {inst.name} {inst.questions_count ? `(${inst.questions_count})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dificuldade */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Dificuldade</label>
                    <select
                        value={filters.difficulty || ''}
                        onChange={(e) => onChange({ ...filters, difficulty: e.target.value || undefined })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    >
                        <option value="">Todas as Dificuldades</option>
                        <option value="easy">Fácil</option>
                        <option value="medium">Média</option>
                        <option value="hard">Difícil</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={!!filters.unanswered}
                        onChange={(e) => onChange({ ...filters, unanswered: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Apenas questões não resolvidas</span>
                </label>
            </div>
        </div>
    );
};
