"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Like useActionState, but the form keeps what the person typed when the server says "fix this".
 * (React 19 empties a form after every form action, even a failed one. Submitting through
 * onSubmit instead avoids that reset.) Use: <form onSubmit={onSubmit}> rather than <form action={...}>.
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
