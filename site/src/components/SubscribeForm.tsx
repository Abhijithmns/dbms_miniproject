"use client";

import { FormSuccess } from "@/components/FormSuccess";
import { ArrowRightIcon } from "@/components/Icons";
import { useFormCheck } from "@/lib/use-form-check";

/*
 * Demo subscription form: it checks the address and shows a confirmation, but isn't connected to
 * an email service. Pass the form to your provider in useFormCheck's onValid callback (DOCS.md).
 */

/** "By email": name (optional), email, how often and series announcements (subscribe page). */
export function SubscribeForm() {
  const { formProps, field, error, success } = useFormCheck();

  return (
    <form id="subscribe-form" aria-label="Email subscription" className="mt-6 space-y-6" {...formProps}>
      <div>
        <label htmlFor="sub-name" className="label">
          First name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="sub-name" name="name" type="text" autoComplete="given-name" className="input" placeholder="Ada" />
      </div>
      <div>
        <label htmlFor="sub-email" className="label">
          Email address
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          data-label="your email address"
          className="input"
          placeholder="you@example.com"
          {...field("sub-email")}
        />
        {error("sub-email")}
      </div>
      <fieldset>
        <legend className="label">How often</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="choice">
            <input type="radio" name="frequency" value="every" defaultChecked />
            <span>
              <span className="block font-bold">Every new post</span>
              <span className="block text-sm text-muted">About twice a month</span>
            </span>
          </label>
          <label className="choice">
            <input type="radio" name="frequency" value="monthly" />
            <span>
              <span className="block font-bold">Monthly digest</span>
              <span className="block text-sm text-muted">One email, first Monday</span>
            </span>
          </label>
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm">
        <input id="sub-series" name="series" type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--pen)]" />
        <span>Also tell me when a new series starts</span>
      </label>
      <button type="submit" className="btn">
        Subscribe <ArrowRightIcon />
      </button>
      <FormSuccess
        className=""
        title="Thanks, nearly there."
        text="I’ve sent you a confirmation email. Click the link inside to finish subscribing. If it hasn’t arrived in a few minutes, check your spam folder."
        {...success}
      />
    </form>
  );
}
