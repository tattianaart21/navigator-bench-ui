import Modal from "./Modal";

type Props = {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmNewVersionModal({
  open,
  message,
  confirmLabel = "Продолжить",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      title="Новая версия бенчмарка"
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
