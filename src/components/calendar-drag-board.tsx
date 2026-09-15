"use client";

import { useMemo, useState } from "react";

type CalendarJob = {
  id: string;
  jobNumber: string;
  label: string;
};

type CalendarDay = {
  iso: string;
  label: string;
};

export function CalendarDragBoard({ jobs, days }: { jobs: CalendarJob[]; days: CalendarDay[] }) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [selectedDay, setSelectedDay] = useState(days[0]?.iso || "");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId), [jobs, selectedJobId]);
  const selectedStart = selectedDay && time ? `${selectedDay}T${time}` : "";
  const selectedEnd = useMemo(() => {
    if (!selectedStart) return "";
    const date = new Date(selectedStart);
    date.setMinutes(date.getMinutes() + duration);
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }, [duration, selectedStart]);

  if (!jobs.length) {
    return <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No unscheduled jobs are waiting for drag scheduling.</p>;
  }

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[280px_1fr]">
      <div className="rounded-lg bg-slate-50 p-3">
        <h4 className="font-black">Drag jobs</h4>
        <div className="mt-3 grid gap-2">
          {jobs.map((job) => (
            <button
              className={`rounded-lg border p-3 text-left text-sm ${selectedJobId === job.id ? "border-lime-500 bg-lime-50" : "border-slate-200 bg-white"}`}
              draggable
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              onDragStart={(event) => event.dataTransfer.setData("text/plain", job.id)}
              type="button"
            >
              <b>{job.jobNumber}</b>
              <span className="block text-slate-600">{job.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => (
          <button
            className={`min-h-24 rounded-lg border p-3 text-left ${selectedDay === day.iso ? "border-lime-500 bg-lime-50" : "border-slate-200 bg-white"}`}
            key={day.iso}
            onClick={() => setSelectedDay(day.iso)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const jobId = event.dataTransfer.getData("text/plain");
              if (jobId) setSelectedJobId(jobId);
              setSelectedDay(day.iso);
            }}
            type="button"
          >
            <b>{day.label}</b>
            <span className="mt-2 block text-sm text-slate-600">Drop here, then set time below.</span>
          </button>
        ))}
      </div>
      <div className="rounded-lg bg-white p-3 xl:col-span-2">
        <input name="jobId" type="hidden" value={selectedJobId} readOnly />
        <input name="scheduledStart" type="hidden" value={selectedStart} readOnly />
        <input name="scheduledEnd" type="hidden" value={selectedEnd} readOnly />
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="sm:col-span-2"><span className="label">Selected job</span><input className="field" value={selectedJob ? `${selectedJob.jobNumber} - ${selectedJob.label}` : ""} readOnly /></label>
          <label><span className="label">Start time</span><input className="field" value={time} onChange={(event) => setTime(event.target.value)} type="time" /></label>
          <label><span className="label">Minutes</span><input className="field" value={duration} min={15} step={15} onChange={(event) => setDuration(Number(event.target.value) || 60)} type="number" /></label>
        </div>
      </div>
    </div>
  );
}
