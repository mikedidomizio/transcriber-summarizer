import React, { useState} from "react";
import {useTranscribeOptions} from "~/providers/TranscribeOptionsProvider";

export type SummaryStyle = "Summary" | "BulletPoints"

export type TranscribeOptionsArgs = { bulletPoints: number, maxNumberOfSpeakers: number, summaryStyle: SummaryStyle }

type TranscribeOptionsProps = {
  label?: string,
}

export const TranscribeOptions = ({ label }: TranscribeOptionsProps) => {
  const { options, setOptions, setHasSubmitted } = useTranscribeOptions()
  const labelText = label || 'What is the max number of speakers in this audio?'
  const [tempOptions, setTempOptions] = useState<TranscribeOptionsArgs>(options)


  console.log(tempOptions)
  const handleFinish = () => {
    setOptions(tempOptions)
    setHasSubmitted(true)
  }

  return <div className="form-control w-full max-w-xs">

    <div className="mb-4">
      <label className="label">
        <span className="label-text">{labelText}</span>
      </label>
      <input onChange={(e) =>  setTempOptions({ ...tempOptions, maxNumberOfSpeakers: parseInt(e.target.value, 10) })} defaultValue={options.maxNumberOfSpeakers} type="number" min="1" max="10" placeholder="Max number of Speakers" className="input input-bordered w-full max-w-xs" />
    </div>

    <div className="mb-4">
      <select defaultValue={options.summaryStyle} onChange={(e) => setTempOptions({ ...tempOptions, summaryStyle: e.target.value as SummaryStyle })} className="select select-bordered w-full max-w-xs">
        <option disabled>How would you like the audio summarized?</option>
        <option value="Summary">Summary</option>
        <option value="BulletPoints">Bullet points</option>
      </select>
    </div>

    {tempOptions.summaryStyle === "BulletPoints" ? <div className="mb-4">
        <label className="label">
          <span className="label-text">Number of bullet points</span>
        </label>
        <input min="1" onChange={(e) => setTempOptions({ ...tempOptions, bulletPoints: parseInt(e.target.value, 10) })} type="number" defaultValue={options.bulletPoints} className="input input-bordered w-full max-w-xs" />
      </div>
    : null}

    <button className="btn btn-primary" onClick={() => handleFinish()} >Submit transcribe options</button>
  </div>
}
