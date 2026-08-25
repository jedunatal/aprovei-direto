import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../lib/axios';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { Upload, ArrowLeft, CheckCircle2, FileJson, AlertCircle, Loader2 } from 'lucide-react';

export const ImportQuestionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [importMode, setImportMode] = useState<'skip' | 'update' | 'upsert'>('skip');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Por favor, selecione um arquivo JSON ou NDJSON.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('import_mode', importMode);

        try {
            await api.post('/admin/questions/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/admin/questions/imports');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao enviar arquivo de importação.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/questions"
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Importar Questões em Massa</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                            Envie arquivos JSON ou NDJSON para processamento assíncrono em background.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* Área de Upload */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Arquivo de Questões</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                accept=".json,.ndjson,.jsonl,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                <FileJson className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-3" />
                                {file ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Clique para selecionar ou arraste o arquivo aqui
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Formatos aceitos: JSON, NDJSON ou JSONL (máx. 50MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Modo de Importação */}
                    <div>
                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                            Estratégia para Questões Duplicadas (External ID)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                importMode === 'skip'
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="skip"
                                    checked={importMode === 'skip'}
                                    onChange={() => setImportMode('skip')}
                                    className="hidden"
                                />
                                <span className="block font-bold text-xs">Ignorar Duplicadas</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                                    Não altera questões que já possuem o mesmo external_id.
                                </span>
                            </label>

                            <label className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                importMode === 'update'
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="update"
                                    checked={importMode === 'update'}
                                    onChange={() => setImportMode('update')}
                                    className="hidden"
                                />
                                <span className="block font-bold text-xs">Atualizar Existentes</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                                    Atualiza apenas questões já cadastradas com novo gabarito/texto.
                                </span>
                            </label>

                            <label className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                importMode === 'upsert'
                                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="upsert"
                                    checked={importMode === 'upsert'}
                                    onChange={() => setImportMode('upsert')}
                                    className="hidden"
                                />
                                <span className="block font-bold text-xs">Upsert (Inserir/Atualizar)</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                                    Cria questões novas e atualiza as duplicadas.
                                </span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || isLoading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enviando arquivo para o servidor...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Iniciar Importação em Massa
                            </>
                        )}
                    </button>
                </form>

                {/* Exemplo de Formato Aceito */}
                <div className="bg-slate-900 rounded-2xl p-5 text-slate-300 text-xs font-mono overflow-x-auto">
                    <p className="text-slate-400 font-bold mb-2">// Estrutura JSON / NDJSON esperada por questão:</p>
                    <pre>{`[
  {
    "external_id": "FGV-2026-TI-001",
    "discipline": "Tecnologia da Informação",
    "topic": "Banco de Dados",
    "institution": "FGV",
    "year": 2026,
    "difficulty": "medium",
    "statement": "Sobre índices B-Tree no MySQL, assinale...",
    "explanation": "Índices B-Tree permitem buscas em O(log N)...",
    "options": [
      { "letter": "A", "text": "Apenas suportam buscas exatas." },
      { "letter": "B", "text": "Permitem buscas por faixa e ordenação." }
    ],
    "correct_option": "B"
  }
]`}</pre>
                </div>
            </div>
        </AppLayout>
    );
};
