import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react';
import api from '../services/api';

const platformEmojis = { instagram: '📸', facebook: '👤', linkedin: '💼', x: '𝕏' };
const statusDots = { scheduled: 'bg-amber-400', published: 'bg-green-400', draft: 'bg-surface-200/40' };

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
        const res = await api.get(`/schedule?startDate=${startDate}&endDate=${endDate}`);
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [month, year]);

  const getPostsForDay = (day) => {
    return posts.filter(p => {
      const d = new Date(p.scheduledAt);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white dark:text-white light:text-surface-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary-400" /> Content Calendar
        </h1>
        <p className="text-surface-200/50 dark:text-surface-200/50 light:text-surface-700/50 text-sm mt-1">View and manage your scheduled content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white dark:text-white light:text-surface-900">{monthName}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 text-surface-200/60 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-100 text-surface-200/60 hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-surface-200/40 dark:text-surface-200/40 light:text-surface-700/40 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`e-${i}`} className="aspect-square" />;
              const dayPosts = getPostsForDay(day);
              const selected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(selected ? null : day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative
                    ${isToday(day) ? 'bg-primary-500/15 border border-primary-500/30' : ''}
                    ${selected ? 'bg-primary-500/20 border border-primary-500/40 ring-2 ring-primary-500/20' : 'hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-surface-50 border border-transparent'}
                  `}
                >
                  <span className={`text-sm font-medium ${isToday(day) ? 'text-primary-400' : 'text-white dark:text-white light:text-surface-900'}`}>{day}</span>
                  {dayPosts.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayPosts.slice(0, 3).map((p, j) => (
                        <span key={j} className={`w-1.5 h-1.5 rounded-full ${statusDots[p.status] || statusDots.scheduled}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="p-6 rounded-2xl bg-surface-800/50 dark:bg-surface-800/50 light:bg-white border border-white/5 dark:border-white/5 light:border-surface-200">
          <h3 className="text-base font-semibold text-white dark:text-white light:text-surface-900 mb-4">
            {selectedDay ? `${monthName.split(' ')[0]} ${selectedDay}` : 'Select a day'}
          </h3>

          {selectedDay ? (
            selectedPosts.length > 0 ? (
              <div className="space-y-3">
                {selectedPosts.map(post => (
                  <div key={post._id} className="p-4 rounded-xl bg-white/5 dark:bg-white/5 light:bg-surface-50 border border-white/5 dark:border-white/5 light:border-surface-200 animate-slide-up">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${post.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {post.status}
                      </span>
                      <span className="text-xs text-surface-200/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-surface-200/80 dark:text-surface-200/80 light:text-surface-700 line-clamp-3">{post.content}</p>
                    <div className="flex gap-1.5 mt-2">
                      {(post.platforms || []).map(p => (
                        <span key={p} className="text-xs" title={p}>{platformEmojis[p]}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-10 h-10 text-surface-200/15 mx-auto mb-2" />
                <p className="text-sm text-surface-200/40">No posts scheduled</p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="w-10 h-10 text-surface-200/15 mx-auto mb-2" />
              <p className="text-sm text-surface-200/40">Click a day to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
