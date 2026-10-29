import React, { useState } from 'react';
import {
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Cloud,
  Cpu,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import { EarningsFlash } from '../../types/stock';

interface EarningsFlashBannerProps {
  flash?: EarningsFlash;
}

const DEFAULT_FLASH: EarningsFlash = {
  quarter: '2026 Q3',
  reportDate: '2026-10-28',
  revenue: 127.6,
  revenueYoY: 25.0,
  revenueEstimate: 122.5,
  revenueBeat: true,
  eps: 2.12,
  epsEstimate: 3.01,
  epsSurprisePercent: -29.5,
  epsBeat: false,
  epsMissReason: 'SpaceX 투자 지분 비현금성 미실현 평가손실 -$8.2B 반영 (본업 영업이익 $40.6B +30% 성장)',
  cloudRevenue: 30.7,
  cloudYoY: 103.0,
  cloudOpIncome: 11.1,
  cloudOpMargin: 36.2,
  youtubeRevenue: 11.2,
  youtubeYoY: 9.0,
  searchRevenue: 63.4,
  searchYoY: 12.0,
  capex: 51.4,
  capexYoY: 114.2,
  fullYearCapexGuidance: '$195B ~ $205B (AI 기술 인프라 및 TPU 대량 배치)',
  afterMarketPrice: 292.50,
  afterMarketChangePercent: -9.97,
  keyTakeaway:
    '본업(클라우드 +103% 폭발적 성장, 검색 +12%)은 역대급 호실적을 달성했으나, 공격적인 AI CapEx($51.4B)와 SpaceX 평가손(-$8.2B)으로 인한 회계상 EPS 미스가 장외 투매를 유발함. 본업 펀더멘털은 견고함.',
};

export const EarningsFlashBanner: React.FC<EarningsFlashBannerProps> = ({ flash = DEFAULT_FLASH }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 dark:from-amber-500/15 dark:via-rose-500/15 dark:to-indigo-500/15 border border-amber-500/30 dark:border-amber-400/30 p-3.5 sm:p-4 shadow-sm transition-all duration-200">
      {/* Top Header Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Badge & Core Alert */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>🚨 {flash.quarter} 실적 속보 (Earnings Flash)</span>
          </span>

          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            10월 28일 장 마감 직후 발표 · 긴급 퀀트 브리핑
          </span>
        </div>

        {/* Right: Quick Metrics Strip & Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
            <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-800/80 text-emerald-600 dark:text-emerald-400 border border-slate-200/60 dark:border-zinc-700">
              매출 $127.6B (+25% Beat)
            </span>
            <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-800/80 text-rose-600 dark:text-rose-400 border border-slate-200/60 dark:border-zinc-700">
              장외 $292.50 (-9.97%)
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <span>{isExpanded ? '접기' : '세부 분석'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Detailed Analysis */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-200/60 dark:border-zinc-700/60 space-y-3.5">
          {/* 4 Core Segment Financial Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Card 1: Total Revenue */}
            <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/70 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                <span>총 매출 (Revenue)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                  Beat 🟢
                </span>
              </div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                ${flash.revenue}B
              </div>
              <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                +{flash.revenueYoY}% YoY (예상 ${flash.revenueEstimate}B)
              </div>
            </div>

            {/* Card 2: Reported EPS & Miss Reason */}
            <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/70 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                <span>주당순이익 (EPS)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono">
                  Miss 🔴
                </span>
              </div>
              <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                ${flash.eps.toFixed(2)}
              </div>
              <div className="text-[10.5px] text-rose-600 dark:text-rose-400 font-semibold font-mono">
                {flash.epsSurprisePercent}% vs 예상 ${flash.epsEstimate}
              </div>
            </div>

            {/* Card 3: Google Cloud (Historic Boom) */}
            <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/70 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-blue-500" />
                  Google Cloud
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
                  +103% 🚀
                </span>
              </div>
              <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                ${flash.cloudRevenue}B
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-medium font-mono">
                영업익 ${flash.cloudOpIncome}B (마진 {flash.cloudOpMargin}%)
              </div>
            </div>

            {/* Card 4: AI CapEx & Guidance */}
            <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/70 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-500" />
                  설비투자 (CapEx)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono">
                  +{flash.capexYoY}%
                </span>
              </div>
              <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                ${flash.capex}B
              </div>
              <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-medium">
                연간 가이던스 $200B 유지
              </div>
            </div>
          </div>

          {/* Sub-Segments Summary Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-slate-600 dark:text-zinc-300">
            <span className="px-2 py-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/60">
              🔍 검색 매출: <strong className="text-slate-900 dark:text-white">${flash.searchRevenue}B (+{flash.searchYoY}% YoY)</strong>
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/60">
              📺 YouTube 광고: <strong className="text-slate-900 dark:text-white">${flash.youtubeRevenue}B (+{flash.youtubeYoY}% YoY)</strong>
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/60 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/60">
              ⚡ 클라우드 런레이트: <strong className="text-blue-600 dark:text-blue-400">$122.8B 돌파</strong>
            </span>
          </div>

          {/* Institutional Diagnosis: Why did after-market dump -9.97%? */}
          <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-amber-500/25 dark:border-amber-400/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>장외 급락($292.50, -9.97%) 핵심 원인 & 기관 팩트체크</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              <strong>1. EPS 미스의 실체:</strong> 본업 영업이익은 <strong>$40.6B(+30% YoY)</strong>로 사상 최대치를 기록했으나, 비영업 항목인 <strong>SpaceX 투자 지분 미실현 평가손실 -$8.2B</strong>가 장부상 반영되어 외형상 EPS($2.12)가 낮아진 비현금성 회계 왜곡입니다.
              <br />
              <strong>2. CapEx $51.4B 공포:</strong> 분기 설비투자가 2배 이상 폭증하며 단기 잉여현금흐름(FCF)이 일시적 -$9.1B로 위축된 점이 알고리즘 차익 실현을 촉발했습니다.
              <br />
              <strong>3. 기관 퀀트 결론:</strong> 클라우드 +103% 폭증과 마진 36.2% 도약은 역대 최강의 해자를 증명하며, 일회성 회계 충격에 따른 $300 하회 구간은 <strong>Forward P/E 18.8x의 강력한 저가 매수(Safety Margin) 기회</strong>로 분석됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};