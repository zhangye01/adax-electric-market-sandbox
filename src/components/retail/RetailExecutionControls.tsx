export function SegmentedChoice<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T | null;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="retail-segment-block">
      <span>{label}</span>
      <div className="retail-segmented">
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            data-choice-value={optionValue}
            className={value === optionValue ? "active" : ""}
            aria-pressed={value === optionValue}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
      {value === null ? <em className="retail-choice-state-note">未选择</em> : null}
    </div>
  );
}

export function NullableNumberInput({
  value,
  placeholder,
  min,
  max,
  ariaLabel,
  onChange
}: {
  value: number | null;
  placeholder: string;
  min?: number;
  max?: number;
  ariaLabel?: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      placeholder={placeholder}
      min={min}
      max={max}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
    />
  );
}
