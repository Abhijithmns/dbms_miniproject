import type { Ref } from "react";
import { CheckIcon } from "@/components/Icons";

/** Panel shown (and focused) after a valid submit. */
export function FormSuccess({
  title,
  text,
  className = "mt-5",
  ...props
}: {
  title: string;
  text: string;
  className?: string;
  ref: Ref<HTMLDivElement>;
  hidden: boolean;
  tabIndex: number;
  role: "status";
  "data-form-success": string;
}) {
  return (
    <div className={`${className} flex gap-3 rounded-md border border-line bg-paper p-4 text-sm`} {...props}>
      <span className="mt-0.5 text-pen">
        <CheckIcon size={20} />
      </span>
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-muted">{text}</p>
      </div>
    </div>
  );
}
