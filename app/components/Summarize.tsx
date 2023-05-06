import React, {useCallback, useEffect, useRef, useState} from "react";

type SummarizeProps = {
    onComplete: (responseFromOpenAI: string) => void
    textToSummarize: string
}

export const Summarize = ({ onComplete, textToSummarize }: SummarizeProps) => {
    const ref = useRef(false)
    const [summarizedText, setSummarizedText] = useState(null)

    const makeOpenAiRequest = useCallback(async() => {
        const formDataSummarizing = new FormData()
        formDataSummarizing.set("summarizedTextForOpenAI", textToSummarize)

        const res = await fetch('/chatgpt', {
            method: 'POST',
            body: formDataSummarizing
        });

        const json = await res.json()
        setSummarizedText(json)
        onComplete(json)
    }, [onComplete, textToSummarize])

    useEffect(() => {
        if (!ref.current && textToSummarize !== "") {
            ref.current = true
            void makeOpenAiRequest()
        }
    }, [makeOpenAiRequest, textToSummarize])

    return <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold">{summarizedText ? "Summarized!" : "Summarizing"}</h1>
                {summarizedText ? <p className="my-4">
                    {summarizedText}
                </p> : null}
                {textToSummarize.length === 0 ? "I only work when passed in a string to analyze" : null}

                {summarizedText ? <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Start over</button> : null}
            </div>
        </div>
    </div>
}
