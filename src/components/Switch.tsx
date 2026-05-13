type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  disabled?: boolean;
  label?: string;
};

export default function Switch({ checked, onChange, id, disabled, label }: Props) {
  return (
    <label className="admin-switch" htmlFor={id}>
      {label ? <span className="admin-switch-label">{label}</span> : null}
      <input
        id={id}
        type="checkbox"
        className="admin-switch-input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="admin-switch-track" aria-hidden />
    </label>
  );
}
