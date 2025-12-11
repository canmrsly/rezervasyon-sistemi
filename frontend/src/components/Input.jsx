import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-base font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-4 text-base rounded-2xl border-2 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default Input;
