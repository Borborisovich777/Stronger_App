import { useEffect, useRef, useState } from "react";
import {
  createRoutineFromTemplate, TEMPLATE_CATEGORIES, TEMPLATE_LOAD_GUIDANCE,
  TEMPLATE_SCHEDULE_GUIDANCE, TEMPLATE_TRAINING_GUIDANCE, templateExercise,
  templateSelection, templateTargetLabel, WORKOUT_TEMPLATES,
  type TemplateCategory, type TemplateChoices, type WorkoutTemplate,
} from "./workoutTemplates";
import { makeId, type Routine } from "./storage";

function TemplateDetail({ template, onBack, onChoose }: { template: WorkoutTemplate; onBack: () => void; onChoose: (routine: Routine) => void }) {
  const [choices, setChoices] = useState<TemplateChoices>({});
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const selected = templateSelection(template, choices);
  const workingSets = selected.filter((item) => item.included).reduce((sum, item) => sum + item.slot.sets, 0);
  return <div className="template-detail">
    <button type="button" className="text-button" onClick={onBack}>← All templates</button>
    <div className="template-detail-heading">
      <p className="section-kicker">{template.category} · {template.style}</p>
      <h3 tabIndex={-1} ref={heading}>{template.name}</h3>
      <p>{template.description}</p>
      <p className="template-meta">{template.level} · about {template.minutes} min</p>
      <p className="template-meta">Equipment for default choices: {template.equipment}</p>
    </div>
    <p className="template-guidance">{template.guidance}</p>
    <ol className="template-slot-list">
      {selected.map(({ slot, exercise, included }) => <li key={slot.id} className={included ? "" : "template-slot-optional"}>
        <div className="template-slot-top">
          <div><strong>{exercise.name}</strong><p>{templateTargetLabel(slot)} · {slot.restSeconds}s rest</p></div>
          {slot.optional ? <label className="template-include">
            <input type="checkbox" checked={included} onChange={(event) => setChoices((current) => ({ ...current, [slot.id]: { ...current[slot.id], included: event.target.checked } }))} />
            Include optional
          </label> : null}
        </div>
        {slot.alternatives?.length ? <label className="template-alternative">Exercise choice
          <select value={exercise.exerciseKey} onChange={(event) => setChoices((current) => ({ ...current, [slot.id]: { ...current[slot.id], exerciseKey: event.target.value } }))}>
            {[slot.exerciseKey, ...slot.alternatives].map((key) => <option key={key} value={key}>{templateExercise(key).name}</option>)}
          </select>
        </label> : null}
        {slot.cue ? <p className="template-slot-cue">{slot.cue}</p> : null}
      </li>)}
    </ol>
    <p className="template-guidance">{TEMPLATE_LOAD_GUIDANCE}</p>
    <details className="template-method"><summary>Warm-up, effort & progression</summary><p>{TEMPLATE_TRAINING_GUIDANCE}</p></details>
    <div className="template-save">
      <span>{workingSets} working sets selected · optional exercises start excluded</span>
      <button type="button" className="primary-button full-width" onClick={() => onChoose(createRoutineFromTemplate(template, choices, makeId))}>Customize this template</button>
      <small>Review the targets and save your own editable copy.</small>
    </div>
  </div>;
}

export function TemplateLibrary({ onChoose }: { onChoose: (routine: Routine) => void }) {
  const [category, setCategory] = useState<TemplateCategory | "All">("All");
  const [selected, setSelected] = useState<WorkoutTemplate | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  return <div className="template-library">
    {selected ? <TemplateDetail key={selected.id} template={selected} onChoose={onChoose} onBack={() => {
      setSelected(null);
      window.requestAnimationFrame(() => lastTrigger.current?.focus());
    }} /> : null}
    <div hidden={selected !== null}>
      <p className="template-intro">14 ready-made sessions. Choose your focus, pick your equipment, and save a template that fits you.</p>
      <details className="template-method"><summary>How to use this library</summary>
        <p>{TEMPLATE_SCHEDULE_GUIDANCE}</p>
        <p>Keep an exercise choice for several sessions before comparing progress. Skip an accessory by leaving it out of your copy; equipment substitutions keep their own exercise identity. In a workout, leave skipped sets unchecked and finish when done.</p>
        <p>Durations are estimates including warm-up, normal rest, and setup. Take longer when needed. Stop an exercise if it causes pain.</p>
        <p>These are original starter sessions informed by <a href="https://www.acsm.org/wp-content/uploads/2026/03/Resistance-Training-Position-Stand-infographic.pdf" target="_blank" rel="noreferrer">ACSM’s 2026 guidance</a>. Exact exercise choices and rep ranges are adjustable starting points.</p>
      </details>
      <div className="template-filters" role="group" aria-label="Template focus">
        {(["All", ...TEMPLATE_CATEGORIES] as const).map((item) => <button className="small-button" type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="template-catalog-grid">
        {WORKOUT_TEMPLATES.filter((template) => category === "All" || template.category === category).map((template) => <button type="button" className="template-catalog-card" key={template.id} onClick={(event) => { lastTrigger.current = event.currentTarget; setSelected(template); }}>
          <span className="section-kicker">{template.category} · {template.style}</span>
          <strong>{template.name}</strong>
          <span>{template.description}</span>
          <small>{template.slots.filter((slot) => !slot.optional).length} exercises · about {template.minutes} min</small>
          <span className="template-card-link">View exercises & choices →</span>
        </button>)}
      </div>
    </div>
  </div>;
}
