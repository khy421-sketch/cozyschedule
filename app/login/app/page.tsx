'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Plus, Bell, Users, User, LogOut, Check, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [schedulers, setSchedulers] = useState<any[]>([]);
  const [selectedScheduler, setSelectedScheduler] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedulerTitle, setNewSchedulerTitle] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');

  // Schedule modal state
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isShared, setIsShared] = useState(true);
  const [recurrence, setRecurrence] = useState('none');
  const [selectedColor, setSelectedColor] = useState('pastel-pink');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);

    // Fetch Schedulers
    const { data: schedData } = await supabase
      .from('schedulers')
      .select('*')
      .eq('owner_id', user.id);
    
    if (schedData) setSchedulers(schedData);

    // Fetch Invitations
    const { data: inviteData } = await supabase
      .from('scheduler_members')
      .select('*, schedulers(*)')
      .eq('user_id', user.id)
      .eq('status', 'pending');
    
    if (inviteData) setInvitations(inviteData);

    fetchSchedules();
  };

  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select('*');
    if (data) setSchedules(data);
  };

  const handleCreateScheduler = async () => {
    if (!newSchedulerTitle.trim()) return;
    const { error } = await supabase.from('schedulers').insert({
      owner_id: user.id,
      title: newSchedulerTitle,
      color_theme: 'pastel-pink'
    });

    if (!error) {
      setNewSchedulerTitle('');
      fetchUserData();
    }
  };

  const handleSendInvite = async () => {
    if (!inviteUsername || !selectedScheduler || selectedScheduler === 'all') return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', inviteUsername)
      .single();

    if (!profile) {
      alert('존재하지 않는 Username입니다.');
      return;
    }

    const { error } = await supabase.from('scheduler_members').insert({
      scheduler_id: selectedScheduler,
      user_id: profile.id,
      role: 'editor',
      status: 'pending'
    });

    if (error) alert('초대 전송 실패!');
    else {
      alert('초대가 전송되었습니다!');
      setShowInviteModal(false);
      setInviteUsername('');
    }
  };

  const handleInvitationResponse = async (id: string, status: 'accepted' | 'rejected') => {
    await supabase.from('scheduler_members').update({ status }).eq('id', id);
    fetchUserData();
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || selectedScheduler === 'all') {
      alert('스케줄러를 먼저 선택해 주세요!');
      return;
    }

    const { error } = await supabase.from('schedules').insert({
      scheduler_id: selectedScheduler,
      author_id: user.id,
      title: scheduleTitle,
      start_time: new Date(scheduleDate).toISOString(),
      end_time: new Date(scheduleDate).toISOString(),
      is_shared: isShared,
      recurrence_rule: recurrence,
      color: selectedColor
    });

    if (!error) {
      setShowScheduleModal(false);
      setScheduleTitle('');
      fetchSchedules();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 card-3d p-6 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-200 flex items-center justify-center font-bold text-2xl text-slate-700 btn-3d">
            📅
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">CozySchedule</h1>
            <p className="text-sm font-semibold text-slate-400">나만의 귀여운 공유 스케줄러</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 초대함 알림 버튼 */}
          <div className="relative">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="p-3 rounded-2xl bg-yellow-100 hover:bg-yellow-200 btn-3d relative"
            >
              <Bell className="w-6 h-6 text-slate-700" />
              {invitations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {invitations.length}
                </span>
              )}
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 btn-3d text-slate-700 font-bold text-sm"
          >
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Schedulers */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card-3d p-5 bg-white">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              📂 스케줄러 목록
            </h2>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => setSelectedScheduler('all')}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold transition btn-3d ${
                  selectedScheduler === 'all' ? 'bg-pink-300 text-slate-800' : 'bg-slate-50 text-slate-600'
                }`}
              >
                🌈 전체 일정 보기
              </button>

              {schedulers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScheduler(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold transition btn-3d flex justify-between items-center ${
                    selectedScheduler === s.id ? 'bg-yellow-200 text-slate-800' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{s.title}</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            {/* 새 스케줄러 추가 */}
            <div className="pt-4 border-t-2 border-slate-100 space-y-2">
              <input
                type="text"
                placeholder="스케줄러 이름 (예: 동아리)"
                value={newSchedulerTitle}
                onChange={(e) => setNewSchedulerTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border-2 border-slate-200 focus:outline-none focus:border-pink-300"
              />
              <button
                onClick={handleCreateScheduler}
                className="w-full py-2 bg-blue-200 hover:bg-blue-300 btn-3d font-bold text-sm text-slate-700 rounded-xl"
              >
                + 새 스케줄러 만들기
              </button>
            </div>
          </div>

          {/* 초대하기 버튼 (특정 스케줄러 선택 시) */}
          {selectedScheduler !== 'all' && (
            <div className="card-3d p-4 bg-purple-100 space-y-2">
              <h3 className="font-bold text-slate-700 text-sm">친구 초대하기</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="상대 ID"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-purple-200 focus:outline-none"
                />
                <button
                  onClick={handleSendInvite}
                  className="px-3 py-2 bg-purple-300 hover:bg-purple-400 btn-3d font-bold text-xs text-slate-800 rounded-xl whitespace-nowrap"
                >
                  초대
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Main: Monthly Calendar */}
        <div className="lg:col-span-3 card-3d p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800">
              {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 btn-3d font-bold text-sm rounded-xl"
              >
                ◀ 이전
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 btn-3d font-bold text-sm rounded-xl"
              >
                다음 ▶
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2 bg-pink-300 hover:bg-pink-400 btn-3d font-bold text-sm text-slate-800 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> 일정 추가
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center font-bold text-slate-500 mb-2">
            <div className="text-red-400">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-400">토</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const daySchedules = schedules.filter(s => 
                isSameDay(new Date(s.start_time), day) &&
                (selectedScheduler === 'all' || s.scheduler_id === selectedScheduler)
              );

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[90px] p-2 border-2 border-slate-100 rounded-2xl flex flex-col justify-start items-start ${
                    isSameMonth(day, currentMonth) ? 'bg-slate-50/50' : 'bg-slate-100/30 opacity-40'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-600 mb-1">
                    {format(day, 'd')}
                  </span>
                  <div className="w-full space-y-1">
                    {daySchedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="text-[10px] font-bold p-1 rounded-lg truncate bg-pink-200 text-slate-800"
                      >
                        {sch.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 초대함 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-3d bg-white p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">💌 초대 대기함</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {invitations.length === 0 ? (
              <p className="text-center text-slate-400 py-8 font-medium">새로운 초대가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center border-2 border-slate-100">
                    <div>
                      <p className="font-bold text-sm text-slate-700">{inv.schedulers?.title}</p>
                      <p className="text-xs text-slate-400">초대받은 스케줄러</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInvitationResponse(inv.id, 'accepted')}
                        className="p-2 bg-green-200 hover:bg-green-300 btn-3d rounded-xl text-slate-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleInvitationResponse(inv.id, 'rejected')}
                        className="p-2 bg-red-200 hover:bg-red-300 btn-3d rounded-xl text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-3d bg-white p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">✨ 새로운 일정 등록</h3>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">일정 제목</label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="예: 동아리 정기 모임"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-pink-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">날짜</label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-pink-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">반복 옵션</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm focus:outline-none"
                >
                  <option value="none">반복 없음</option>
                  <option value="weekly">매주 반복</option>
                  <option value="monthly">매월 반복</option>
                  <option value="yearly">매년 반복</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sharedToggle"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-400 focus:ring-pink-300"
                />
                <label htmlFor="sharedToggle" className="text-xs font-bold text-slate-600">
                  공유 스케줄러의 멤버들에게 이 일정 공유하기
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-pink-300 hover:bg-pink-400 btn-3d font-bold text-slate-800 rounded-2xl transition mt-4"
              >
                일정 저장하기 ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 모바일전용 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 flex justify-around py-3 md:hidden z-40">
        <button className="flex flex-col items-center gap-1 text-xs font-bold text-pink-500">
          <CalendarIcon className="w-5 h-5" /> 캘린더
        </button>
        <button onClick={() => setShowInviteModal(true)} className="flex flex-col items-center gap-1 text-xs font-bold text-slate-400">
          <Bell className="w-5 h-5" /> 초대함
        </button>
      </nav>
    </div>
  );
}
