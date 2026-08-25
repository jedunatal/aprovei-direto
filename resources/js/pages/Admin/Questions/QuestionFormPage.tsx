import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { Discipline, Institution, AdminQuestion } from '../../../types/api';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { ArrowLeft, Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';

export const QuestionFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [externalId, setExternalId] = useState('');
    const [disciplineId, setDisciplineId] = useState<number | ''>('');
    const [topicId, setTopicId] = useState<number | ''>('');
    const [institutionId, setInstitutionId] = useState<number | ''>('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [status, setStatus] = useState<string>('published');
    const [statement, setStatement] = useState('');
    const [explanation, setExplanation] = useState('');
    const [correctOption, setCorrectOption] = useState('A');
    const [options, setOptions] = useState<Array<{ letter: string; text: string }>>([
        { letter: 'A', text: '' },
        { letter: 'B', text: '' },
        { letter: 'C', text: '' },
        { letter: 'D', text: '' },
        { letter: 'E', text: '' },
    ]);
    const [error, setError] = useState<string | null>(null);

    const { data: disciplines } = useQuery<Discipline[]>({
        queryKey: ['disciplines'],
        queryFn: async () => {
            const res = await api.get<{ data: Discipline[] }>('/disciplines');
            return res.data.data;
        },
    });

    const { data: institutions } = useQuery<Institution[]>({
        queryKey: ['institutions'],
        queryFn: async () => {
            const res = await api.get<{ data: Institution[] }>('/institutions');
            return res.data.data;
        },
    });

    const selectedDiscipline = disciplines?.find((d) => d.id === disciplineId);
    const availableTopics = selectedDiscipline?.topics || [];

    const { data: questionData, isLoading: isLoadingQuestion } = useQuery<{ data: AdminQuestion }>({
        queryKey: ['admin-question', id],
        queryFn: async () => {
            const res = await api.get<{ data: AdminQuestion }>(`/admin/questions/${id}`);
            return res.data;
        },
        enabled: isEditMode,
    });

    useEffect(() => {
        if (questionData?.data) {
            const q = questionData.data;
            setExternalId(q.external_id || '');
            setDisciplineId(q.discipline.id);
            setTopicId(q.topic.id);
            setInstitutionId(q.institution.id);
            setYear(q.year);
            setDifficulty(q.difficulty);
            setStatus(q.status);
            setStatement(q.statement);
            setExplanation(q.explanation);
            if (q.options && q.options.length > 0) {
                setOptions(q.options.map((o) => ({ letter: o.letter, text: o.text })));
            }
            if (q.correct_option_letter) {
                setCorrectOption(q.correct_option_letter);
            }
        }
    }, [questionData]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            if (isEditMode) {
                return api.put(`/admin/questions/${id}`, payload);
            }
            return api.post('/admin/questions', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
            navigate('/admin/questions');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao salvar a questão. Verifique os campos.');
        },
    });

    const handleOptionTextChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        if (options.length >= 5) return;
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const nextLetter = letters[options.length];
        setOptions([...options, { letter: nextLetter, text: '' }]);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        // Reatribuir letras
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const relettered = newOptions.map((opt, i) => ({ ...opt, letter: letters[i] }));
        setOptions(relettered);
        if (correctOption === options[index].letter) {
            setCorrectOption(relettered[0].letter);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!disciplineId || !topicId || !institutionId) {
            setError('Selecione Disciplina, Tópico e Banca Examinadora.');
            return;
        }

        const emptyOption = options.find((o) => !o.text.trim());
        if (emptyOption) {
            setError(`Preencha o texto da alternativa ${emptyOption.letter}.`);
            return;
        }

        mutation.mutate({
            external_id: externalId || null,
            discipline_id: disciplineId,
            topic_id: topicId,
            institution_id: institutionId,
            year: Number(year),
            difficulty,
            status,
            statement,
            explanation,
            options,
            correct_option: correctOption,
        });
    };

    if (isEditMode && isLoadingQuestion) {
        return (
            <AppLayout>
                <div className="p-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm">Carregando dados da questão...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/questions"
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isEditMode ? 'Editar Questão' : 'Nova Questão'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            Preencha os metadados, enunciado, alternativas e comentário pedagógico.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Metadados */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Classificação e Metadados</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Disciplina *</label>
                                <select
                                    required
                                    value={disciplineId}
                                    onChange={(e) => {
                                        setDisciplineId(e.target.value ? Number(e.target.value) : '');
                                        setTopicId('');
                                    }}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                                >
                                    <option value="">Selecione a disciplina</option>
                                    {disciplines?.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tópico / Assunto *</label>
                                <select
                                    required
                                    disabled={!disciplineId || availableTopics.length === 0}
                                    value={topicId}
                                    onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none disabled:opacity-40"
                                >
                                    <option value="">Selecione o tópico</option>
                                    {availableTopics.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Banca Examinadora *</label>
                                <select
                                    required
                                    value={institutionId}
                                    onChange={(e) => setInstitutionId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                                >
                                    <option value="">Selecione a banca</option>
                                    {institutions?.map((inst) => (
                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Ano *</label>
                                <input
                                    type="number"
                                    required
                                    min="1970"
                                    max="2099"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dificuldade</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                                >
                                    <option value="easy">Fácil</option>
                                    <option value="medium">Média</option>
                                    <option value="hard">Difícil</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Editorial</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                                >
                                    <option value="draft">Rascunho</option>
                                    <option value="review">Em Revisão</option>
                                    <option value="approved">Aprovada</option>
                                    <option value="published">Publicada</option>
                                    <option value="rejected">Rejeitada</option>
                                    <option value="archived">Arquivada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ID Externo (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: FGV-2026-001"
                                    value={externalId}
                                    onChange={(e) => setExternalId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Enunciado */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2">
                        <label className="block text-sm font-bold text-slate-900 dark:text-white">Enunciado da Questão *</label>
                        <textarea
                            required
                            rows={6}
                            value={statement}
                            onChange={(e) => setStatement(e.target.value)}
                            placeholder="Digite ou cole o texto completo da questão aqui..."
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Alternativas */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alternativas de Resposta</h3>
                                <p className="text-xs text-slate-400">Marque a alternativa correta como gabarito.</p>
                            </div>

                            {options.length < 5 && (
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar Alternativa
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {options.map((opt, index) => (
                                <div key={opt.letter} className="flex items-start gap-3">
                                    <label className="flex items-center gap-2 pt-2.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={correctOption === opt.letter}
                                            onChange={() => setCorrectOption(opt.letter)}
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                                            {opt.letter}
                                        </span>
                                    </label>

                                    <textarea
                                        rows={2}
                                        required
                                        value={opt.text}
                                        onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                        placeholder={`Texto da alternativa ${opt.letter}...`}
                                        className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />

                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors mt-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comentário Pedagógico */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-2">
                        <label className="block text-sm font-bold text-slate-900 dark:text-white">Comentário do Professor (Explicação) *</label>
                        <textarea
                            required
                            rows={4}
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Explique detalhadamente por que o gabarito está correto e aponte os erros das demais alternativas..."
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3">
                        <Link
                            to="/admin/questions"
                            className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? 'Atualizar Questão' : 'Cadastrar Questão'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};
