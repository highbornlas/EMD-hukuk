'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LexBase] Hata yakalandı:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-surface border border-border rounded-2xl p-8 shadow-lg">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-dim flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>

              {/* Title */}
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-text mb-2">
                Bir Hata Oluştu
              </h2>

              {/* Description */}
              <p className="text-sm text-text-muted mb-1">
                Sayfa yüklenirken beklenmeyen bir hata meydana geldi.
              </p>
              <p className="text-xs text-text-dim mb-6 font-mono break-all">
                {this.state.error?.message || 'Bilinmeyen hata'}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                  className="btn-gold px-5 py-2.5 text-sm font-semibold"
                >
                  Tekrar Dene
                </button>
                <a
                  href="/dashboard"
                  className="btn-outline px-5 py-2.5 text-sm font-semibold"
                >
                  Ana Sayfa
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
