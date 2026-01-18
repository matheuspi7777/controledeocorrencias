import * as React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            border: 'border-red-600',
            icon: 'fa-triangle-exclamation',
            iconBg: 'bg-red-900/20 text-red-600 border-red-900/30',
            confirmBtn: 'bg-red-600 text-white'
        },
        warning: {
            border: 'border-amber-500',
            icon: 'fa-exclamation-circle',
            iconBg: 'bg-amber-900/20 text-amber-500 border-amber-900/30',
            confirmBtn: 'bg-amber-500 text-white'
        },
        info: {
            border: 'border-blue-500',
            icon: 'fa-info-circle',
            iconBg: 'bg-blue-900/20 text-blue-500 border-blue-900/30',
            confirmBtn: 'bg-blue-500 text-white'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel}></div>
            <div className={`relative bg-[#0f172a] rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border-t-8 ${styles.border} border-x border-b border-slate-800`}>
                <div className={`w-14 h-14 lg:w-16 lg:h-16 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 border`}>
                    <i className={`fa-solid ${styles.icon} text-xl lg:text-2xl`}></i>
                </div>
                <h3 className="text-lg lg:text-xl font-black text-center text-white mb-2 uppercase tracking-tight">{title}</h3>
                <p className="text-slate-400 text-center mb-6 lg:mb-8 font-medium text-sm">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 font-black rounded-xl text-[10px] uppercase hover:bg-slate-700 transition-colors">{cancelText}</button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-3 ${styles.confirmBtn} font-black rounded-xl text-[10px] uppercase hover:opacity-90 transition-opacity`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
