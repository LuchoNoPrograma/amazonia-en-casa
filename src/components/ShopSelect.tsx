import { useEffect, useLayoutEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Option = { value: string; label: string };

/** Select-only combobox: focus stays on its trigger while navigating options. */
export function ShopSelect({ label, value, options, onChange, id }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; id?: string;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [menuLayout, setMenuLayout] = useState<{ above: boolean; height: number } | null>(null);
  const typed = useRef({ text: '', time: 0 });
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);
  useLayoutEffect(() => {
    if (!open) return;
    const boundary = root.current?.closest('.admin-dialog-body');
    if (!boundary) { setMenuLayout(null); return; }
    const position = () => {
      const trigger = root.current!.getBoundingClientRect();
      const bounds = boundary.getBoundingClientRect();
      const below = Math.min(window.innerHeight, bounds.bottom) - trigger.bottom - 12;
      const above = trigger.top - Math.max(0, bounds.top) - 12;
      const showAbove = below < 260 && above > below;
      setMenuLayout({ above: showAbove, height: Math.max(44, Math.min(260, showAbove ? above : below)) });
    };
    position();
    boundary.addEventListener('scroll', position);
    window.addEventListener('resize', position);
    return () => { boundary.removeEventListener('scroll', position); window.removeEventListener('resize', position); };
  }, [open]);
  const choose = (index: number) => {
    if (options[index]) onChange(options[index].value);
    setOpen(false);
  };
  return <div className="shop-select" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button id={id} type="button" className="shop-select-trigger" role="combobox"
      aria-label={label} aria-expanded={open} aria-haspopup="listbox" aria-controls={listId}
      aria-activedescendant={open ? `${listId}-${active}` : undefined}
      onClick={() => { setActive(selected); setOpen(!open); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { if (open) event.stopPropagation(); setOpen(false); return; }
        if (event.key === 'Tab') { setOpen(false); return; }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
          event.preventDefault();
          if (!open) { setActive(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : selected); setOpen(true); return; }
          if (event.key === 'Enter' || event.key === ' ') { choose(active); return; }
          setActive(index => event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
        } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          const now = Date.now();
          typed.current = { text: (now - typed.current.time < 600 ? typed.current.text : '') + event.key, time: now };
          const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          const match = options.findIndex(option => normalize(option.label).startsWith(normalize(typed.current.text)));
          if (match >= 0) { setActive(match); setOpen(true); }
        }
      }}>
      <span>{options[selected]?.label}</span><ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && <ul id={listId} role="listbox" aria-label={label} className="shop-select-menu" style={menuLayout ? { top: menuLayout.above ? 'auto' : 'calc(100% + 7px)', bottom: menuLayout.above ? 'calc(100% + 7px)' : 'auto', maxHeight: menuLayout.height } : undefined}>
      {options.map((option, index) => <li key={option.value} id={`${listId}-${index}`} role="option"
        aria-selected={option.value === value} className={index === active ? 'is-active' : ''}
        onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()}
        onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <Check size={17} aria-hidden="true" />}
      </li>)}
    </ul>}
  </div>;
}
