import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Cloud,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { StockFundamentals, LlmSynthesisData } from '../../types/stock';
import { generateOfflineFallbackSynthesis, SynthesisReportType } from '../../lib/quantPrompts';
import { launchAiService, AI_SERVICES, AiServiceKey } from '../../lib/aiAppLauncher';
import { fetchSynthesisData } from '../../lib/stockApi';

interface LocalLlmSynthesizerProps {
  googl: StockFundamentals;
  goog: StockFundamentals;
  externalQuestion?: string;
  onQuestionHandled?: () => void;
}

type TabKey = SynthesisReportType;

export const LocalLlmSynthesizer: React.FC<LocalLlmSynthesizerProps> = ({
  googl,
  goog,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('memo');
  const [synthesisData, setSynthesisData] = useState<LlmSynthesisData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load pre-compiled quantitative research reports
  const loadSynthesis = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSynthesisData();
      if (data) {
        setSynthesisData(data);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSynthesis();
  }, []);

  const getActiveText = (): string => {
    if (synthesisData?.reports) {
      if (activeTab === 'memo' && synthesisData.reports.memo) return synthesisData.reports.memo;
      if (activeTab === 'ai_cloud' && synthesisData.reports.ai_cloud) return synthesisData.reports.ai_cloud;
      if (activeTab === 'regulatory' && synthesisData.reports.regulatory) return synthesisData.reports.regulatory;
      if (activeTab === 'valuation' && synthesisData.reports.valuation) return synthesisData.reports.valuation;
    }
    return generateOfflineFallbackSynthesis(activeTab, googl, goog);
  };

  const handleCopy = () => {
    const text = getActiveText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fintech-card p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                기관급 AI 퀀트 심층 리서치 메모
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Gemma 4 검증완료</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              최신 10-Q 실적, 클라우드 수주 백로그, 반독점 소송 리스크 및 역DCF 밸류에이션 종합
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {synthesisData?.metadata?.last_updated && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
              <Clock className="w-3 h-3" />
              {synthesisData.metadata.last_updated.slice(5, 16)} KST
            </span>
          )}
          <button
            onClick={loadSynthesis}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
            title="리포트 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('memo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'memo'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>종합 분석 메모</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_cloud')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ai_cloud'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>클라우드 & TPU 실리콘</span>
          </button>

          <button
            onClick={() => setActiveTab('regulatory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'regulatory'
                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>반독점 소송 & 해자 진단</span>
          </button>

          <button
            onClick={() => setActiveTab('valuation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'valuation'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>밸류에이션 감사</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            title="리포트 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '보고서 복사'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-4 sm:p-5 min-h-[300px] max-h-[500px] overflow-y-auto selectable-text">
        <div className="prose dark:prose-invert prose-xs sm:prose-sm max-w-none text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
          {getActiveText()}
        </div>
      </div>

      {/* One-Click External AI Launcher Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>외부 전문 AI로 즉시 심층 분석 실행:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(AI_SERVICES) as AiServiceKey[]).map((key) => {
            const svc = AI_SERVICES[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => launchAiService(key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                title={`${svc.name}으로 추가 심층 분석 실행`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${svc.dotColor}`} />
                <span>{svc.name}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
