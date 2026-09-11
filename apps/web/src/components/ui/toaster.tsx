'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-900 group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-neutral-500',
          actionButton: 'group-[.toast]:bg-neutral-900 group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-500',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
