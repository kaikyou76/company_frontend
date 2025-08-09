"use client";

import { useState, useEffect } from "react";
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

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
              <div className="flex items-center space-x-2">
                <img
                  src="https://placehold.co/32x32"
                  alt="プロフィール"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  田中太郎
                </span>
                <Settings className="w-4 h-4 text-gray-400" />
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
                    <div className="text-2xl font-bold text-orange-600">
                      28.5h
                    </div>
                    <div className="text-xs text-red-600">+6.5h</div>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      今月の出勤日数
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      18日
                    </div>
                    <div className="text-xs text-gray-500">20日中</div>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      今月の休暇日数
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      2日
                    </div>
                    <div className="text-xs text-gray-500">20日中</div>
                  </div>
                  <FileText className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* 最近の活動 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  最近の活動
                </h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  すべて見る
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">出勤打刻</div>
                    <div className="text-sm text-gray-600">今日 09:00</div>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    完了
                  </span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">休暇申請</div>
                    <div className="text-sm text-gray-600">12/25 - 12/26</div>
                  </div>
                  <span className="text-sm font-medium text-orange-600">
                    承認待ち
                  </span>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">残業申請</div>
                    <div className="text-sm text-gray-600">
                      昨日 18:00-20:00
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    承認済み
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：カレンダーと通知 */}
          <div className="space-y-6">
            {/* 今月のカレンダー */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  今月のカレンダー
                </h3>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                  <div key={day} className="p-2 font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const isToday = day === 15;
                  const isWeekend = (i + 1) % 7 === 0 || (i + 1) % 7 === 1;
                  const hasEvent = [5, 12, 19, 26].includes(day);

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        isToday
                          ? "bg-blue-500 text-white font-bold"
                          : hasEvent
                          ? "bg-red-100 text-red-600"
                          : isWeekend
                          ? "text-gray-400"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>今日</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                  <span>休暇</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                  <span>祝日</span>
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
