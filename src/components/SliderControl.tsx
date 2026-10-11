type SliderControlProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  unit?: string
  description?: string
}

export function SliderControl({ label, value, min, max, step = 1, onChange, unit, description }: SliderControlProps) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-100">
          {value.toFixed(step < 1 ? 2 : 0)}{unit ?? ''}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-600 dark:bg-slate-700"
      />
      {description ? <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span> : null}
    </label>
  )
}
