"use client";

import {
  Clock,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">
                AttendanceHub
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">
                機��E
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">
                料���
              </a>
              <a href="#support" className="text-gray-700 hover:text-blue-600">
                サポ��EチE              </a>
              <a href="#company" className="text-gray-700 hover:text-blue-600">
                会社概要E              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600">
                ログイン
              </button>
              <Link
                href="/auth/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ダチE��ュボ��Eドを見る
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒ��Eローセクション */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              次世代の勤怠管琁E��スチE��
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              GPS・顔認証のダブル打刻機��E、��E動勤務時間計算、位置惁E��・ソフト管琁E��で
              すべてをクラウド��EラチE��フォームで効玁E��に管琁E            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                今すぐ体験すめE              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                ダウンロードすめE              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 機��Eセクション */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              允E��した機��E
            </h2>
            <p className="text-xl text-gray-600">
              現代の働き方に対応した包括皁E��勤怠管琁E����E
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                スマ��Eト打刻
              </h3>
              <p className="text-gray-600">
                GPS位置惁E��と顔認証を絁E��合わせた確実な打刻シスチE��
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                自動勤務時間計箁E              </h3>
              <p className="text-gray-600">
                残業時間・休��E時間を��E動で計算し、正確な勤務管琁E��実現
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                休暇管琁E              </h3>
              <p className="text-gray-600">
                有給申請から承認まで、ワークフローを完��EチE��タル匁E              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ソフト管琁E              </h3>
              <p className="text-gray-600">
                業務ソフトの使用時間を��E動で記録・刁E��
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                在宁E��務対忁E              </h3>
              <p className="text-gray-600">
                リモートワークにも対応した柔軟な勤怠管琁E              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                詳細レポ��EチE              </h3>
              <p className="text-gray-600">
                多角的な刁E��レポ��Eトで労務管琁E��最適匁E              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 効玁E��セクション */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                効玁E��と正確性を両竁E              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      マルチデバイス対忁E                    </h3>
                    <p className="text-gray-600">
                      スマ��Eトフォン・PC・タブレチE��で利用可能
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      リアルタイム同期
                    </h3>
                    <p className="text-gray-600">
                      全チE��イス間でリアルタイムにチE�Eタを同朁E                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      高度なセキュリチE��
                    </h3>
                    <p className="text-gray-600">
                      企業レベルのセキュリチE��で大刁E��チE�Eタを保護
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                <Image
                  src="https://placehold.co/500x400.png"
                  alt="チ��Eムワーク"
                  width={500}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            今すぐ始めませんか！E          </h2>
          <p className="text-xl text-blue-100 mb-8">
            モダンな勤怠管琁E��、チームの生産性を向上させましょぁE          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              無料体験を開姁E            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              営業拁E��に相諁E            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AttendanceHub</h3>
              <p className="text-gray-400">
                次世代の勤怠管琁E��スチE��で、Eチ��Eムの生産性を最大化します、E              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">機��E</h4>
              <ul className="space-y-2 text-gray-400">
                <li>勤怠管琁E/li>
                <li>ソフト管琁E/li>
                <li>休暇管琁E/li>
                <li>レポ��EチE/li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">サポ��EチE/h4>
              <ul className="space-y-2 text-gray-400">
                <li>ヘルプセンター</li>
                <li>お問ぁE��わせ</li>
                <li>マニュアル</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">会社惁E��</h4>
              <ul className="space-y-2 text-gray-400">
                <li>会社概要E/li>
                <li>プライバシー</li>
                <li>利用規紁E/li>
                <li>お知らせ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AttendanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
