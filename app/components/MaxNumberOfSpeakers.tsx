import React, {useRef} from "react";

type MaxNumberOfSpeakersProps = {
  label?: string
  onSubmit: (maxNumberOfSpeakers: number) => void
}

export const MaxNumberOfSpeakers = ({ onSubmit, label }: MaxNumberOfSpeakersProps) => {
  const defaultValue = 2
  const labelText = label || 'What is the max number of speakers in this audio?'
  const ref = useRef<HTMLInputElement>(null)

  return <div className="form-control w-full max-w-xs">
    <label className="label">
      <span className="label-text">{labelText}</span>
    </label>
    <input ref={ref} type="number" min="1" max="10" placeholder="Max number of Speakers" className="input input-bordered w-full max-w-xs"
           defaultValue={defaultValue} />

    <button className="btn btn-primary mt-4" onClick={() => onSubmit(ref.current?.valueAsNumber || defaultValue)} >Submit max number of speakers</button>
  </div>
}
