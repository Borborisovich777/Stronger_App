import { useState } from "react";
import { EXERCISE_IMAGE_VERSION, EXERCISE_MEDIA } from "./exercise-media";

export function ExercisePhoto({ exerciseKey, name, position = 0, thumbnail = false }: {
  exerciseKey: string;
  name: string;
  position?: 0 | 1;
  thumbnail?: boolean;
}) {
  const media = EXERCISE_MEDIA[exerciseKey];
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const thumbnailPosition = ["deadlift", "romanian-deadlift"].includes(exerciseKey) ? 0 : 1;
  const paired = media?.layout === "paired";
  const imagePosition = paired ? 0 : thumbnail ? thumbnailPosition : position;
  const imagePath = media?.images[imagePosition];
  return (
    <span className={`${thumbnail ? "exercise-thumbnail" : "exercise-photo"}${paired ? thumbnail ? " exercise-thumbnail-paired" : " exercise-photo-paired" : ""}`}>
      {media && imagePath && failedImage !== imagePath ? (
        <img
          src={`${import.meta.env.BASE_URL}${imagePath}?v=${EXERCISE_IMAGE_VERSION}`}
          alt={thumbnail ? "" : paired ? `3D mannequins demonstrating ${name}, two key positions` : `3D mannequin demonstrating ${name}, position ${position + 1}`}
          loading={thumbnail ? "lazy" : "eager"}
          decoding="async"
          onError={() => setFailedImage(imagePath)}
        />
      ) : (
        <span className="exercise-photo-fallback">{media ? "Illustration unavailable" : "Personal exercise"}</span>
      )}
    </span>
  );
}

export function ExerciseGuide({ exerciseKey, name, category }: {
  exerciseKey: string;
  name: string;
  category?: string;
}) {
  const media = EXERCISE_MEDIA[exerciseKey];
  if (!media) return (
    <div className="exercise-guide-empty">
      <h3>Your own movement</h3>
      <p>This exercise is in your personal library. A demonstration hasn’t been added for it.</p>
    </div>
  );

  return (
    <div className="exercise-guide">
      <div className="exercise-guide-tags">
        {category ? <span>{category}</span> : null}
        <span>{media.equipment}</span>
      </div>
      <div className={`exercise-demonstration${media.layout === "paired" ? " exercise-demonstration-paired" : ""}`} aria-label={`${name} movement demonstration`}>
        {media.layout === "paired" ? (
          <figure>
            <ExercisePhoto exerciseKey={exerciseKey} name={name} />
            <figcaption className="exercise-paired-caption"><span>Position 1</span><span>Position 2</span></figcaption>
          </figure>
        ) : ([0, 1] as const).map((position) => (
          <figure key={`${exerciseKey}-${position}`}>
            <ExercisePhoto exerciseKey={exerciseKey} name={name} position={position} />
            <figcaption>Position {position + 1}</figcaption>
          </figure>
        ))}
      </div>
      {media.illustrationNote ? <p className="exercise-illustration-note">{media.illustrationNote}</p> : null}
      <div className="exercise-muscles"><span>WORKS</span><strong>{media.muscles.join(" · ")}</strong></div>
      <section className="exercise-instructions" aria-label={`How to do ${name}`}>
        <h3>How to do it</h3>
        <ol>{media.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol>
      </section>
      <p className="exercise-source">3D illustration generated with OpenAI.{media.sourceUrl ? <> Movement reference: <a href={media.sourceUrl} target="_blank" rel="noreferrer">{media.sourceName}</a></> : " Movement guide written for Stronger."}</p>
    </div>
  );
}
