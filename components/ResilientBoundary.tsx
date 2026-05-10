"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ResilientBoundaryProps {
  children: ReactNode;
  label?: string;
}

interface ResilientBoundaryState {
  hasError: boolean;
}

export default class ResilientBoundary extends Component<
  ResilientBoundaryProps,
  ResilientBoundaryState
> {
  state: ResilientBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ResilientBoundary caught UI failure", {
      label: this.props.label,
      error,
      info,
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="mx-auto my-8 max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="font-black">
              {this.props.label ?? "Modul vaqtincha ishlamadi"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-100/80">
              Sahifaning qolgan qismi ishlashda davom etadi. Qayta yuklash yoki
              boshqa bo'limga o'tish mumkin.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
            >
              Qayta urinish
            </button>
          </div>
        </div>
      </section>
    );
  }
}
