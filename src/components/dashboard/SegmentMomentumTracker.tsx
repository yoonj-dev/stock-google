import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  Cloud,
  PlaySquare,
  Search,
  Smartphone,
  Compass,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/stockApi';

export interface BusinessSegment {
  id: string;
  name: string;
  nameKr: string;
  sharePct: number; // e.g. 56.8
  revenueQuarter: string; // e.g. '$49.4B'
  revenueAnnualRunRate: string; // e.g. '$198B'
  yoyGrowth: number; // e.g. 12.2
  operatingMargin?: number; // e.g. 11.3 (for cloud)
  description: string;
  colorClass: string;
  badgeBg: string;
  icon: React.ReactNode;
}

const ALPHABET_SEGMENTS: BusinessSegment[] = [
  {
    id: 'search',
    name: 'Google Search & Other',
    nameKr: '구글 검색 및 포털 광고',
    sharePct: 56.8,
    revenueQuarter: '$49.39B',
    revenueAnnualRunRate: '$198B',
    yoyGrowth: 12.2,
    description: 'AI 오버뷰(AI Overviews) 도입으로 검색 쿼리당 수익성 및 사용자 참여도 증가.',
    colorClass: 'bg-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    icon: <Search className="w-4 h-4" />,
  },
  {
    id: 'subscriptions',
    name: 'Google Subscriptions, Platforms & Devices',
    nameKr: '구독, 안드로이드 및 하드웨어',
    sharePct: 12.2,
    revenueQuarter: '$10.66B',
    revenueAnnualRunRate: '$43B',
    yoyGrowth: 27.8,
    description: 'YouTube Premium, YouTube TV, Google One 및 Pixel 9 AI 디바이스 폭발적 성장.',
    colorClass: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    icon: <Smartphone className="w-4 h-4" />,
  },
  {
    id: 'cloud',
    name: 'Google Cloud (GCP & Workspace)',
    nameKr: '구글 클라우드 & AI 인프라',
    sharePct: 13.0,
    revenueQuarter: '$11.35B',
    revenueAnnualRunRate: '$45B',
    yoyGrowth: 34.9,
    operatingMargin: 11.3,
    description: 'TPU v5p 및 Gemini Enterprise 도입 급증으로 영업이익률 흑자폭 대폭 확대.',
    colorClass: 'bg-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    icon: <Cloud className="w-4 h-4" />,
  },
  {
    id: 'youtube_ads',
    name: 'YouTube Advertising',
    nameKr: '유튜브 동영상 광고',
    sharePct: 10.2,
    revenueQuarter: '$8.92B',
    revenueAnnualRunRate: '$36B',
    yoyGrowth: 12.2,
    description: '쇼츠(Shorts) 일일 조회수 700억 회 돌파 및 커넥티드 TV(CTV) 광고 시장 장악.',
    colorClass: 'bg-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    icon: <PlaySquare className="w-4 h-4" />,
  },
  {
    id: 'network',
    name: 'Google Network (AdSense)',
    nameKr: '구글 네트워크 (퍼블리셔 광고)',
    sharePct: 7.3,
    revenueQuarter: '$6.35B',
    revenueAnnualRunRate: '$25B',
    yoyGrowth: -1.6,
    description: '외부 제휴사 디스플레이 광고. 독점 규제 대응 및 서드파티 쿠키 정책 개편 중.',
    colorClass: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    icon: <Compass className="w-4 h-4" />,
  },
  {
    id: 'other_bets',
    name: 'Other Bets (Waymo, Verily)',
    nameKr: '아더 베츠 (Waymo 로보택시)',
    sharePct: 0.5,
    revenueQuarter: '$0.39B',
    revenueAnnualRunRate: '$1.6B',
    yoyGrowth: 31.0,
    description: 'Waymo 주당 15만 건 이상 상용 무인 승차 완료. 피닉스, SF, LA, 오스틴 확장.',
    colorClass: 'bg-teal-500',
    badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    icon: <Compass className="w-4 h-4" />,
  },
];

export const SegmentMomentumTracker: React.FC = React.memo(() => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('cloud');

  const selectedSegment = ALPHABET_SEGMENTS.find((s) => s.id === selectedSegmentId) || ALPHABET_SEGMENTS[0];

  return (
    <div className="fintech-card p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                알파벳 사업부문별 실적 기여도 & 성장 모멘텀
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-[10.5px] font-bold border border-blue-500/20">
                공식 10-Q 세그먼트 공시
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              검색(Search) 캐시카우와 클라우드(+34.9%)·구독(+27.8%) 고성장 엔진의 수익 구조 분해
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
          총 분기 매출: <strong className="text-slate-900 dark:text-white font-bold">$88.27B</strong> (YoY +15.1%)
        </div>
      </div>

      {/* Proportional Segment Distribution Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
          <span>매출 포트폴리오 비중 (Revenue Mix)</span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">클릭하여 사업부별 상세 보기</span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="w-full h-7 rounded-xl overflow-hidden flex shadow-xs border border-slate-200/60 dark:border-zinc-800">
          {ALPHABET_SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSelectedSegmentId(seg.id)}
              style={{ width: `${Math.max(seg.sharePct, 2)}%` }}
              title={`${seg.name}: ${seg.sharePct}%`}
              className={`h-full ${seg.colorClass} relative group transition-opacity hover:opacity-85 focus:outline-hidden ${
                selectedSegmentId === seg.id ? 'ring-2 ring-white dark:ring-zinc-900 z-10' : 'opacity-90'
              }`}
            >
              <span className="sr-only">{seg.name}</span>
            </button>
          ))}
        </div>

        {/* Legend Chips */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          {ALPHABET_SEGMENTS.map((seg) => {
            const isSelected = selectedSegmentId === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedSegmentId(seg.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${seg.colorClass}`} />
                <span>{seg.nameKr.split(' ')[0]}</span>
                <span className="font-mono text-[11px] opacity-80">{seg.sharePct}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Segment Deep Dive Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${selectedSegment.badgeBg} border`}>
              {selectedSegment.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedSegment.nameKr}
                </h4>
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  ({selectedSegment.name})
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                {selectedSegment.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 dark:text-zinc-500">분기 매출</div>
              <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                {selectedSegment.revenueQuarter}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400 dark:text-zinc-500">YoY 성장률</div>
              <div
                className={`text-sm font-black font-mono flex items-center justify-end gap-0.5 ${
                  selectedSegment.yoyGrowth >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {selectedSegment.yoyGrowth >= 0 ? '+' : ''}
                {selectedSegment.yoyGrowth.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Operating Margin Leverage Spotlight */}
        {selectedSegment.id === 'cloud' && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-indigo-900 dark:text-indigo-200">
                <strong>클라우드 영업이익률 레버리지 폭발:</strong> 과거 적자에서 이번 분기{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 underline">
                  영업이익 13.0억 달러 (OPM 11.3%)
                </strong>
                로 흑자 전환하며 알파벳 전체 영업이익 성장의 30%를 단독 견인 중입니다.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});