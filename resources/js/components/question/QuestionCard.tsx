import React, { useState } from 'react';
import { Question, AnswerResponse } from '../../types/api';
import api from '../../lib/axios';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';

interface QuestionCardProps {
    question: Question;
    onAnswered?: (result: AnswerResponse) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswered }) => {
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
        question.last_attempt ? question.last_attempt.selected_option_id : null
    );
    const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAnswered = !!answerResult || !!question.last_attempt;

    const handleAnswer = async () => {
        if (!selectedOptionId || isSubmitting || isAnswered) return;
        setIsSubmitting(true);

        try {
            const { data } = await api.post<AnswerResponse>(`/questions/${question.id}/answer`, {
                selected_option_id: selectedOptionId,
            });
            setAnswerResult(data);
            if (onAnswered) onAnswered(data);
        } catch (error) {
            console.error('Erro ao submeter resposta:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getOptionStyle = (optionId: number) => {
        if (!isAnswered) {
            return selectedOptionId === optionId
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200';
        }

        const correctId = answerResult?.correct_option_id;
        if (correctId && optionId === correctId) {
            return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500';
        }

        if (selectedOptionId === optionId && !answerResult?.is_correct && !question.last_attempt?.is_correct) {
            return 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500';
        }

        return 'border-slate-200 dark:border-slate-800/80 opacity-60 text-slate-500 dark:text-slate-500';
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6 transition-colors duration-200">
            {/* Metadados / Cabeçalho */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                    {question.institution.name}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                    Ano: {question.year}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-md">
                    {question.discipline.name}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 rounded-md">
                    {question.topic.name}
                </span>
                <span className={`px-2.5 py-1 rounded-md capitalize ml-auto ${
                    question.difficulty === 'easy'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : question.difficulty === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                }`}>
                    Dificuldade: {question.difficulty}
                </span>
            </div>

            {/* Enunciado */}
            <div className="text-slate-800 dark:text-slate-100 leading-relaxed text-base mb-6 whitespace-pre-line font-normal">
                {question.statement}
            </div>

            {/* Lista de Alternativas */}
            <div className="space-y-3 mb-6">
                {question.options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => setSelectedOptionId(option.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3 ${getOptionStyle(option.id)}`}
                    >
                        <span className="flex-shrink-0 w-7 h-7 rounded-full border border-current flex items-center justify-center font-bold text-xs mt-0.5">
                            {option.letter}
                        </span>
                        <span className="flex-1 text-sm leading-relaxed">{option.text}</span>
                    </button>
                ))}
            </div>

            {/* Ações */}
            {!isAnswered ? (
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleAnswer}
                        disabled={!selectedOptionId || isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-sm transition-all"
                    >
                        {isSubmitting ? 'Verificando...' : 'Responder Questão'}
                    </button>
                </div>
            ) : (
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        {(answerResult?.is_correct ?? question.last_attempt?.is_correct) ? (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Parabéns! Você acertou a questão.</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                                <XCircle className="w-5 h-5" />
                                <span>Você errou. Esta questão foi adicionada ao seu Caderno de Erros.</span>
                            </div>
                        )}
                    </div>

                    {/* Comentário Pedagógico */}
                    {(answerResult?.explanation) && (
                        <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg p-4 mt-3">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-xs mb-1.5">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Comentário Pedagógico
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                {answerResult.explanation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};