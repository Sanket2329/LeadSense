import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from 'date-fns';
import { useOverdueActivities } from '../hooks/useActivities';
import { ActivityTypeLabels } from '../types';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: overdue = [] } = useOverdueActivities();

  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd     = endOfWeek(monthEnd,     { weekStartsOn: 1 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  function prevMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  function nextMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }

  const eventsForDay = (day: Date) =>
    overdue.filter(a => a.scheduledFor && isSameDay(new Date(a.scheduledFor), day));

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="p-8">
      <div className="page-header mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#60a5fa' }}>Schedule</p>
            <h1 className="text-3xl font-black text-white">Calendar</h1>
            <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>Your activities at a glance</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)' }}>
            <CalendarDays size={26} color="#93c5fd" />
          </div>
        </div>
      </div>

      <div className="card-3d p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="btn-3d btn-beige btn-sm" aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-3d btn-beige btn-sm">
              Today
            </button>
            <button onClick={nextMonth} className="btn-3d btn-beige btn-sm" aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center py-2 text-xs font-bold uppercase tracking-widest"
              style={{ color: '#94a3b8' }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const events = eventsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const today   = isToday(day);

            return (
              <div key={idx} className="min-h-20 rounded-xl p-1.5 transition-all"
                style={{
                  background: today ? '#eff6ff' : inMonth ? '#fff' : '#f8fafc',
                  border: today ? '2px solid #4f46e5' : '1px solid #f1f5f9',
                }}>
                <span className="block text-right mb-1 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ml-auto"
                  style={{
                    color: today ? '#fff' : inMonth ? '#0f172a' : '#cbd5e1',
                    background: today ? '#4f46e5' : 'transparent',
                  }}>
                  {format(day, 'd')}
                </span>
                {events.slice(0, 2).map(ev => (
                  <div key={ev.id} className="rounded-md px-1.5 py-0.5 mb-0.5 truncate text-xs font-semibold"
                    style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                    {ActivityTypeLabels[ev.type]}
                  </div>
                ))}
                {events.length > 2 && (
                  <div className="text-xs font-bold" style={{ color: '#94a3b8' }}>+{events.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming overdue section */}
      {overdue.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(180deg,#e11d48,#881337)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Overdue This Month</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdue.map(act => (
              <div key={act.id} className="card-3d p-4"
                style={{ borderLeft: '4px solid #e11d48' }}>
                <span className="text-xs font-black uppercase rounded-full px-2.5 py-0.5"
                  style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
                  {ActivityTypeLabels[act.type]}
                </span>
                <p className="mt-2 text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{act.notes}</p>
                {act.scheduledFor && (
                  <p className="mt-1 text-xs" style={{ color: '#94a3b8' }}>
                    {format(new Date(act.scheduledFor), 'dd MMM yyyy · HH:mm')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
