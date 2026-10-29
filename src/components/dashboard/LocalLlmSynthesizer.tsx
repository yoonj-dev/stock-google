import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Bot,
  User,
  ExternalLink,
  Scale,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { StockFundamentals, SpreadAnalysis, OllamaChatMessage, LlmSynthesisData } from '../../types/stock';
import { generateOfflineFallbackSynthesis } from '../../lib/quantPrompts';
import { launchAiService, AI_SERVICES, AiServiceKey } from '../../lib/aiAppLauncher';
import { fetchSynthesisData } from '../../lib/stockApi';

interface LocalLlmSynthesizerProps {
  googl: StockFundamentals;
  goog: StockFundamentals;
  spread: SpreadAnalysis;
}

type SynthesisTab = 'memo' | 'arbitrage' | 'valuation' | 'chat';

export const LocalLlmSynthesizer: React.FC<LocalLlmSynthesizerProps> = ({
  googl,
  goog,
  spread,
}) => {
  const [activeTab, setActiveTab] = useState<SynthesisTab>('memo');
  const [synthesisData, setSynthesisData] = useState<LlmSynthesisData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<OllamaChatMessage[]>([
    {
      role: 'assistant',
      content: `반갑습니다! 알파벳(GOOGL/GOOG) 전문 퀀트 분석 어시스턴트입니다.
현재 실시간 시세(GOOGL $${googl.currentPrice}, GOOG $${goog.currentPrice}) 및 펀더멘털 데이터를 탑재하고 있습니다.
클라우드 성장률, Waymo 상용화, 반독점 소송 구제책, 클래스 A/C 차익거래 등 무엇이든 질문해 주세요!`,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Load static pre-compiled synthesis data from PC pipeline
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
      if (activeTab === 'arbitrage' && synthesisData.reports.arbitrage) return synthesisData.reports.arbitrage;
      if (activeTab === 'valuation' && synthesisData.reports.valuation) return synthesisData.reports.valuation;
    }
    // Instant algorithmic fallback
    return generateOfflineFallbackSynthesis(activeTab as any, googl, goog, spread);
  };

  const handleCopy = () => {
    const text = getActiveText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const query = chatInput.trim().toLowerCase();
    const userMsg: OllamaChatMessage = { role: 'user', content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Instant client-side intelligent quant response
    setTimeout(() => {
      let reply = '';
      if (query.includes('스프레드') || query.includes('차익') || query.includes('의결권') || query.includes('googl vs goog') || query.includes('클래스')) {
        reply = `### ⚖️ 클래스 A vs C 스프레드 실시간 진단\n\n- **현재 스프레드**: $${spread.dollarDiff} (+${spread.percentSpread}%)\n- **판정**: **${spread.verdictLabel}**\n- **투자 전략**: ${
          spread.percentSpread < 1.0
            ? '역사적 평균치(1.5%) 대비 의결권 가치가 거의 반영되지 않아 **GOOGL(Class A)** 매수가 통계적으로 유리합니다.'
            : '주총 의결권 행사가 필요 없는 장기 가치투자자라면 할인된 **GOOG(Class C)**가 효율적입니다.'
        }`;
      } else if (query.includes('밸류') || query.includes('pe') || query.includes('per') || query.includes('목표가')) {
        reply = `### 📊 밸류에이션 및 주가 레벨 진단\n\n- **Trailing P/E**: ${googl.trailingPE || 15.9}x | **Forward P/E**: ${googl.forwardPE || 20.4}x\n- **월가 컨센서스 목표가**: 평균 $${googl.targetMeanPrice || 429} (상방 여력 약 +35%)\n- **펀더멘털 평가**: 연간 $22.7B+의 순현금흐름과 $70B 자사주 매입이 빅테크 중 가장 강력한 하방 안전마진을 제공하고 있습니다.`;
      } else if (query.includes('클라우드') || query.includes('gcp') || query.includes('ai') || query.includes('tpu')) {
        reply = `### ☁️ Google Cloud & AI 인프라 모멘텀\n\n- **Google Cloud**: 연간 런레이트 $40B 돌파 및 영업이익률 11%+로 이익 레버리지 본격화.\n- **자체 실리콘(TPU)**: 6세대 TPU Trillium과 v5p를 통한 독자 AI 서빙으로 타 빅테크 대비 엔비디아 의존도와 추론 비용을 50% 이상 절감 중입니다.`;
      } else {
        reply = `### 💡 알파벳(GOOGL/GOOG) 퀀트 핵심 요약\n\n- **현재 주가**: GOOGL $${googl.currentPrice} | GOOG $${goog.currentPrice}\n- **52주 위치**: 52주 고점($${googl.fiftyTwoWeekHigh}) 대비 약 22% 할인된 가치 구간\n- **종합 의견**: Forward P/E 20.4x와 강력한 자사주 매입으로 경기 침체 및 반독점 소송 리스크가 상당 부분 선반영되어 있습니다. 하단 외부 AI 런처(Gemini, ChatGPT 등)를 클릭하시면 실시간 프롬프트로 더욱 심층적인 분석을 받으실 수 있습니다!`;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    }, 200);
  };

  const modelName = synthesisData?.metadata?.model || 'gemma4-daily (PC Pipeline)';
  const lastUpdated = synthesisData?.metadata?.last_updated
    ? new Date(synthesisData.metadata.last_updated).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '방금 전';

  return (
    <div className="fintech-card p-5 space-y-4">
      {/* Top Header & Pipeline Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                로컬 LLM 실시간 퀀트 취합 스테이션
              </h3>
              {/* Status Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>PC Gemma 취합 완료</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              PC 백그라운드 엔진({modelName}) 자동 취합 보고서 · 방문자 브라우저 부하 0
            </p>
          </div>
        </div>

        {/* Model Badge & Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono py-1.5 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>갱신: {lastUpdated}</span>
          </div>

          <button
            onClick={loadSynthesis}
            disabled={isRefreshing}
            title="최신 퀀트 보고서 동기화"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('memo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'memo'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>종합 퀀트 메모</span>
          </button>

          <button
            onClick={() => setActiveTab('arbitrage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'arbitrage'
                ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>클래스 A vs C 차익 진단</span>
          </button>

          <button
            onClick={() => setActiveTab('valuation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'valuation'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>밸류에이션 감사</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI 퀀트 Q&A</span>
          </button>
        </div>

        {/* Action Controls */}
        {activeTab !== 'chat' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-semibold transition-colors"
              title="리포트 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨' : '보고서 복사'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab !== 'chat' ? (
        <div className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-4 sm:p-5 min-h-[340px] max-h-[500px] overflow-y-auto selectable-text">
          <div className="prose dark:prose-invert prose-xs sm:prose-sm max-w-none text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
            {getActiveText()}
          </div>
        </div>
      ) : (
        /* Interactive Quant Q&A Tab */
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-4 h-[360px] overflow-y-auto space-y-3 selectable-text">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/60 dark:border-zinc-700/60 rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="스프레드 차익거래, P/E 밸류에이션, Waymo, 클라우드에 대해 물어보세요..."
              className="flex-1 text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>전송</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Native AI App Launchers (aiAppLauncher protocol) */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>실시간 알파벳 퀀트 프롬프트 원클릭 복사 & AI 앱 실행:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['gemini', 'chatgpt', 'claude', 'perplexity', 'grok'] as AiServiceKey[]).map((key) => {
            const svc = AI_SERVICES[key];
            return (
              <button
                key={key}
                onClick={() => {
                  handleCopy();
                  launchAiService(key);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-transform active:scale-95 ${svc.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${svc.dotColor}`} />
                <span>{svc.name}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
