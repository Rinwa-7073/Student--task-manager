
import { useState, type FormEvent } from 'react';

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type StudyTask = {
  id: string;
  subject: string;
  topic: string;
  day: string;
  duration: string;
  completed: boolean;
};

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [day, setDay] = useState('Monday');
  const [duration, setDuration] = useState('1 hour');
  const [error, setError] = useState('');

  function addTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedSubject = subject.trim();
    const trimmedTopic = topic.trim();
    if (!trimmedSubject || !trimmedTopic) {
      setError('Subject and topic cannot be blank.');
      return;
    }

    setTasks((old) => [
      ...old,
      {
        id: crypto.randomUUID(),
        subject: trimmedSubject,
        topic: trimmedTopic,
        day,
        duration,
        completed: false,
      },
    ]);

    setError('');
    setSubject('');
    setTopic('');
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Weekly Study Planner</h1>
      <p>Plan your weekly study schedule and track completed topics.</p>

      <form onSubmit={addTask} className="grid gap-4 rounded-xl border p-5">
        <input
          className="rounded-md border p-3"
          placeholder="Subject (e.g. Python)"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setError('');
          }}
          required
        />

        <input
          className="rounded-md border p-3"
          placeholder="Topic (e.g. Functions)"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setError('');
          }}
          required
        />

        {error && (
          <p
            className="rounded-md border border-[color:var(--color-danger-500)]/30 bg-[color:var(--color-danger-500)]/10 px-3 py-2 text-sm text-[color:var(--color-danger-500)]"
            role="alert"
          >
            {error}
          </p>
        )}

        <select
          className="rounded-md border p-3"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        >
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          className="rounded-md border p-3"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option>30 minutes</option>
          <option>1 hour</option>
          <option>2 hours</option>
          <option>3 hours</option>
          <option>4 hours</option>
        </select>

        <button className="rounded-md bg-primary p-3 text-primary-foreground" type="submit">
          Add Study Task
        </button>
      </form>

      <section className="space-y-4 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">
          Weekly Schedule ({tasks.filter((t) => t.completed).length}/{tasks.length} completed)
        </h2>

        {days.map((d) => {
          const dayTasks = tasks.filter((t) => t.day === d);
          if (!dayTasks.length) return null;

          return (
            <div key={d}>
              <h3 className="mb-2 font-semibold">{d}</h3>

              {dayTasks.map((task) => (
                <div key={task.id} className="mb-2 flex items-center gap-3 rounded-md border p-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    aria-label={`Mark ${task.topic} as completed`}
                    onChange={() =>
                      setTasks((old) =>
                        old.map((t) =>
                          t.id === task.id
                            ? { ...t, completed: !t.completed }
                            : t
                        )
                      )
                    }
                  />
                  <div className="flex-1">
                    <p className={task.completed ? 'line-through' : 'font-medium'}>
                      {task.topic}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {task.subject} · {task.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTasks((old) => old.filter((t) => t.id !== task.id))}
                    className="rounded border px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          );
        })}

        {tasks.length === 0 && <p>No study tasks added yet.</p>}
      </section>
    </main>
  );
}
