import React from 'react';

const FormInput = ({ label, id, type = 'text', placeholder, value, onChange, size = 'md', className = '', required = false, hasError = false, leftIcon, children }) => {
    const hasSuffix = !!children;
    const hasPrefix = !!leftIcon;
    const sizeClasses = {
        md: `py-2.5 text-sm ${hasPrefix ? 'pl-11' : 'pl-4'} ${hasSuffix ? 'pr-11' : 'pr-4'}`,
        sm: `py-2 text-sm ${hasPrefix ? 'pl-9' : 'pl-3'} ${hasSuffix ? 'pr-9' : 'pr-3'}`
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className={`font-bold uppercase tracking-wider text-slate-400 block mb-1 ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'}`} htmlFor={id}>
                    {label}
                </label>
            )}
            <div className="relative w-full group">
                {leftIcon && (
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-scholarly-primary transition-colors ${size === 'sm' ? 'left-3' : 'left-4'}`}>
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    id={id}
                    className={`w-full bg-white border rounded-xl 
                        focus:bg-white focus:ring-2 focus:ring-scholarly-primary/10 focus:border-scholarly-primary 
                        text-slate-800 font-medium outline-none transition-all duration-200 ${sizeClasses[size]} ${
                            hasError ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'
                        }`}
                    placeholder={placeholder || label}
                    value={value}
                    onChange={onChange}
                />
                {children && (
                    <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-scholarly-primary transition-colors ${size === 'sm' ? 'right-3' : 'right-4'}`}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormInput;