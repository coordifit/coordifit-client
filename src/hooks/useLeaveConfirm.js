import { useState, useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";

export function useLeaveConfirm(when) {
  const blocker = useBlocker(when);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (blocker.state === "blocked") setOpen(true);
  }, [blocker.state]);

  const confirm = useCallback(() => {
    setOpen(false);
    blocker.proceed();
  }, [blocker]);

  const cancel = useCallback(() => {
    setOpen(false);
    blocker.reset();
  }, [blocker]);

  return { open, confirm, cancel };
}
