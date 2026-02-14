import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => (
  <div
    className={`rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-neutral-900/80 p-6 transition-all duration-200 ${
      hover ? 'hover:shadow-float hover:border-neutral-200 dark:hover:border-neutral-700 hover:-translate-y-0.5' : 'shadow-soft'
    } ${className}`}
  >
    {children}
  </div>
);

type PanelAccent = 'blue' | 'purple' | 'green' | 'orange' | 'none';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  accent?: PanelAccent;
  title?: string;
  description?: string;
}

const accentStyles: Record<PanelAccent, string> = {
  blue: 'border-l-4 border-l-clay-blue bg-blue-50/50 dark:bg-clay-blue/10 dark:border-l-clay-blue',
  purple: 'border-l-4 border-l-clay-purple bg-purple-50/50 dark:bg-clay-purple/10 dark:border-l-clay-purple',
  green: 'border-l-4 border-l-clay-green bg-green-50/50 dark:bg-clay-green/10 dark:border-l-clay-green',
  orange: 'border-l-4 border-l-clay-orange bg-orange-50/50 dark:bg-clay-orange/10 dark:border-l-clay-orange',
  none: '',
};

export const Panel: React.FC<PanelProps> = ({ children, className = '', accent = 'none', title, description }) => (
  <div className={`rounded-2xl sm:rounded-3xl border border-border dark:border-border-dark bg-white dark:bg-neutral-900/90 shadow-float overflow-hidden transition-shadow duration-200 hover:shadow-float-lg ${accentStyles[accent]} ${className}`}>
    {(title || description) && (
      <div className="px-5 sm:px-6 py-5 sm:py-6 border-b border-border dark:border-border-dark bg-white/50 dark:bg-transparent">
        {title && <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{title}</h3>}
        {description && <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">{description}</p>}
      </div>
    )}
    <div className="p-5 sm:p-6">{children}</div>
  </div>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode | null;
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, children, className = '' }) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">{title}</h3>
    {description != null && (
      <div className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">{description}</div>
    )}
    {children}
  </div>
);

interface DataTableProps {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, React.ReactNode>[];
  emptyMessage?: string;
  onRowAction?: (rowIndex: number) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({ columns, rows, emptyMessage = 'No data', onRowAction }) => (
  <div className="overflow-hidden rounded-lg sm:rounded-xl border border-border dark:border-border-dark bg-white dark:bg-neutral-900/80 -mx-1 sm:mx-0">
    <div className="overflow-x-auto overflow-y-visible">
      <table className="w-full min-w-[320px] sm:min-w-[500px]">
        <thead>
          <tr className="border-b border-border dark:border-border-dark bg-neutral-50 dark:bg-neutral-800/80">
            {columns.map((col) => (
              <th key={col.key} className={`text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-3 sm:px-5 py-3 sm:py-4 ${col.className ?? ''}`}>
                {col.label}
              </th>
            ))}
            {onRowAction && <th className="w-14 sm:w-20 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-3 sm:px-5 py-3 sm:py-4">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-border-dark">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onRowAction ? 1 : 0)} className="px-3 sm:px-5 py-8 sm:py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors animate-slide-up-sm" style={{ animationDelay: `${i * 40}ms` }}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 sm:px-5 py-3 sm:py-4 text-sm text-neutral-800 dark:text-neutral-200 ${col.className ?? ''}`}>
                    {row[col.key]}
                  </td>
                ))}
                {onRowAction && (
                  <td className="px-3 sm:px-5 py-3 sm:py-4 text-right opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {onRowAction(i)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false }) => {
  const base = 'rounded-xl font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]';
  const variants = {
    primary: 'bg-clay-black hover:bg-neutral-800 text-white shadow-soft hover:shadow-soft-lg focus-visible:ring-neutral-500 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 dark:focus-visible:ring-neutral-400',
    secondary: 'bg-white dark:bg-neutral-800 border border-border dark:border-border-dark text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus-visible:ring-neutral-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500',
    success: 'bg-primary-600 hover:bg-primary-700 text-white focus-visible:ring-primary-500',
    ghost: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:ring-neutral-400'
  };
  const sizes = { sm: 'px-3 py-2.5 text-sm min-h-[40px]', md: 'px-5 py-3 text-sm min-h-[44px]', lg: 'px-6 py-3.5 text-base min-h-[48px]' };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} touch-manipulation ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

interface InputProps {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, type = 'text', value, onChange, placeholder, required = false, min, step, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label} {required && <span className="text-red-500">*</span>}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} step={step} className="rounded-xl border border-border dark:border-border-dark bg-white dark:bg-neutral-800 px-4 py-2.5 min-h-[44px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all touch-manipulation" />
  </div>
);

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, required = false, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label} {required && <span className="text-red-500">*</span>}</label>}
    <select value={value} onChange={onChange} required={required} className="rounded-xl border border-border dark:border-border-dark bg-white dark:bg-neutral-800 pl-4 pr-10 py-2.5 min-h-[44px] text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 cursor-pointer transition-all appearance-none bg-[length:18px] bg-[right_12px_center] bg-no-repeat touch-manipulation" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")" }}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, placeholder, rows = 3, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {label && <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</label>}
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="rounded-xl border border-border dark:border-border-dark bg-white dark:bg-neutral-800 px-4 py-2.5 min-h-[88px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none transition-all touch-manipulation" />
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-neutral-900/50 backdrop-blur-sm animate-fade-in" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-3xl border border-border dark:border-border-dark shadow-float-lg w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="sticky top-0 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border dark:border-border-dark bg-white dark:bg-neutral-900 z-10 shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate pr-2">{title}</h2>
          <button type="button" onClick={onClose} className="p-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation" aria-label="Close">×</button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
};
