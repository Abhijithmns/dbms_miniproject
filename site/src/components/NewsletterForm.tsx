"use client";

import { FormSuccess } from "@/components/FormSuccess";
import { useFormCheck } from "@/lib/use-form-check";

/*
 * Demo sign-up: it checks the address and shows a confirmation, but isn't connected to an email
 * service. Pass the form to your provider in useFormCheck's onValid callback (see DOCS.md).
 */

/** "New posts, by email": one email field and a button (home page). */
export function NewsletterForm({ id, button = "Subscribe" }: { id: string; button?: string }) {
  const { formProps, field, error, success } = useFormCheck();
  const fieldId = `${id}-email`;

  return (
    <form aria-label="Newsletter sign-up" className="min-w-0" {...formProps}>
      <label htmlFor={fieldId} className="label">
        Email address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          data-label="your email address"
          className="input"
          placeholder="you@example.com"
          {...field(fieldId)}
        />
        <button type="submit" className="btn shrink-0">
          {button}
        </button>
      </div>
      {error(fieldId)}
      <FormSuccess
        title="You are on the list (almost)."
        text="Look out for a confirmation email from me. Click the link inside and the next post lands in your inbox."
        {...success}
      />
    </form>
  );
}
