import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Compass,
  FileText,
  Sparkles,
  Scale,
  Cpu,
  Car,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { MarketVolatilityAlert, EarningsFlash, MajorIssueCategory } from '../../types/stock';
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

  // Trigger if backend marked triggered (price volatility OR major catalyst) OR client-side live change >= 3%
  const isTriggered = Boolean(alert?.triggered || Math.abs(liveChangePercent) >= 3.0);

  // If no major alert is active (< 3% change and no major issues), render standard earnings / schedule banner
  if (!isTriggered) {
    return <EarningsFlashBanner flash={flash} />;
  }

  const category: MajorIssueCategory = alert?.category || 'PRICE_VOLATILITY';
  const isPlunge = (alert?.direction === 'PLUNGE') || liveChangePercent < 0;
  const pctDisplay = alert?.changePercent != null
    ? `${alert.changePercent > 0 ? '+' : ''}${alert.changePercent.toFixed(2)}%`
    : `${liveChangePercent > 0 ? '+' : ''}${liveChangePercent.toFixed(2)}%`;

  // Theme configuration based on detected major issue category
  const getThemeClasses = () => {
    switch (category) {
      case 'ANTITRUST_LEGAL':
        return {
          wrapper: 'bg-gradient-to-r from-purple-500/12 via-indigo-500/10 to-slate-500/10 dark:from-purple-500/20 dark:via-indigo-500/15 dark:to-zinc-900 border-purple-500/35 dark:border-purple-400/35',
          badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
          icon: <Scale className="w-3.5 h-3.5 stroke-[2.5]" />,
          title: `⚖️ [사법·반독점 중대 이슈] 미 법무부(DOJ) 구제책 판결 영향 분석 (${pctDisplay})`,
        };
      case 'AI_SILICON':
        return {
          wrapper: 'bg-gradient-to-r from-blue-500/12 via-cyan-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:via-cyan-500/15 dark:to-zinc-900 border-blue-500/35 dark:border-blue-400/35',
          badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
          icon: <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />,
          title: `🧠 [AI·자체 TPU 중대 혁신] 구글 TPU 수주 및 Gemini 모멘텀 (${pctDisplay})`,
        };
      case 'WAYMO_AUTONOMOUS':
        return {
          wrapper: 'bg-gradient-to-r from-emerald-500/12 via-teal-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-zinc-900 border-teal-500/35 dark:border-teal-400/35',
          badge: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
          icon: <Car className="w-3.5 h-3.5 stroke-[2.5]" />,
          title: `🚗 [Waymo 자율주행 속보] 로보택시 상용화 및 서비스 확대 (${pctDisplay})`,
        };
      case 'EARNINGS_CATALYST':
        return {
          wrapper: 'bg-gradient-to-r from-amber-500/12 via-rose-500/10 to-indigo-500/10 dark:from-amber-500/20 dark:via-rose-500/15 dark:to-zinc-900 border-amber-500/35 dark:border-amber-400/35',
          badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
          icon: <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />,
          title: `📊 [공식 실적 속보] ${flash?.quarter || '최근 분기'} 실적 및 가이던스 긴급 진단 (${pctDisplay})`,
        };
      case 'PRICE_VOLATILITY':
      default:
        if (isPlunge) {
          return {
            wrapper: 'bg-gradient-to-r from-rose-500/12 via-amber-500/10 to-slate-500/10 dark:from-rose-500/20 dark:via-amber-500/15 dark:to-zinc-900 border-rose-500/35 dark:border-rose-400/35',
            badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
            icon: <TrendingDown className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />,
            title: `🚨 3% 이상 대규모 급락 긴급 진단 (${pctDisplay})`,
          };
        } else {
          return {
            wrapper: 'bg-gradient-to-r from-emerald-500/12 via-blue-500/10 to-indigo-500/10 dark:from-emerald-500/20 dark:via-blue-500/15 dark:to-zinc-900 border-emerald-500/35 dark:border-emerald-400/35',
            badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
            icon: <TrendingUp className="w-3.5 h-3.5 animate-bounce stroke-[2.5]" />,
            title: `🚀 3% 이상 대규모 급등 랠리 긴급 진단 (${pctDisplay})`,
          };
        }
    }
  };

  const theme = getThemeClasses();

  return (
    <div className="w-full space-y-2">
      <div className={`w-full rounded-2xl transition-all duration-200 border p-3.5 sm:p-4 shadow-sm ${theme.wrapper}`}>
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Badge & Quick Headline */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs border ${theme.badge}`}>
              {theme.icon}
              <span>{theme.title}</span>
            </span>

            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {alert?.triggerReason === 'BOTH'
                ? '대규모 가격 급변 및 중대 촉매 동시 감지'
                : alert?.triggerReason === 'MAJOR_CATALYST'
                ? '글로벌 주요 이슈 감지'
                : '변동성 임계치(3.0%) 초과 감지'}{' '}
              · {alert?.detectedAt || '실시간 퀀트 조사'}
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
              <span>{isExpanded ? '접기' : '세부 분석'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Primary Reason Headline Strip */}
        <div className="mt-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-100 flex items-start gap-1.5 leading-relaxed">
          <span className="shrink-0 text-amber-500 mt-0.5">⚡</span>
          <span>
            {alert?.primaryReason ||
              `${ticker}에 유의미한 시장 영향({${pctDisplay}})을 미치는 핵심 이슈가 포착되어 긴급 점검을 진행합니다.`}
          </span>
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
                      title: '사법 및 규제 리스크 파급력',
                      description: '미 법무부 반독점 구제책 및 검색 시장 점유율에 대한 구조적 영향 평가.',
                      type: 'warning',
                    },
                    {
                      title: '자체 AI 실리콘(TPU) 및 클라우드 성장',
                      description: 'OpenAI 등 대형 수주 모멘텀과 원가 50% 절감의 플랫폼 수직계열화.',
                      type: 'positive',
                    },
                    {
                      title: '밸류에이션 및 주주환원 안전마진',
                      description: 'Forward P/E 18.8x 바닥 영역 및 연간 $70B 자사주 매입 방어선.',
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
