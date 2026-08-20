import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { isSameDay, startOfDay, addDays, subDays, startOfWeek, endOfWeek, format } from "date-fns";

export type CalendarViewType = "Month" | "Week" | "Schedule";

export interface CalendarEvent {
  id: string;
  title: string;
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  date?: string;
  status?: string;
  color?: string;
  textColor?: string;
  [key: string]: any;
}

interface EventCalendarProps {
  events: CalendarEvent[];
  defaultView?: CalendarViewType;
  renderSchedule?: () => React.ReactNode;
  onEventClick?: (event: CalendarEvent) => void;
  renderEventContent?: (event: CalendarEvent) => React.ReactNode;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  let current = new Date(year, month, 1 - startOffset);
  const weeks: Date[][] = [];
  for (let r = 0; r < 6; r++) {
    const w: Date[] = [];
    for (let c = 0; c < 7; c++) {
      w.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(w);
  }
  return weeks;
}

function getEventStart(ev: CalendarEvent): Date {
  if (ev.startTime) return new Date(ev.startTime);
  if (ev.date) return new Date(`${ev.date}T09:00:00`);
  return new Date();
}

function getEventEnd(ev: CalendarEvent): Date {
  if (ev.endTime) return new Date(ev.endTime);
  if (ev.startTime) return new Date(ev.startTime);
  if (ev.date) return new Date(`${ev.date}T17:00:00`);
  return new Date();
}

function getEventsForWeek(events: CalendarEvent[], week: Date[]) {
  const ws = startOfDay(week[0]);
  const we = startOfDay(week[6]);
  return events.filter((ev) => {
    const s = startOfDay(getEventStart(ev));
    const e = startOfDay(getEventEnd(ev));
    return s <= we && e >= ws;
  }).map((ev) => {
    const s = startOfDay(getEventStart(ev));
    const e = startOfDay(getEventEnd(ev));
    const colStart = Math.max(0, Math.round((s.getTime() - ws.getTime()) / 86400000));
    const colEnd = Math.min(6, Math.round((e.getTime() - ws.getTime()) / 86400000));
    return { ...ev, colStart, colEnd };
  });
}

function EventPill({
  ev,
  onClick,
  isStart,
  isEnd,
}: {
  ev: CalendarEvent & { colStart: number; colEnd: number };
  onClick: () => void;
  isStart: boolean;
  isEnd: boolean;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute flex items-center cursor-pointer select-none group"
      style={{
        top: 0,
        left: `calc(${(ev.colStart / 7) * 100}% + ${isStart ? 3 : 0}px)`,
        width: `calc(${((ev.colEnd - ev.colStart + 1) / 7) * 100}% - ${isStart ? 3 : 0}px - ${isEnd ? 3 : 0}px)`,
        height: 22,
        zIndex: 10,
      }}
    >
      <div
        className="w-full h-full flex items-center px-2 text-[11px] font-semibold truncate transition-opacity group-hover:opacity-85 shadow-2xs"
        style={{
          backgroundColor: ev.color || "#dce8fb",
          color: ev.textColor || "#1e3a6e",
          borderRadius: `${isStart ? "5px" : "0"} ${isEnd ? "5px" : "0"} ${isEnd ? "5px" : "0"} ${isStart ? "5px" : "0"}`,
        }}
      >
        {isStart ? ev.title : ""}
      </div>
    </div>
  );
}

function WeekRow({
  week,
  events,
  currentMonth,
  today,
  onDayClick,
  onEventClick,
}: {
  week: Date[];
  events: CalendarEvent[];
  currentMonth: number;
  today: Date;
  onDayClick: (d: Date) => void;
  onEventClick: (ev: CalendarEvent) => void;
}) {
  const weekEvents = getEventsForWeek(events, week);
  type SlottedEvent = (typeof weekEvents)[0] & { row: number };
  const slotted: SlottedEvent[] = [];
  const rowEndCols: number[] = [];

  for (const ev of weekEvents) {
    let row = 0;
    while (rowEndCols[row] !== undefined && rowEndCols[row] >= ev.colStart) row++;
    rowEndCols[row] = ev.colEnd;
    slotted.push({ ...ev, row });
  }

  const MAX_ROWS = 2;

  return (
    <div className="grid grid-cols-7 border-b border-line/50 last:border-b-0" style={{ minHeight: 92 }}>
      {week.map((day, di) => {
        const isToday = isSameDay(day, today);
        const isCurrentMonth = day.getMonth() === currentMonth;
        const overflowCount = slotted.filter((ev) => ev.row >= MAX_ROWS && di >= ev.colStart && di <= ev.colEnd).length;
        return (
          <div
            key={di}
            className={`relative border-r border-line/50 last:border-r-0 cursor-pointer group ${!isCurrentMonth ? "bg-slate-50/60" : "bg-white"}`}
            onClick={() => onDayClick(day)}
            style={{ minHeight: 92 }}
          >
            <div className="flex items-start justify-end p-1.5 pb-0">
              <span
                className={`w-6 h-6 flex items-center justify-center text-xs rounded-full font-bold transition-colors
                ${isToday ? "bg-deep-forest text-white" : ""}
                ${!isToday && isCurrentMonth ? "text-ink group-hover:bg-slate-100" : ""}
                ${!isCurrentMonth ? "text-slate-300" : ""}`}
              >
                {day.getDate()}
              </span>
            </div>
            {overflowCount > 0 && (
              <div className="absolute bottom-1.5 right-1.5 text-[10px] text-on-surface-variant font-semibold">+{overflowCount} more</div>
            )}
          </div>
        );
      })}
      <div className="col-span-7 pointer-events-none" style={{ position: "relative", height: 0 }}>
        <div className="absolute inset-x-0 pointer-events-auto" style={{ top: -92 + 28, height: MAX_ROWS * 26 }}>
          {slotted
            .filter((ev) => ev.row < MAX_ROWS)
            .map((ev, i) => {
              const evStartDay = startOfDay(getEventStart(ev));
              const evEndDay = startOfDay(getEventEnd(ev));
              const weekStart = startOfDay(week[0]);
              const weekEnd = startOfDay(week[6]);
              const isStart = evStartDay >= weekStart;
              const isEnd = evEndDay <= weekEnd;
              return (
                <div key={`${ev.id}-${i}`} className="absolute pointer-events-auto" style={{ top: ev.row * 26, left: 0, right: 0, height: 22 }}>
                  <EventPill ev={ev} isStart={isStart} isEnd={isEnd} onClick={() => onEventClick(ev)} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export function EventCalendar({
  events,
  defaultView = "Month",
  renderSchedule,
  onEventClick,
}: EventCalendarProps) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>(defaultView);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const weeks = getCalendarGrid(year, month);

  // Active week calculation
  const weekStart = startOfWeek(viewDate, { weekStartsOn: 0 });
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function prev() {
    if (view === "Week") {
      setViewDate(subDays(viewDate, 7));
    } else {
      setViewDate(new Date(year, month - 1, 1));
    }
  }

  function next() {
    if (view === "Week") {
      setViewDate(addDays(viewDate, 7));
    } else {
      setViewDate(new Date(year, month + 1, 1));
    }
  }

  function goToday() {
    setViewDate(new Date(today));
  }

  const headerTitle =
    view === "Week"
      ? `${format(weekDays[0], "MMM d")} – ${format(weekDays[6], "MMM d, yyyy")}`
      : `${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="bg-white rounded-2xl border border-line/60 shadow-xs overflow-hidden flex flex-col min-h-[480px]">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-line/60 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-lg border border-line/60 text-xs text-ink font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={prev}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors text-on-surface-variant cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-50 transition-colors text-on-surface-variant cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
          <span className="text-ink text-sm font-bold ml-1">{headerTitle}</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 rounded-lg p-1 self-start sm:self-auto">
          {(["Month", "Week", "Schedule"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                view === v ? "bg-white text-ink shadow-xs" : "text-on-surface-variant hover:text-ink"
              }`}
            >
              {v} View
            </button>
          ))}
        </div>
      </div>

      {/* View: Schedule List */}
      {view === "Schedule" && (
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div className="text-xs font-bold text-ink uppercase tracking-wider">Scheduled Events Timeline</div>
          {renderSchedule ? renderSchedule() : <div className="text-xs text-on-surface-variant">No schedule details provided.</div>}
        </div>
      )}

      {/* View: Dedicated Week View */}
      {view === "Week" && (
        <div className="flex-1 flex flex-col overflow-auto min-w-[700px]">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 border-b border-line/60 bg-slate-50">
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={i}
                  className={`py-3 px-2 text-center border-r border-line/50 last:border-r-0 ${
                    isToday ? "bg-deep-forest/5" : ""
                  }`}
                >
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {DAYS_OF_WEEK[d.getDay()]}
                  </div>
                  <div
                    className={`mt-1 inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-extrabold ${
                      isToday ? "bg-deep-forest text-white shadow-xs" : "text-ink"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Columns for Day Events */}
          <div className="grid grid-cols-7 flex-1 min-h-[360px] divide-x divide-line/50">
            {weekDays.map((day, di) => {
              const dayStart = startOfDay(day);
              const dayEvents = events.filter((ev) => {
                const s = startOfDay(getEventStart(ev));
                const e = startOfDay(getEventEnd(ev));
                return dayStart >= s && dayStart <= e;
              });

              return (
                <div key={di} className="p-2 space-y-2 bg-white hover:bg-slate-50/50 transition-colors">
                  {dayEvents.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 select-none">No events</span>
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const startTimeStr = ev.startTime
                        ? new Date(ev.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : null;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => onEventClick && onEventClick(ev)}
                          className="p-2 rounded-xl text-left border cursor-pointer hover:shadow-md transition-all group select-none"
                          style={{
                            backgroundColor: ev.color || "#d1fae5",
                            color: ev.textColor || "#065f46",
                            borderColor: (ev.textColor || "#065f46") + "30",
                          }}
                        >
                          <div className="font-bold text-xs line-clamp-2 leading-tight group-hover:underline">
                            {ev.title}
                          </div>
                          {startTimeStr && (
                            <div className="text-[10px] flex items-center gap-1 mt-1 font-semibold opacity-90">
                              <Clock size={10} />
                              <span>{startTimeStr}</span>
                            </div>
                          )}
                          {ev.volunteersNeeded !== undefined && (
                            <div className="mt-1.5 text-[9px] font-bold uppercase tracking-wider opacity-80">
                              {ev.volunteers?.length || 0} / {ev.volunteersNeeded} Volunteers
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Month View */}
      {view === "Month" && (
        <div className="flex-1 flex flex-col overflow-auto min-w-[650px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-line/60 bg-slate-50">
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-r border-line/50 last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Month Weeks */}
          <div className="flex-1 flex flex-col">
            {weeks.map((week, wi) => (
              <WeekRow
                key={wi}
                week={week}
                events={events}
                currentMonth={month}
                today={today}
                onDayClick={() => {}}
                onEventClick={onEventClick || (() => {})}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

