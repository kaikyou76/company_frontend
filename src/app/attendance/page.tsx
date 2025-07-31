"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
} from "lucide-react";

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
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
                  className="text-gray-700 hover:text-blue-600"
                >
                  ダッシュボード
                </a>
                <a
                  href="/attendance"
                  className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4"
                >
                  勤怠打刻
                </a>
                <a href="/leave" className="text-gray-700 hover:text-blue-600">
                  ソフト管理
                </a>
                <a
                  href="/reports"
                  className="text-gray-700 hover:text-blue-600"
                >
                  休暇申請
                </a>
                <a href="/admin" className="text-gray-700 hover:text-blue-600">
                  レポート
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">勤怠打刻</h1>
          <p className="text-gray-600">GPS・顔認証対応の確実な勤怠管理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：打刻エリア */}
          <div className="lg:col-span-2">
            {/* 現在時刻表示 */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6 text-center">
              <div className="text-6xl font-bold text-gray-900 mb-4">
                {currentTime.toLocaleTimeString("ja-JP")}
              </div>
              <div className="text-xl text-gray-600">
                {currentTime.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </div>
            </div>

            {/* 打刻ボタンエリア */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  出勤打刻
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">現在位置</div>
                      <div className="text-xs text-gray-500">
                        東京本社（許可範囲内）
                      </div>
                    </div>
                    {location && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">顔認証</div>
                      <div className="text-xs text-gray-500">認証済み</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <button
                    onClick={() => setIsLoading(true)}
                    disabled={!location || isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-lg font-semibold transition-colors"
                  >
                    {isLoading ? "打刻中..." : "出勤打刻"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  退勤打刻
                </h3>
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm">出勤打刻後に利用可能</div>
                  </div>

                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-4 rounded-lg font-semibold cursor-not-allowed"
                  >
                    退勤打刻
                  </button>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                クイックアクション
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">休暇申請</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">残業申請</span>
                </button>
              </div>
            </div>
          </div>

          {/* 右側：本日の勤務状況と履歴 */}
          <div className="space-y-6">
            {/* 本日の勤務状況 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                本日の勤務状況
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">出勤時刻</div>
                      <div className="text-xs text-gray-500">今日</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    09:00
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">退勤時刻</div>
                      <div className="text-xs text-gray-500">予定</div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">18:00</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">勤務時間</div>
                      <div className="text-xs text-gray-500">現在まで</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">
                    8.0h
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">休憩時間</div>
                      <div className="text-xs text-gray-500">合計</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    1.0h
                  </span>
                </div>
              </div>
            </div>

            {/* 最近の打刻記録 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                最近の打刻記録
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">日付</th>
                      <th className="text-left py-2">出勤</th>
                      <th className="text-left py-2">退勤</th>
                      <th className="text-left py-2">勤務時間</th>
                      <th className="text-left py-2">状態</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-gray-100">
                      <td className="py-2">12/15 (金)</td>
                      <td className="py-2">09:00</td>
                      <td className="py-2">-</td>
                      <td className="py-2">6.5h</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full">
                          勤務中
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">12/14 (木)</td>
                      <td className="py-2">09:15</td>
                      <td className="py-2">18:30</td>
                      <td className="py-2">8.25h</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          完了
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">12/13 (水)</td>
                      <td className="py-2">08:45</td>
                      <td className="py-2">19:00</td>
                      <td className="py-2">9.25h</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                          残業
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">12/12 (火)</td>
                      <td className="py-2">09:00</td>
                      <td className="py-2">18:00</td>
                      <td className="py-2">8.0h</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          完了
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">12/11 (月)</td>
                      <td className="py-2">-</td>
                      <td className="py-2">-</td>
                      <td className="py-2">0h</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          休暇
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
