import React, {useState} from "react";
import type {TranscribeOptionsArgs} from "~/components/TranscribeOptions";

const initialValues: TranscribeOptionsArgs = {
  bulletPoints: 5,
  maxNumberOfSpeakers: 2,
  summaryStyle: "Summary"
}

type ContextType = {
  options: TranscribeOptionsArgs,
  setOptions: React.Dispatch<React.SetStateAction<TranscribeOptionsArgs>>
  hasSubmitted: boolean,
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>
}

const TranscribeOptionsContext = React.createContext<ContextType>({
  options: initialValues,
  setOptions: () => {},
  hasSubmitted: false,
  setHasSubmitted: () => {}
})

export function TranscribeOptionsProvider({children}: any) {
  const [options, setOptions] = useState(initialValues)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const value = { options, setOptions, hasSubmitted, setHasSubmitted }
  return <TranscribeOptionsContext.Provider value={value}>{children}</TranscribeOptionsContext.Provider>
}

export const useTranscribeOptions = () => {
  const context = React.useContext(TranscribeOptionsContext)

  if (context === undefined) {
    throw new Error('useTranscribeOptions must be used within a TranscribeOptionsProvider')
  }

  return context
}
