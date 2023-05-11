import type {ChangeEvent} from "react";
import React, { useState} from "react";

type SummaryStyle = "Summary" | "BulletPoints"

export type TranscribeOptionsArgs = { bulletPoints: number | null, maxNumberOfSpeakers: number | null, summaryStyle: SummaryStyle | null }

type TranscribeOptionsProps = {
  label?: string
  onSubmit: ({ bulletPoints, maxNumberOfSpeakers, summaryStyle }: TranscribeOptionsArgs) => void
}

export const TranscribeOptions = ({ onSubmit, label }: TranscribeOptionsProps) => {
  const labelText = label || 'What is the max number of speakers in this audio?'
  const [maxNumberOfSpeakers, setMaxNumberOfSpeakers] = useState(2)
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("Summary")
  const [numberOfBulletPoints, setNumberOfBulletPoints] = useState(5)

  const handleSummarySelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSummaryStyle(e?.target.value as SummaryStyle)
  }

  return <div className="form-control w-full max-w-xs">

    <div className="mb-4">
      <label className="label">
        <span className="label-text">{labelText}</span>
      </label>
      <input onChange={(e) => setMaxNumberOfSpeakers(parseInt(e.target.value, 10))} value={maxNumberOfSpeakers} type="number" min="1" max="10" placeholder="Max number of Speakers" className="input input-bordered w-full max-w-xs" />
    </div>

    <div className="mb-4">
      <select defaultValue="Summary" onChange={handleSummarySelectChange} className="select select-bordered w-full max-w-xs">
        <option disabled>How would you like the audio summarized?</option>
        <option value="Summary">Summary</option>
        <option value="BulletPoints">Bullet points</option>
      </select>
    </div>

    {summaryStyle === "BulletPoints" ? <div className="mb-4">
        <label className="label">
          <span className="label-text">Number of bullet points</span>
        </label>
        <input min="1" onChange={(e) => setNumberOfBulletPoints(parseInt(e.target.value, 10))} type="number" value={numberOfBulletPoints} className="input input-bordered w-full max-w-xs" />
      </div>
    : null}

    <button className="btn btn-primary" onClick={() => onSubmit({
      bulletPoints: numberOfBulletPoints,
      maxNumberOfSpeakers,
      summaryStyle,
    })} >Submit transcribe options</button>
  </div>
}
