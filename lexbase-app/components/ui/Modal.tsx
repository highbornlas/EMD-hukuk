'use client';

import { useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   Premium Modal — Orijinal Vanilla JS tasarımının birebir
   karşılığı. Blur overlay, gold-tinted border, heavy shadow,
   20px radius.
   ══════════════════════════════════════════════════════════════ */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, maxWidth = 'max-w-lg', children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center animate-fade-in-up"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`modal-box w-[95%] ${maxWidth} animate-scale-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-surface2 text-text-muted hover:text-text transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Form Components — Premium Styled
   ══════════════════════════════════════════════════════════════ */

export function FormGroup({ label, required, error, children }: { label: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">
        {label} {required && <span className="text-red">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red mt-1">{error}</p>}
    </div>
  );
}

export function FormInput({ type = 'text', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      {...props}
      className={`form-input ${props.className || ''}`}
    />
  );
}

export function FormSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`form-input ${props.className || ''}`}
    >
      {children}
    </select>
  );
}

export function FormTextarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`form-input resize-none ${props.className || ''}`}
    />
  );
}


/* ══════════════════════════════════════════════════════════════
   Button Components — Gradient + Shadow + Hover Lift
   Orijinal: .btn-gold, .btn-outline
   ══════════════════════════════════════════════════════════════ */

export function BtnGold({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`btn-gold ${props.className || ''}`}
    >
      {children}
    </button>
  );
}

export function BtnOutline({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`btn-outline ${props.className || ''}`}
    >
      {children}
    </button>
  );
}
