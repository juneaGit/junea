'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface AIButtonProps {
  onGenerate: () => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  children?: React.ReactNode;
  className?: string;
}

export function AIButton({
  onGenerate,
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  children,
  className = '',
}: AIButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    if (loading || disabled || isGenerating) return;

    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = loading || isGenerating;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-rose-500 hover:bg-rose-600 text-white border-transparent',
    secondary:
      'bg-purple-500 hover:bg-purple-600 text-white border-transparent',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`
        inline-flex items-center rounded-md border font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg
            className="-ml-1 mr-2 size-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Génération IA...
        </>
      ) : (
        <>
          <SparklesIcon className="mr-2 size-4" />
          {children || 'Générer avec IA'}
        </>
      )}
    </button>
  );
}
