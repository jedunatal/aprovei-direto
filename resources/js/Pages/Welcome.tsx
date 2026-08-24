import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpenCheck, 
    CheckCircle2, 
    XCircle, 
    Sparkles, 
    TrendingUp, 
    ShieldCheck, 
    ArrowRight, 
    Layers, 
    Search,
    BrainCircuit,
    Award
} from 'lucide-react';

interface WelcomeProps {
    auth: {
        user: {
            name: string;
            email: string;
        } | null;
    };
}

export default function Welcome({ auth }: WelcomeProps) {
    // Estado interativo de demonstração da questão na landing page
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    const demoQuestion = {
        institution: 'FGV',
        year: '2026',
        discipline: 'Tecnologia da Informação',
        topic: 'Engenharia de Software',
        statement: 'No contexto de arquitetura de software e microsserviços, qual padrão é utilizado para gerenciar transações distribuídas garantindo a consistência eventual através de uma sequência de transações locais?',
        options: [
            { id: 'A', text: 'Circuit Breaker' },
            { id: 'B', text: 'Saga Pattern', correct: true },
            { id: 'C', text: 'API Gateway' },
            { id: 'D', text: 'Event Sourcing' },
        ],
        explanation: 'O padrão Saga coordena transações entre múltiplos microsserviços usando mensagens/eventos e transações de compensação em caso de falha.'
    };

    const handleAnswer = (optionId: string) => {
        if (hasAnswered) return;
        setSelectedOption(optionId);
        setHasAnswered(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
            <Head title="Aprovei Direto — Plataforma Inteligente de Questões" />

            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full" />
                <div className="absolute top-1/3 right-0 w-[500px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full" />
            </div>

            {/* Navbar */}
            <header className="relative z-20 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/80 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                            <BookOpenCheck className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                            Aprovei Direto
                        </span>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                            >
                                Meu Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                                >
                                    Criar Conta Grátis
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950 border border-indigo-800/80 text-indigo-300 shadow-inner">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Novo ecossistema de estudo ativo para concursos
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                        Treine com as questões certas e conquiste sua <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">a sua vaga</span>.
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        Filtros cirúrgicos por banca, comentários detalhados, controle automático de caderno de erros e análise de desempenho em tempo real.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            href={auth.user ? route('dashboard') : route('register')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25"
                        >
                            Começar Agora Gratuitamente
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href="#demo"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all"
                        >
                            Experimentar Questão Abaixo
                        </a>
                    </div>
                </div>

                {/* Métricas Rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-16 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
                    <div className="text-center p-2">
                        <div className="text-2xl sm:text-3xl font-black text-white">+150.000</div>
                        <div className="text-xs text-slate-400 mt-1">Questões Atualizadas</div>
                    </div>
                    <div className="text-center p-2">
                        <div className="text-2xl sm:text-3xl font-black text-indigo-400">100%</div>
                        <div className="text-xs text-slate-400 mt-1">Gabaritos Auditados</div>
                    </div>
                    <div className="text-center p-2">
                        <div className="text-2xl sm:text-3xl font-black text-white">Cebraspe / FGV / FCC</div>
                        <div className="text-xs text-slate-400 mt-1">Principais Bancas</div>
                    </div>
                    <div className="text-center p-2">
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400">PIX Imediato</div>
                        <div className="text-xs text-slate-400 mt-1">Liberação Automática</div>
                    </div>
                </div>

                {/* Demonstração Interativa da Resolução */}
                <div id="demo" className="max-w-3xl mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                            <BrainCircuit className="w-4 h-4 text-indigo-400" />
                            Teste a experiência do aluno agora:
                        </div>
                        <span className="text-xs text-slate-500">Simulação Interativa</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                        {/* Tags da Questão */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-950/80 border border-indigo-800/60 text-indigo-300">
                                {demoQuestion.institution}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                                {demoQuestion.year}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                                {demoQuestion.discipline}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/60 text-slate-400">
                                {demoQuestion.topic}
                            </span>
                        </div>

                        {/* Enunciado */}
                        <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
                            {demoQuestion.statement}
                        </p>

                        {/* Alternativas */}
                        <div className="space-y-2.5">
                            {demoQuestion.options.map((option) => {
                                const isSelected = selectedOption === option.id;
                                const isCorrect = option.correct;

                                let buttonStyles = 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300';

                                if (hasAnswered) {
                                    if (isCorrect) {
                                        buttonStyles = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200';
                                    } else if (isSelected && !isCorrect) {
                                        buttonStyles = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
                                    } else {
                                        buttonStyles = 'border-slate-800/50 bg-slate-950/30 text-slate-500 opacity-60';
                                    }
                                }

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        disabled={hasAnswered}
                                        className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left text-sm font-medium transition-all ${buttonStyles}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                hasAnswered && isCorrect 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : hasAnswered && isSelected 
                                                    ? 'bg-rose-500 text-white' 
                                                    : 'bg-slate-800 text-slate-300'
                                            }`}>
                                                {option.id}
                                            </span>
                                            <span>{option.text}</span>
                                        </div>

                                        {hasAnswered && isCorrect && (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        )}
                                        {hasAnswered && isSelected && !isCorrect && (
                                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Feedback e Justificativa */}
                        {hasAnswered && (
                            <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    {selectedOption === 'B' ? (
                                        <span className="text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Parabéns, você acertou!
                                        </span>
                                    ) : (
                                        <span className="text-rose-400 flex items-center gap-1.5">
                                            <XCircle className="w-4 h-4" /> Não foi dessa vez. Alternativa correta: B
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    <span className="font-semibold text-indigo-300 block mb-1">Comentário do Professor:</span>
                                    {demoQuestion.explanation}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid de Recursos */}
                <div className="grid md:grid-cols-3 gap-6 mt-24">
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Caderno de Erros Inteligente</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            O sistema isola automaticamente as questões erradas para você revisar até consolidar o conhecimento sem repetição inútil.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Estatísticas Reais de Precisão</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Acompanhe sua taxa de acerto por banca examinadora, disciplina e tópico específico para identificar pontos cegos.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg text-white">Foco Total na Prática</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Interface limpa, sem anúncios e com atalhos de teclado desenvolvidos para você resolver dezenas de questões em minutos.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4">
                    <p>© 2026 Aprovei Direto. Todos os direitos reservados. Preparação de alta performance para concursos.</p>
                </div>
            </footer>
        </div>
    );
}