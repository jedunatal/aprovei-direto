import React, { useState } from 'react';
import { PixCheckoutData } from '../../types/api';
import api from '../../lib/axios';
import { Copy, Check, QrCode, X } from 'lucide-react';

interface PixCheckoutModalProps {
    plan: 'monthly' | 'annual';
    onClose: () => void;
    onSuccess?: () => void;
}

export const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({ plan, onClose }) => {
    const [checkout, setCheckout] = useState<PixCheckoutData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCreatePix = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post<PixCheckoutData>('/subscriptions/checkout', { plan });
            setCheckout(data);
        } catch (error) {
            console.error('Falha ao gerar Pix', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!checkout) return;
        navigator.clipboard.writeText(checkout.copy_and_paste);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative transition-colors duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assinatura Premium</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {plan === 'annual' ? 'Plano Anual - R$ 199,90' : 'Plano Mensal - R$ 29,90'}
                    </p>
                </div>

                {!checkout ? (
                    <div className="text-center py-4">
                        <button
                            onClick={handleCreatePix}
                            disabled={isLoading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <QrCode className="w-5 h-5" />
                            {isLoading ? 'Gerando QR Code...' : 'Gerar Chave PIX'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 text-center">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl inline-block border border-slate-200 dark:border-slate-700">
                            <img src={checkout.qr_code} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">PIX Copia e Cola:</p>
                            <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <input
                                    readOnly
                                    value={checkout.copy_and_paste}
                                    className="text-xs bg-transparent w-full text-slate-700 dark:text-slate-300 focus:outline-none truncate"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            Após realizar o pagamento no aplicativo do seu banco, a liberação ocorre automaticamente em segundos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
