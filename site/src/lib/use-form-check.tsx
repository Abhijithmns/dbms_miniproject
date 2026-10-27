import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";

/*
 * Form validation with the browser's own rules (required, type="email") and friendly messages,
 * as in the HTML template. Each checked field has a hidden error line (<p class="error"
 * id="<field id>-error">) linked with aria-describedby. A field is checked when it loses focus
 * (once it has a value) and again on every change while it's invalid; submitting checks every
 * field (radio buttons and checkboxes are optional choices and aren't checked), focuses the first
 * problem, or resets the form and shows and focuses the success panel.
 *
 * Demo only: nothing is sent. Post the form data to your form service in `onValid` (see DOCS.md).
 */

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isField(el: EventTarget | null): el is Field {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}
const checked = (f: Field) => f.name && f.type !== "radio" && f.type !== "checkbox";

/** The message for a field, or "" when it's valid. `data-label` names the field in messages. */
export function messageFor(field: Field): string {
  const v = field.validity;
  const label = field.getAttribute("data-label") || "this field";
  if (v.valueMissing) return `${field instanceof HTMLSelectElement ? "Please choose " : "Please enter "}${label}.`;
  if (v.typeMismatch && field.type === "email") return "Please enter a valid email address, like name@example.com.";
  if (v.tooShort && "minLength" in field)
    return `Please write at least ${field.minLength} characters (you have ${field.value.length}).`;
  if (v.typeMismatch || v.patternMismatch) return `Please check the format of ${label}.`;
  return "";
}

export function useFormCheck(onValid?: (form: HTMLFormElement) => void) {
  /** Message per field id: undefined = not checked yet, "" = valid. */
  const [messages, setMessages] = useState<Record<string, string | undefined>>({});
  const [sent, setSent] = useState(0);
  const [shown, setShown] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  function check(field: Field) {
    const msg = messageFor(field);
    setMessages((m) => ({ ...m, [field.id]: msg }));
    return !msg;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fields = Array.from(form.querySelectorAll<Field>("input, select, textarea")).filter(checked);
    const next: Record<string, string> = {};
    for (const f of fields) next[f.id] = messageFor(f);
    const firstInvalid = fields.find((f) => next[f.id]);
    if (firstInvalid) {
      setMessages(next);
      setShown(false);
      firstInvalid.focus();
      return;
    }
    // Valid. Send the data to your form endpoint here (see DOCS.md).
    onValid?.(form);
    form.reset();
    setMessages({});
    setShown(true);
    setSent((n) => n + 1);
  }

  /** Spread on the <form>. */
  const formProps = {
    noValidate: true,
    "data-validate": "",
    onSubmit,
    onBlur(e: FocusEvent<HTMLFormElement>) {
      if (isField(e.target) && checked(e.target) && e.target.value) check(e.target);
    },
    onChange(e: FormEvent<HTMLFormElement>) {
      if (isField(e.target) && messages[e.target.id]) check(e.target);
    },
  };

  /** Spread on a checked field: aria-invalid once checked, linked to its error line. */
  function field(id: string) {
    const msg = messages[id];
    return {
      id,
      "aria-invalid": msg === undefined ? undefined : msg ? ("true" as const) : ("false" as const),
      "aria-describedby": `${id}-error`,
    };
  }

  /** The error line under a field. */
  function error(id: string) {
    return (
      <p className="error" id={`${id}-error`} hidden={!messages[id]}>
        {messages[id]}
      </p>
    );
  }

  /** Props for the success panel: hidden until the form is valid, then focused. */
  const success = { ref: successRef, hidden: !shown, tabIndex: -1, role: "status", "data-form-success": "" } as const;

  return { formProps, field, error, success };
}
