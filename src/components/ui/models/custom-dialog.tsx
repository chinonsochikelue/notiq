'use client';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

const DialogContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  variants: Variants;
  transition?: Transition;
  ids: {
    dialog: string;
    title: string;
    description: string;
  };
  onAnimationComplete: (definition: string) => void;
  handleTrigger: () => void;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
} | null>(null);

const defaultVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};

const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

type DialogProps = {
  children: React.ReactNode;
  variants?: Variants;
  transition?: Transition;
  className?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
};

function Dialog({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  defaultOpen,
  onOpenChange,
  open,
  size = 'md',
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen || false
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isOpen = open !== undefined ? open : uncontrolledOpen;

  const setIsOpen = React.useCallback(
    (value: boolean) => {
      if (open === undefined) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    } else {
      document.body.style.overflow = '';
      dialog.close();
    }

    const handleCancel = (e: Event) => {
      e.preventDefault();
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, setIsOpen]);

  const handleTrigger = () => {
    setIsOpen(true);
  };

  const onAnimationComplete = (definition: string) => {
    if (definition === 'exit' && !isOpen) {
      dialogRef.current?.close();
    }
  };

  const baseId = useId();
  const ids = {
    dialog: `motion-ui-dialog-${baseId}`,
    title: `motion-ui-dialog-title-${baseId}`,
    description: `motion-ui-dialog-description-${baseId}`,
  };

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        dialogRef,
        variants,
        transition,
        ids,
        onAnimationComplete,
        handleTrigger,
        size,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

type DialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
};

function DialogTrigger({
  children,
  className,
  variant = 'default',
  size = 'default',
  asChild = false
}: DialogTriggerProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300';

  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
    destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
    outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
    ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
    link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...(children.props as any),
      onClick: context.handleTrigger,
    });
  }

  return (
    <button
      onClick={context.handleTrigger}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}

type DialogPortalProps = {
  children: React.ReactNode;
  container?: HTMLElement | null;
};

function DialogPortal({ children }: DialogPortalProps) {
  if (typeof window !== "undefined") {
    return createPortal(children, document.body);
  }
  return null;
}

type DialogContentProps = {
  children: React.ReactNode;
  className?: string;
  container?: HTMLElement;
  showClose?: boolean;
};

function DialogContent({
  children,
  className,
  container,
  showClose = true
}: DialogContentProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogContent must be used within Dialog');
  const {
    isOpen,
    setIsOpen,
    dialogRef,
    variants,
    transition,
    ids,
    onAnimationComplete,
    size,
  } = context;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  const content = (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={backdropVariants}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.dialog
            key={ids.dialog}
            ref={dialogRef as React.RefObject<HTMLDialogElement>}
            id={ids.dialog}
            aria-labelledby={ids.title}
            aria-describedby={ids.description}
            aria-modal='true'
            role='dialog'
            onClick={(e: React.MouseEvent<HTMLDialogElement>) => {
              if (e.target === dialogRef.current) {
                setIsOpen(false);
              }
            }}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants}
            transition={transition}
            onAnimationComplete={onAnimationComplete}
            className={cn(
              'fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%]',
              'grid gap-4 border border-slate-200 bg-white p-6 shadow-lg',
              'duration-200 sm:rounded-lg dark:border-slate-800 dark:bg-slate-950',
              sizeStyles[size],
              className
            )}
          >
            <div className='relative w-full'>
              {showClose && (
                <DialogClose className="absolute right-0 top-0" />
              )}
              {children}
            </div>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );

  return <DialogPortal container={container}>{content}</DialogPortal>;
}

type DialogHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
      {children}
    </div>
  );
}

type DialogTitleProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogTitle({ children, className }: DialogTitleProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTitle must be used within Dialog');

  return (
    <h2
      id={context.ids.title}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    >
      {children}
    </h2>
  );
}

type DialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogDescription({ children, className }: DialogDescriptionProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogDescription must be used within Dialog');

  return (
    <p
      id={context.ids.description}
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    >
      {children}
    </p>
  );
}

type DialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};

function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  );
}

type DialogCloseProps = {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
};

function DialogClose({
  className,
  children,
  disabled,
  variant = 'outline',
  size = 'icon',
  asChild = false
}: DialogCloseProps) {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogClose must be used within Dialog');

  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300';

  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90',
    destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90',
    outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80',
    ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-6 w-6',
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...(children.props as any),
      onClick: () => context.setIsOpen(false),
    });
  }

  // Default close button (icon only)
  if (!children) {
    return (
      <button
        onClick={() => context.setIsOpen(false)}
        type='button'
        aria-label='Close dialog'
        className={cn(
          'rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100',
          'focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
          'disabled:pointer-events-none data-[state=open]:bg-slate-100',
          'data-[state=open]:text-slate-500 dark:ring-offset-slate-950',
          'dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800',
          'dark:data-[state=open]:text-slate-400',
          className
        )}
        disabled={disabled}
      >
        <X className='h-4 w-4' />
        <span className='sr-only'>Close</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => context.setIsOpen(false)}
      type='button'
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};