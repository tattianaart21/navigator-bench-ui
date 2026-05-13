import type { ReactNode } from "react";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export default function Modal({ title, open, onClose, children, footer, wide }: Props) {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={"admin-modal" + (wide ? " admin-modal--wide" : "")}
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-head">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer ? <div className="admin-modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
