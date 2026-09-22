import { useRef, useState } from "react";
import { Check, CheckCircle, Circle, CaretRight } from "@phosphor-icons/react";
import type { WorkoutSession } from "./storage";
import type { WeeklyCoverage } from "./weeklyCoverage";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "numeric", month: "short", timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

export function WeeklyCalendar({ coverage, history, onOpenWorkout }: {
  coverage: WeeklyCoverage;
  history: WorkoutSession[];
  onOpenWorkout: (workout: WorkoutSession, returnFocus: HTMLButtonElement | null) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDayButton = useRef<HTMLButtonElement | null>(null);
  const selectedDay = coverage.days.find((day) => day.dateKey === selectedDate);
  const selectedWorkouts = selectedDay?.sessionIds.flatMap((id) => {
    const workout = history.find((session) => session.id === id);
    return workout ? [workout] : [];
  }) ?? [];

  return (
    <section className="weekly-calendar" aria-labelledby="weekly-calendar-title">
      <div className="weekly-calendar-heading">
        <h3 id="weekly-calendar-title">This week <span>· 1× each</span></h3>
        <span aria-label={`${coverage.completedGoalCount} of 5 weekly categories covered`}>{coverage.completedGoalCount}/5</span>
      </div>
      <div className="weekly-calendar-days" role="group" aria-label="This week, Monday to Sunday">
        {coverage.days.map((day, index) => (
          <button
            key={day.dateKey}
            type="button"
            className="weekly-calendar-day"
            aria-label={`${dayLabel(day.dateKey)}${day.isToday ? ", today" : ""}, ${day.sessionIds.length ? `${day.sessionIds.length} completed ${day.sessionIds.length === 1 ? "workout" : "workouts"}` : day.isFuture ? "upcoming" : "no completed workouts"}`}
            aria-current={day.isToday ? "date" : undefined}
            aria-expanded={selectedDate === day.dateKey}
            aria-controls="weekly-calendar-detail"
            onClick={(event) => {
              selectedDayButton.current = event.currentTarget;
              setSelectedDate(selectedDate === day.dateKey ? null : day.dateKey);
            }}
          >
            <span className="weekly-calendar-weekday" aria-hidden="true">{weekdays[index]}</span>
            <span className="weekly-calendar-date" aria-hidden="true">{Number(day.dateKey.slice(-2))}</span>
            <span className="weekly-calendar-tick" aria-hidden="true">{day.sessionIds.length > 0 ? <Check size={12} weight="bold" /> : null}</span>
          </button>
        ))}
      </div>
      <ul className="weekly-calendar-goals" aria-label="Weekly categories, at least one workout each">
        {coverage.goals.map((goal) => (
          <li key={goal.category} data-complete={goal.completed} aria-label={`${goal.category}: ${goal.completed ? `${goal.sessionCount} ${goal.sessionCount === 1 ? "workout" : "workouts"}, weekly goal met` : "not yet this week"}`}>
            {goal.completed ? <CheckCircle size={14} weight="fill" aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            <span aria-hidden="true">{goal.category}</span>
          </li>
        ))}
      </ul>
      <div id="weekly-calendar-detail" className="weekly-calendar-detail" hidden={!selectedDay}>
        {selectedDay ? <>
          <p className="weekly-calendar-detail-date">{dayLabel(selectedDay.dateKey)}</p>
          {selectedWorkouts.length ? <ul>
            {selectedWorkouts.map((workout) => (
              <li key={workout.id}><button type="button" onClick={() => onOpenWorkout(workout, selectedDayButton.current)}>
                <span>{workout.name}</span><CaretRight size={16} aria-hidden="true" />
              </button></li>
            ))}
          </ul> : <p>{selectedDay.isFuture ? "Upcoming day" : "No completed workouts on this day."}</p>}
          <p className="weekly-calendar-help">Ticks follow completed exercises in saved workouts, using each exercise’s main category. Skipped exercises and custom exercises without a category don’t tick a goal.</p>
        </> : null}
      </div>
    </section>
  );
}
