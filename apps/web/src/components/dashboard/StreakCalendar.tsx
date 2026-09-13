'use client';

import { useMemo } from 'react';

interface StreakCalendarProps {
  sessions: { started_at: string; status: string }[];
}

function toDateStr(utcStr: string): string {
  const d = new Date(utcStr.replace(' ', 'T') + 'Z');
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function StreakCalendar({ sessions }: StreakCalendarProps) {
  const completedDates = useMemo(() => {
    const dates = new Set<string>();
    sessions.forEach(s => {
      dates.add(toDateStr(s.started_at));
    });
    return dates;
  }, [sessions]);

  const today = new Date();
  const todayStr = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;
  const weeks: { date: Date; active: boolean; isToday: boolean }[][] = [];
  let currentWeek: { date: Date; active: boolean; isToday: boolean }[] = [];

  const startDate = new Date(today);
  startDate.setUTCDate(startDate.getUTCDate() - 83);
  startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());

  for (let i = 0; i < 84; i++) {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + i);
    const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    currentWeek.push({ date, active: completedDates.has(dateStr), isToday });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-[5px] min-w-fit px-1">
        <div className="flex flex-col gap-[5px] mr-0.5">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center text-[8px] sm:text-[9px] text-neutral-400 font-medium">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[5px]">
            {week.map((day, di) => (
              <div
                key={di}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-colors ${
                  day.active
                    ? 'bg-success-500'
                    : day.isToday
                      ? 'bg-primary-300 ring-1 ring-primary-500'
                      : 'bg-neutral-100 dark:bg-neutral-700'
                }`}
                title={day.date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
