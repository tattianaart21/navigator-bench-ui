import Modal from "./Modal";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmNewVersionModal({
  open,
  title = "Новая версия бенчмарка",
  message,
  confirmLabel = "Продолжить",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      title={title}
      open={open}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="admin-modal-text">{message}</p>
    </Modal>
  );
}
