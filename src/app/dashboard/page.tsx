"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Calendar,
  FileText,
  Users,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { logoutUserAsync } from '@/app/store';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      // 调用登出异步操作
      const result = await dispatch(logoutUserAsync());
      
      // 登出成功后跳转到登录页面
      if (logoutUserAsync.fulfilled.match(result) && result.payload.success) {
        router.push('/auth/login');
      } else {
        // 即使失败也跳转到登录页面
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('登出失败:', error);
      // 即使失败也跳转到登录ページ
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PC版ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">
                AttendanceHub
              </h1>
              <nav className="hidden md:flex space-x-6">
                <a
                  href="/dashboard"
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4"
                >
                  ダッシュボード
                </a>
                <a
                  href="/attendance"
                  className="text-gray-700 hover:text-blue-600 pb-4"
                >
                  勤怠打刻
                </a>
                <a
                  href="/leave"
                  className="text-gray-700 hover:text-blue-600 pb-4"
                >
                  ソフト管理
                </a>
                <a
                  href="/reports"
                  className="text-gray-700 hover:text-blue-600 pb-4"
                >
                  休暇申請
                </a>
                <a
                  href="/admin"
                  className="text-gray-700 hover:text-blue-600 pb-4"
                >
                  レポート
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="検索..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2 relative group">
                <Image
                  src="https://placehold.co/32x32.png"
                  alt="プロフィール"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  田中太郎
                </span>
                <Settings className="w-4 h-4 text-gray-400" />
                
                {/* 登出メニュー */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">勤務状況の概要と最新情報</p>
        </div>

        {/* メインアクション（PC版：横並び） */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl shadow-lg transition-all hover:scale-105">
            <Clock className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold text-lg">出勤打刻</div>
            <div className="text-sm opacity-90">GPS位置確認済み</div>
          </button>

          <button className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl shadow-lg transition-all hover:scale-105">
            <MapPin className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold text-lg">退勤打刻</div>
            <div className="text-sm opacity-90">本日の勤務終了</div>
          </button>

          <button className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl shadow-lg transition-all hover:scale-105">
            <Calendar className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold text-lg">休暇申請</div>
            <div className="text-sm opacity-90">有給・特別休暇</div>
          </button>

          <button className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-xl shadow-lg transition-all hover:scale-105">
            <FileText className="w-8 h-8 mx-auto mb-3" />
            <div className="font-semibold text-lg">残業申請</div>
            <div className="text-sm opacity-90">時間外勤務</div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：統計情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      今月の勤務時間
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      168.5h
                    </div>
                    <div className="text-xs text-green-600">+2.5h</div>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      今月の残業時間
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      12.5h
                    </div>
                    <div className="text-xs text-red-600">+1.2h</div>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      今月の休暇使用
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      2日
                    </div>
                    <div className="text-xs text-gray-600">/ 5日</div>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      今月の出勤率
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      98.2%
                    </div>
                    <div className="text-xs text-green-600">+0.3%</div>
                  </div>
                  <Users className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* 勤務状況チャート */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  週間勤務状況
                </h3>
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    12月9日 - 12月15日
                  </span>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { day: "月", date: "12/9", hours: 8.5, status: "completed" },
                  { day: "火", date: "12/10", hours: 8.0, status: "completed" },
                  { day: "水", date: "12/11", hours: 9.0, status: "overtime" },
                  { day: "木", date: "12/12", hours: 8.5, status: "completed" },
                  { day: "金", date: "12/13", hours: 0, status: "pending" },
                  { day: "土", date: "12/14", hours: 0, status: "weekend" },
                  { day: "日", date: "12/15", hours: 0, status: "weekend" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-16">
                      <div className="text-sm font-medium text-gray-900">
                        {item.day}
                      </div>
                      <div className="text-xs text-gray-500">{item.date}</div>
                    </div>

                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === "completed"
                                ? "bg-green-500"
                                : item.status === "overtime"
                                ? "bg-purple-500"
                                : item.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-gray-200"
                            }`}
                            style={{
                              width:
                                item.status === "weekend"
                                  ? "0%"
                                  : `${(item.hours / 9) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="w-12 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {item.status === "weekend" ? "-" : item.hours}
                      </div>
                      <div className="text-xs text-gray-500">時間</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 今月のスケジュール */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                今月のスケジュール
              </h3>

              <div className="space-y-3">
                {[
                  {
                    date: "12/20",
                    title: "プロジェクト会議",
                    time: "14:00 - 15:30",
                    type: "meeting",
                  },
                  {
                    date: "12/22",
                    title: "社内研修",
                    time: "10:00 - 12:00",
                    type: "training",
                  },
                  {
                    date: "12/25",
                    title: "圣诞节休暇",
                    time: "終日",
                    type: "holiday",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 text-center">
                      <div className="text-xs font-medium text-gray-500">
                        {item.date}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.type === "meeting"
                            ? "bg-blue-100 text-blue-800"
                            : item.type === "training"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.type === "meeting"
                          ? "会議"
                          : item.type === "training"
                          ? "研修"
                          : "休暇"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右側：サイドバー */}
          <div className="space-y-6">
            {/* カレンダー */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  2023年12月
                </h3>
                <div className="flex space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, index) => {
                  const day = index - 3; // 12月は1日が金曜日なので調整
                  const isCurrentMonth = day >= 1 && day <= 31;
                  const isToday = day === 13; // 今日を13日とする

                  return (
                    <div
                      key={index}
                      className={`text-center text-sm p-1 rounded ${
                        !isCurrentMonth
                          ? "text-gray-300"
                          : isToday
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {isCurrentMonth ? day : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 出勤状況 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                本日の出勤状況
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        出勤
                      </div>
                      <div className="text-xs text-gray-500">09:05</div>
                    </div>
                  </div>
                  <MapPin className="w-4 h-4 text-green-500" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        退勤
                      </div>
                      <div className="text-xs text-gray-500">-</div>
                    </div>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">勤務時間</span>
                    <span className="font-medium">08:55</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">残業時間</span>
                    <span className="font-medium text-purple-600">00:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 通知・アラート */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                通知・アラート
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-red-800">
                        残業時間超過警告
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        今月の残業時間が規定を超えています。労働基準法に注意してください。
                      </div>
                    </div>
                    <span className="text-xs text-red-500">2時間前</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-800">
                        ソフト変更のお知らせ
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        来週のソフトが更新されました。確認してください。
                      </div>
                    </div>
                    <span className="text-xs text-blue-500">5時間前</span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800">
                        休暇申請が承認されました
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        12/25-12/26の休暇申請が承認されました。
                      </div>
                    </div>
                    <span className="text-xs text-green-500">昨日</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}