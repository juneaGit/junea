'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface AIButtonProps {
  onGenerate: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: ReactNode;
}

export const AIButton = ({
  onGenerate,
  loading = false,
  disabled = false,
  variant = 'outline',
  size = 'default',
  className,
  children = 'Suggestions IA',
}: AIButtonProps) => {
  const handleClick = async () => {
    if (loading || disabled) return;
    await onGenerate();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || disabled}
      className={className}
    >
      {loading ? (
        <Spinner className="mr-2 size-4" />
      ) : (
        <SparklesIcon className="mr-2 size-4" />
      )}
      {children}
    </Button>
  );
};
