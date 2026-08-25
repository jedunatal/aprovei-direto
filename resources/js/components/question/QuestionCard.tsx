import React, { useState } from 'react';
import { Question, AnswerResponse } from '../../types/api';
import api from '../../lib/axios';
import { CheckCircle2, XCircle, HelpCircle, BookOpen } from 'lucide-react';

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
                ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700';
        }

        const correctId = answerResult?.correct_option_id;
        if (correctId && optionId === correctId) {
            return 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium ring-1 ring-emerald-500';
        }

        if (selectedOptionId === optionId && !answerResult?.is_correct && !question.last_attempt?.is_correct) {
            return 'border-rose-500 bg-rose-50 text-rose-900 ring-1 ring-rose-500';
        }

        return 'border-slate-200 opacity-60 text-slate-500';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 transition-all">
            {/* Metadados / Cabeçalho */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                    {question.institution.name}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                    Ano: {question.year}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                    {question.discipline.name}
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md">
                    {question.topic.name}
                </span>
                <span className={`px-2.5 py-1 rounded-md capitalize ml-auto ${
                    question.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                    question.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>
                    Dificuldade: {question.difficulty}
                </span>
            </div>

            {/* Enunciado */}
            <div className="text-slate-800 leading-relaxed text-base mb-6 whitespace-pre-line font-normal">
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
                <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        {(answerResult?.is_correct ?? question.last_attempt?.is_correct) ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Parabéns! Você acertou a questão.</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                                <XCircle className="w-5 h-5" />
                                <span>Você errou. Esta questão foi adicionada ao seu Caderno de Erros.</span>
                            </div>
                        )}
                    </div>

                    {/* Comentário / Explicação */}
                    {(answerResult?.explanation) && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                Comentário Pedagógico
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {answerResult.explanation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};