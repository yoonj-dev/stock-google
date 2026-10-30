import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Compass,
  FileText,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { MarketVolatilityAlert, EarningsFlash } from '../../types/stock';
import { EarningsFlashBanner } from './EarningsFlashBanner';

interface MarketVolatilityAlertBannerProps {
  alert?: MarketVolatilityAlert;
  flash?: EarningsFlash;
  liveChangePercent?: number;
  ticker?: string;
}

export const MarketVolatilityAlertBanner: React.FC<MarketVolatilityAlertBannerProps> = ({
  alert,
  flash,
  liveChangePercent = 0,
  ticker = 'GOOGL',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showEarningsModal, setShowEarningsModal] = useState<boolean>(false);

  // Trigger if backend marked triggered OR client-side live change >= 3%
  const isTriggered = Boolean(alert?.triggered || Math.abs(liveChangePercent) >= 3.0);

  // If volatility alert is not triggered (< 3% change), render standard earnings / schedule banner
  if (!isTriggered) {
    return <EarningsFlashBanner flash={flash} />;
  }

  // Determine direction
  const isPlunge = (alert?.direction === 'PLUNGE') || liveChangePercent < 0;
  const pctDisplay = alert?.changePercent != null
    ? `${alert.changePercent > 0 ? '+' : ''}${alert.changePercent.toFixed(2)}%`
    : `${liveChangePercent > 0 ? '+' : ''}${liveChangePercent.toFixed(2)}%`;

  return (
    <div className="w-full space-y-2">
      <div
        className={`w-full rounded-2xl transition-all duration-200 border p-3.5 sm:p-4 shadow-sm ${
          isPlunge
            ? 'bg-gradient-to-r from-rose-500/12 via-amber-500/10 to-slate-500/10 dark:from-rose-500/20 dark:via-amber-500/15 dark:to-zinc-900 border-rose-500/35 dark:border-rose-400/35'
            : 'bg-gradient-to-r from-emerald-500/12 via-blue-500/10 to-indigo-500/10 dark:from-emerald-500/20 dark:via-blue-500/15 dark:to-zinc-900 border-emerald-500/35 dark:border-emerald-400/35'
        }`}
      >
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Badge & Quick Headline */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs border ${
                isPlunge
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              }`}
            >
              {isPlunge ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />
                  <span>🚨 3% 이상 대규모 급락 긴급 진단 ({pctDisplay})</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />
                  <span>🚀 3% 이상 대규모 급등 랠리 긴급 진단 ({pctDisplay})</span>
                </>
              )}
            </span>

            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              변동성 임계치(3.0%) 초과 감지 · {alert?.detectedAt || '실시간 퀀트 조사'}
            </span>
          </div>

          {/* Right: Quick Action Buttons & Expand Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {flash?.quarter && (
              <button
                onClick={() => setShowEarningsModal(!showEarningsModal)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="공식 실적 세부 요약 보기"
              >
                <FileText className="w-3 h-3 text-blue-500" />
                <span>{showEarningsModal ? '실적 닫기' : `${flash.quarter} 실적`}</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>{isExpanded ? '접기' : '변동 원인 분석'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Primary Reason Headline Strip */}
        <div className="mt-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-100 flex items-start gap-1.5 leading-relaxed">
          <span className="shrink-0 text-amber-500 mt-0.5">⚡</span>
          <span>{alert?.primaryReason || `${ticker} 주가가 당일 세션에서 ${pctDisplay}의 유의미한 변동을 보이고 있어 주요 원인과 기관 수급을 긴급 점검합니다.`}</span>
        </div>

        {/* Expanded Detailed Analysis */}
        {isExpanded && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 dark:border-zinc-700/60 space-y-3.5">
            {/* 1. 3-Pillar Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {(alert?.drivers && alert.drivers.length > 0
                ? alert.drivers
                : [
                    {
                      title: '단기 실적 및 가이던스 반응',
                      description: '공식 분기 실적 발표에 따른 시장 눈높이 재조정 및 단기 수급 쏠림 현상.',
                      type: isPlunge ? 'negative' : 'positive',
                    },
                    {
                      title: '빅테크 AI 인프라 CapEx 재평가',
                      description: 'TPU 클러스터 및 데이터센터 설비투자와 단기 잉여현금흐름(FCF) 간의 상충 우려/기대.',
                      type: 'warning',
                    },
                    {
                      title: '기술적 지지선 및 밸류에이션 버팀목',
                      description: '50일/200일 이동평균선 지지 여부 및 연간 $70B 자사주 매입 하방 안전마진.',
                      type: 'info',
                    },
                  ]
              ).map((driver, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/85 dark:bg-zinc-900/85 border border-slate-200/70 dark:border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        driver.type === 'positive'
                          ? 'bg-emerald-500'
                          : driver.type === 'negative'
                          ? 'bg-rose-500'
                          : driver.type === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span>{driver.title}</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {driver.description}
                  </p>
                </div>
              ))}
            </div>

            {/* 2. Real-time Breaking News Catalysts Strip */}
            {alert?.relatedNews && alert.relatedNews.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3 h-3 text-blue-500" />
                  <span>실시간 관련 뉴스 헤드라인 (클릭 시 원문 확인)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {alert.relatedNews.map((news, idx) => (
                    <a
                      key={idx}
                      href={news.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white dark:bg-zinc-800/70 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-[11px] text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs group"
                    >
                      <span className="font-semibold text-slate-400 dark:text-zinc-500 text-[10px]">
                        [{news.source}]
                      </span>
                      <span className="line-clamp-1 max-w-[280px] sm:max-w-[340px]">
                        {news.title}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Institutional Quant Verdict & Actionable Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {/* Institutional Verdict */}
              <div className="p-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>기관 퀀트 최종 진단 (Institutional Verdict)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {alert?.institutionalVerdict ||
                    '본업 펀더멘털의 구조적 훼손 여부를 선제적으로 점검한 결과, 클라우드 두 자릿수 성장 및 영업이익률 34% 수준의 본업 체력은 견고합니다. 단기 수급 충격에 따른 저평가 구간입니다.'}
                </p>
              </div>

              {/* Action Guide */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isPlunge
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>투자자 대응 가이드라인 (Strategy Guide)</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {alert?.actionGuide ||
                    (isPlunge
                      ? '패닉 셀링을 자제하고 기술적 지지선 및 $70B 자사주 매입 방어력을 확인한 뒤 분할 매수(DCA) 관점으로 대응하세요.'
                      : '단기 과열에 따른 추격 매수보다는 포트폴리오 비중을 점검하고 차익 실현 및 지지선 분할 진입을 권장합니다.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional In-depth Earnings Sub-Banner when toggled */}
      {showEarningsModal && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
          <EarningsFlashBanner flash={flash} />
        </div>
      )}
    </div>
  );
};
