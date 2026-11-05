import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "tap-smooth inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-fill disabled:opacity-30 disabled:pointer-events-none transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "tap-smooth-sm inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-on-ink transition-opacity hover:opacity-90 disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl bg-fill px-3 text-sm text-ink outline-none ring-accent transition-all duration-150 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl bg-fill px-3 py-3 text-sm text-ink outline-none ring-accent transition-all duration-150 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}

export function Group({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-line-soft overflow-hidden rounded-2xl bg-fill">
      {children}
    </div>
  );
}
