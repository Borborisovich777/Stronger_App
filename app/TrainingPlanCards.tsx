import type { Routine, WorkoutSession } from "./storage";
import { guessTrainingPlan, planDays, type PlanDayRole, type PlanType, type TrainingPlan } from "./trainingPlan";

const ROLE_LABELS: Record<PlanDayRole, string> = {
  lower: "Lower",
  upper: "Upper",
  makeup: "Make-up only",
  sport: "Sport, no lifting",
  rest: "Rest",
};
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** Monday first, as the week reads on a calendar. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function dayLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

type TodayPlanCardProps = {
  plan: TrainingPlan;
  routines: readonly Routine[];
  history: readonly WorkoutSession[];
  todayKey: string;
  onStart: (routine: Routine) => void;
};

/** Today's suggested session from the training plan, plus the rest of the week. */
export function TodayPlanCard({ plan, routines, history, todayKey, onStart }: TodayPlanCardProps) {
  const [today, ...week] = planDays(plan, history, todayKey, 7);
  const routineName = (id?: string) => routines.find((routine) => routine.id === id)?.name ?? "";
  const todayRoutine = routines.find((routine) => routine.id === today.routineId);
  return (
    <section className="today-plan-card" aria-labelledby="today-plan-title">
      <p className="section-kicker">TODAY · {dayLabel(today.date).toLocaleUpperCase()}</p>
      <h2 id="today-plan-title">
        {today.kind === "rest" ? "Rest" : today.kind === "done" ? `${routineName(today.routineId)} done` : routineName(today.routineId)}
      </h2>
      <p className="today-plan-reason">{today.kind === "done" ? "Today's session is logged." : today.reason}</p>
      {today.notes.length ? <ul className="today-plan-notes">{today.notes.map((note) => <li key={note}>{note}</li>)}</ul> : null}
      {today.kind === "train" && todayRoutine ? (
        <button className="primary-button full-width" type="button" onClick={() => onStart(todayRoutine)}>Start {todayRoutine.name}</button>
      ) : null}
      <ol className="today-plan-week" aria-label="The next six days if you follow the plan">
        {week.map((day) => (
          <li key={day.date} className={day.kind === "train" ? "is-training" : undefined}>
            <span>{dayLabel(day.date)}</span>
            <strong>{day.kind === "train" ? routineName(day.routineId) : day.reason}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

type TrainingPlanSettingsProps = {
  plan: TrainingPlan | undefined;
  routines: readonly Routine[];
  usable: boolean;
  onChange: (plan: TrainingPlan | undefined) => void;
};

/** Pick the lower and upper templates and what each weekday is for. */
export function TrainingPlanSettings({ plan, routines, usable, onChange }: TrainingPlanSettingsProps) {
  if (!plan) {
    return (
      <section className="section-block settings-section">
        <p className="section-kicker">UPPER / LOWER</p><h2>Training plan</h2>
        <p className="section-copy">Tell Stronger which templates are lower and upper days and what each weekday is for. The Workout tab then shows what to train today, moves a missed session to the next allowed day, and never puts the same type on back-to-back days or legs before a sport day.</p>
        <button className="secondary-button full-width" type="button" disabled={!routines.length} onClick={() => onChange(guessTrainingPlan(routines))}>Set up training plan</button>
      </section>
    );
  }

  const setSlot = (type: PlanType, index: number, id: string) => {
    const list = [plan[type][0] ?? "", plan[type][1] ?? ""];
    list[index] = id;
    onChange({ ...plan, [type]: list.filter(Boolean) });
  };
  const setDay = (weekday: number, role: PlanDayRole) => onChange({ ...plan, days: plan.days.map((current, index) => index === weekday ? role : current) });

  return (
    <section className="section-block settings-section">
      <div className="section-heading">
        <div><p className="section-kicker">UPPER / LOWER</p><h2>Training plan</h2></div>
        <button className="text-button" type="button" onClick={() => onChange(undefined)}>Turn off</button>
      </div>
      <p className="section-copy">Sessions alternate A, B within each type. A make-up day only trains when a lower or upper day was missed.</p>
      {!usable ? <p className="plan-warning" role="status">Pick at least one lower and one upper template to see today&apos;s plan.</p> : null}
      <div className="settings-card">
        {(["lower", "upper"] as const).flatMap((type) => [0, 1].map((index) => {
          const id = `plan-${type}-${index}`;
          return (
            <label className="setting-row" htmlFor={id} key={id}>
              <span><strong>{ROLE_LABELS[type]} {index === 0 ? "A" : "B"}</strong></span>
              <select id={id} value={plan[type][index] ?? ""} onChange={(event) => setSlot(type, index, event.target.value)}>
                <option value="">None</option>
                {routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
              </select>
            </label>
          );
        }))}
      </div>
      <div className="settings-card plan-days">
        {WEEK_ORDER.map((weekday) => (
          <label className="setting-row" htmlFor={`plan-day-${weekday}`} key={weekday}>
            <span><strong>{WEEKDAY_NAMES[weekday]}</strong></span>
            <select id={`plan-day-${weekday}`} value={plan.days[weekday]} onChange={(event) => setDay(weekday, event.target.value as PlanDayRole)}>
              {(Object.keys(ROLE_LABELS) as PlanDayRole[]).map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
