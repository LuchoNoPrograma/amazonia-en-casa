import { useEffect, useRef } from "react";

let returnFocus: HTMLElement | null = null;
const activeDialogs = new Set<HTMLElement>();
let restoreBackground = () => {};

/** Focus containment, Escape and scroll lock shared by overlays. */
export function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement as HTMLElement | null;
    if (previous && previous !== document.body && !previous.closest('[role="dialog"]')) returnFocus = previous;
    const root = ref.current;
    if (!activeDialogs.size) {
      const backgrounds = Array.from(document.querySelectorAll<HTMLElement>('.admin-entry, .admin-nav, .store-header, main, .store-footer'));
      const inertStates = backgrounds.map(element => element.inert);
      const overflow = document.body.style.overflow;
      backgrounds.forEach(element => { element.inert = true; });
      document.body.style.overflow = "hidden";
      restoreBackground = () => {
        backgrounds.forEach((element, index) => { element.inert = inertStates[index]; });
        document.body.style.overflow = overflow;
      };
    }
    activeDialogs.add(root);
    const controls = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex="0"]',
        ),
      ).filter(
        (el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0,
      );
    (controls()[0] || root).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Let a nested select close its options before closing the dialog.
        if ((event.target as HTMLElement).closest('[role="combobox"][aria-expanded="true"]')) return;
        event.preventDefault();
        close.current();
      }
      if (event.key !== "Tab") return;
      const elements = controls();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first) {
        event.preventDefault();
        root.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === root)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", keydown);
    return () => {
      root.removeEventListener("keydown", keydown);
      activeDialogs.delete(root);
      if (!activeDialogs.size) restoreBackground();
      queueMicrotask(() => {
        if (!document.querySelector('[role="dialog"]')) {
          if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
          else document.getElementById('cart-btn')?.focus({ preventScroll: true });
        }
      });
    };
  }, [open]);
  return ref;
}
