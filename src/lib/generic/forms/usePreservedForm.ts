"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Like useActionState, but the form keeps what the person typed when the server says "fix this".
 * (React 19 empties a form after every form action, even a failed one. Submitting through
 * onSubmit instead avoids that reset.) Use: <form method="post" onSubmit={onSubmit}> rather than <form action={...}>.
 * Keep method="post": if someone submits before the page has finished loading, the browser then sends the data
 * in the request body instead of putting an email address into the web address.
 */
export function usePreservedForm<S>(
  action: (prev: Awaited<S>, formData: FormData) => S | Promise<S>,
  initial: Awaited<S>,
) {
  const [state, run, pending] = useActionState(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };
  return [state, onSubmit, pending] as const;
}
