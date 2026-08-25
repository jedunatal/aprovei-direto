import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { QuestionImportBatch, QuestionImportError } from '../../../types/api';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { Link } from 'react-router-dom';
import { 
    Upload, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertTriangle, 
    Loader2, 
    X,
    FileText
} from 'lucide-react';

interface PaginatedBatches {
    data: QuestionImportBatch[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

export const ImportBatchesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

    const { data: batchesData, isLoading } = useQuery<PaginatedBatches>({
        queryKey: ['admin-import-batches'],
        queryFn: async () => {
            const res = await api.get<PaginatedBatches>('/admin/questions/imports');
            return res.data;
        },
        refetchInterval: (query) => {
            const hasActiveBatch = query.state.data?.data?.some(
                (b) => b.status === 'pending' || b.status === 'processing'
            );
            return hasActiveBatch ? 2500 : 15000;
        },
    });

    const { data: errorsData, isLoading: isLoadingErrors } = useQuery<{ data: QuestionImportError[] }>({
        queryKey: ['admin-import-errors', selectedBatchId],
        queryFn: async () => {
            if (!selectedBatchId) return { data: [] };
            const res = await api.get<{ data: QuestionImportError[] }>(`/admin/questions/imports/${selectedBatchId}/errors`);
            return res.data;
        },
        enabled: !!selectedBatchId,
    });

    const cancelMutation = useMutation({
        mutationFn: async (batchId: number) => {
            await api.post(`/admin/questions/imports/${batchId}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-import-batches'] });
        },
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-slate-400" />;
            default:
                return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/questions"
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lotes de Importação</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                Acompanhe o processamento e a taxa de sucesso das importações em massa.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/admin/questions/import"
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                        <Upload className="w-4 h-4" /> Nova Importação
                    </Link>
                </div>

                {/* Lista de Lotes */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                            <p className="text-sm font-medium">Carregando histórico de importações...</p>
                        </div>
                    ) : batchesData?.data && batchesData.data.length > 0 ? (
                        batchesData.data.map((batch) => (
                            <div
                                key={batch.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(batch.status)}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {batch.file_name}
                                                <span className="text-xs font-normal text-slate-400">
                                                    (#Lote {batch.id})
                                                </span>
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Enviado por {batch.user.name} • Modo: {batch.import_mode_label}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            batch.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                                            batch.status === 'processing' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' :
                                            batch.status === 'failed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}>
                                            {batch.status_label}
                                        </span>

                                        {batch.status === 'pending' && (
                                            <button
                                                onClick={() => cancelMutation.mutate(batch.id)}
                                                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Barra de Progresso */}
                                <div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        <span>Progresso: {batch.processed_records} de {batch.total_records} registros</span>
                                        <span>{batch.progress_percent}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div
                                            style={{ width: `${(batch.successful_records / Math.max(batch.total_records, 1)) * 100}%` }}
                                            className="bg-emerald-500 h-full transition-all duration-300"
                                        />
                                        <div
                                            style={{ width: `${(batch.failed_records / Math.max(batch.total_records, 1)) * 100}%` }}
                                            className="bg-rose-500 h-full transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                {/* Métricas do Lote */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                    <div>
                                        <span className="text-slate-400 block">Total</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{batch.total_records}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Sucesso</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{batch.successful_records}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Falhas / Erros</span>
                                        <span className="font-bold text-rose-600 dark:text-rose-400">{batch.failed_records}</span>
                                    </div>
                                    <div>
                                        {batch.failed_records > 0 && (
                                            <button
                                                onClick={() => setSelectedBatchId(batch.id)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold mt-3 flex items-center gap-1"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> Ver Detalhes dos Erros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                            <Upload className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-medium">Nenhum lote de importação registrado ainda.</p>
                        </div>
                    )}
                </div>

                {/* Modal de Erros de Importação */}
                {selectedBatchId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Relatório de Falhas (Lote #{selectedBatchId})
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedBatchId(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4 space-y-3">
                                {isLoadingErrors ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                                        <p className="text-xs">Carregando erros...</p>
                                    </div>
                                ) : errorsData?.data && errorsData.data.length > 0 ? (
                                    errorsData.data.map((err) => (
                                        <div key={err.id} className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs space-y-1">
                                            <div className="flex items-center justify-between font-bold text-rose-800 dark:text-rose-300">
                                                <span>Linha #{err.line_number} {err.external_id ? `(${err.external_id})` : ''}</span>
                                            </div>
                                            <p className="text-rose-700 dark:text-rose-400">{err.error_message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 text-xs py-8">Nenhum detalhe de erro encontrado.</p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                    onClick={() => setSelectedBatchId(null)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};
