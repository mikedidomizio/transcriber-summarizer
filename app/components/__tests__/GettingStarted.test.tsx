import {render, screen} from "@testing-library/react";
import {GettingStarted} from "~/components/GettingStarted";

it('should render', () => {
  render(<GettingStarted maxAudioDurationInSeconds={600} onFinishRecording={() => {}} />)

  expect(screen.getByText("Transcriber Summarizer")).toBeVisible()
  expect(screen.getByRole('img', { name: /start recording/i })).toBeVisible()
})
