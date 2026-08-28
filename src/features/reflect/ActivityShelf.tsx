import { useState } from 'react'
import { GlassPanel } from '../common/GlassPanel'
import { Modal } from '../common/Modal'
import { BurnExercise } from './BurnExercise'

const activityPreviews = [
  {
    family: 'Discover',
    title: 'Tiny Detour',
    body: 'Take a familiar route and make one safe turn you usually ignore.',
  },
  {
    family: 'Create',
    title: 'Sound Map',
    body: 'Sit somewhere for five minutes and place each sound on a blank spatial map.',
  },
  {
    family: 'Connect',
    title: 'One Honest Question',
    body: 'Ask someone you trust one question that cannot be answered with yes or no.',
  },
  {
    family: 'Reflect',
    title: 'Unsent Postcard',
    body: 'Write a postcard to a past version of yourself without sending it.',
  },
  {
    family: 'Discover',
    title: 'Color Hunt',
    body: 'Choose one color and photograph five versions of it around town.',
  },
]

export function ActivityShelf() {
  const [burnOpen, setBurnOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  return (
    <>
      <GlassPanel className="activity-shelf">
        <p className="eyebrow">Interactive reflection</p>
        <strong>Some thoughts need an action, not another chart.</strong>
        <div>
          <button className="secondary-button" onClick={() => setBurnOpen(true)} type="button">
            Open private burn exercise
          </button>
          <button className="text-button" onClick={() => setLibraryOpen(true)} type="button">
            Preview more activities
          </button>
        </div>
      </GlassPanel>
      <BurnExercise onClose={() => setBurnOpen(false)} open={burnOpen} />
      <Modal
        description="A bounded preview of ways Nora could invite safe novelty, creativity, connection, reflection, or reset. Preview cards cannot start an activity."
        eyebrow="Nora activity library"
        onClose={() => setLibraryOpen(false)}
        open={libraryOpen}
        title="More ways to meet the moment"
      >
        <div className="activity-library">
          <article className="activity-preview existing-activity">
            <span>Reset · Existing Somnora continuity</span>
            <strong>Breathing reset</strong>
            <p>The established mobile breathing exercise can appear as a low-energy reset invitation.</p>
            <small>Available in the existing Somnora app. Not new hackathon work.</small>
          </article>
          {activityPreviews.map((activity) => (
            <article className="activity-preview" key={activity.title}>
              <span>{activity.family} · Preview only</span>
              <strong>{activity.title}</strong>
              <p>{activity.body}</p>
              <small>Concept only. No start control is available.</small>
            </article>
          ))}
        </div>
      </Modal>
    </>
  )
}
