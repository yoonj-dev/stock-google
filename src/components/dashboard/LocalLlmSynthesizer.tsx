import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Send,
  Square,
  Bot,
  User,
  ExternalLink,
  SlidersHorizontal,
  Scale,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { StockFundamentals, SpreadAnalysis, OllamaModelTag, OllamaChatMessage } from '../../types/stock';
import {
  checkOllamaHealth,
  streamOllamaChat,
  buildPromptForType,
  generateOfflineFallbackSynthesis,
  getSelectedModel,
  setSelectedModel,
  DEFAULT_MODELS,
  getOllamaHost,
} from '../../lib/ollamaClient';
import { launchAiService, AI_SERVICES, AiServiceKey } from '../../lib/aiAppLauncher';

interface LocalLlmSynthesizerProps {
  googl: StockFundamentals;
  goog: StockFundamentals;
  spread: SpreadAnalysis;
  onOpenLlmModal: () => void;
}

type SynthesisTab = 'memo' | 'arbitrage' | 'valuation' | 'chat';

export const LocalLlmSynthesizer: React.FC<LocalLlmSynthesizerProps> = ({
  googl,
  goog,
  spread,
  onOpenLlmModal,
}) => {
  const [activeTab, setActiveTab] = useState<SynthesisTab>('memo');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [models, setModels] = useState<OllamaModelTag[]>([]);
  const [selectedModelName, setSelectedModelName] = useState<string>(getSelectedModel());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Cached generated content per tab
  const [memoText, setMemoText] = useState<string>('');
  const [arbitrageText, setArbitrageText] = useState<string>('');
  const [valuationText, setValuationText] = useState<string>('');

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<OllamaChatMessage[]>([
    {
      role: 'assistant',
      content: `반갑습니다! 알파벳(GOOGL/GOOG) 전문 로컬 AI 퀀트 애널리스트입니다.
현재 실시간 시세(GOOGL $${googl.currentPrice}, GOOG $${goog.currentPrice}) 및 펀더멘털 데이터를 탑재하고 있습니다.
클라우드 성장률, Waymo 상용화, 반독점 소송 구제책, 클래스 A/C 차익거래 등 무엇이든 질문해 주세요!`,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const stopStreamRef = useRef<(() => void) | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initial Health Check
  const refreshHealth = async () => {
    const health = await checkOllamaHealth();
    setIsOnline(health.online);
    if (health.online && health.models.length > 0) {
      setModels(health.models);
      // Auto-select preferred Gemma or first model if not yet set
      const current = getSelectedModel();
      const hasCurrent = health.models.some((m) => m.name === current);
      if (!hasCurrent) {
        const gemmaModel = health.models.find((m) => m.name.toLowerCase().includes('gemma'));
        const next = gemmaModel ? gemmaModel.name : health.models[0].name;
        setSelectedModelName(next);
        setSelectedModel(next);
      }
    }
  };

  useEffect(() => {
    refreshHealth();
    // Default generate offline memo preview on initial load if empty
    if (!memoText) {
      setMemoText(generateOfflineFallbackSynthesis('memo', googl, goog, spread));
    }
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isGenerating]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setSelectedModelName(next);
    setSelectedModel(next);
  };

  const handleStop = () => {
    if (stopStreamRef.current) {
      stopStreamRef.current();
      stopStreamRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleGenerate = async (tabToRun: SynthesisTab = activeTab) => {
    if (tabToRun === 'chat') return;

    handleStop();
    setIsGenerating(true);

    const { system, user } = buildPromptForType(tabToRun, googl, goog, spread);
    const messages: OllamaChatMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];

    // Clear target tab
    if (tabToRun === 'memo') setMemoText('');
    if (tabToRun === 'arbitrage') setArbitrageText('');
    if (tabToRun === 'valuation') setValuationText('');

    if (!isOnline) {
      // Offline fallback: Simulate smooth typing or instant algorithmic synthesis
      const fallback = generateOfflineFallbackSynthesis(tabToRun, googl, goog, spread);
      let index = 0;
      const interval = setInterval(() => {
        index += 25;
        const slice = fallback.slice(0, index);
        if (tabToRun === 'memo') setMemoText(slice);
        if (tabToRun === 'arbitrage') setArbitrageText(slice);
        if (tabToRun === 'valuation') setValuationText(slice);

        if (index >= fallback.length) {
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 16);
      return;
    }

    try {
      const stopFn = await streamOllamaChat(
        selectedModelName,
        messages,
        (accumulated) => {
          if (tabToRun === 'memo') setMemoText(accumulated);
          if (tabToRun === 'arbitrage') setArbitrageText(accumulated);
          if (tabToRun === 'valuation') setValuationText(accumulated);
        },
        () => {
          setIsGenerating(false);
          stopStreamRef.current = null;
        },
        (err) => {
          console.warn('Ollama streaming error, falling back:', err);
          const fallback = generateOfflineFallbackSynthesis(tabToRun, googl, goog, spread);
          if (tabToRun === 'memo') setMemoText(fallback);
          if (tabToRun === 'arbitrage') setArbitrageText(fallback);
          if (tabToRun === 'valuation') setValuationText(fallback);
          setIsGenerating(false);
        }
      );
      stopStreamRef.current = stopFn;
    } catch {
      setIsGenerating(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userMsg: OllamaChatMessage = { role: 'user', content: chatInput.trim() };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setChatInput('');
    setIsGenerating(true);

    const sysMsg: OllamaChatMessage = {
      role: 'system',
      content: `당신은 알파벳(Alphabet Inc.) 전문 온디바이스 AI 퀀트 애널리스트입니다.
현재 실시간 데이터: GOOGL=$${googl.currentPrice}, GOOG=$${goog.currentPrice}, 스프레드=${spread.percentSpread}%, Trailing P/E=${googl.trailingPE}x, Forward P/E=${googl.forwardPE}x, 52주 고저=$${googl.fiftyTwoWeekLow}~$${googl.fiftyTwoWeekHigh}, 월가 목표가 평균=$${googl.targetMeanPrice || 429}.
간결하고 전문적인 한국어 마크다운으로 답변하세요.`,
    };

    if (!isOnline) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `[로컬 Ollama 오프라인 모드 안내]\n\n현재 로컬 Ollama(포트 11434)가 대기 상태이므로 내장 퀀트 규칙으로 답변합니다:\n\n**질문**: "${userMsg.content}"\n\n알파벳은 Forward P/E 20.6x로 M7 중 가장 저평가되어 있으며, 연간 $22.7B+의 잉여현금흐름과 $70B 자사주 매입이 강력한 하방 지지선을 형성하고 있습니다. 터미널에서 \`OLLAMA_ORIGINS="*" ollama serve\`를 실행하시면 풀스택 Gemma 로컬 모델과 실시간 스트리밍으로 대화하실 수 있습니다!`,
          },
        ]);
        setIsGenerating(false);
      }, 500);
      return;
    }

    try {
      let assistantMsg = '';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const stopFn = await streamOllamaChat(
        selectedModelName,
        [sysMsg, ...nextMessages],
        (accumulated) => {
          assistantMsg = accumulated;
          setChatMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: accumulated };
            return copy;
          });
        },
        () => {
          setIsGenerating(false);
          stopStreamRef.current = null;
        },
        () => {
          setIsGenerating(false);
        }
      );
      stopStreamRef.current = stopFn;
    } catch {
      setIsGenerating(false);
    }
  };

  const getActiveText = () => {
    if (activeTab === 'memo') return memoText || generateOfflineFallbackSynthesis('memo', googl, goog, spread);
    if (activeTab === 'arbitrage') return arbitrageText || generateOfflineFallbackSynthesis('arbitrage', googl, goog, spread);
    if (activeTab === 'valuation') return valuationText || generateOfflineFallbackSynthesis('valuation', googl, goog, spread);
    return '';
  };

  const handleCopy = () => {
    const text = getActiveText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fintech-card p-5 space-y-4">
      {/* Top Header & Model Status Bar */}
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
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                  isOnline
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                  }`}
                />
                {isOnline ? 'Ollama 연결됨' : '스마트 폴백 모드'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              온디바이스 Gemma 기반 실시간 데이터 취합 및 차익거래 판별
            </p>
          </div>
        </div>

        {/* Model Selector & Health Refresh */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={selectedModelName}
            onChange={handleModelChange}
            className="text-xs font-mono py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {models.length > 0 ? (
              models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))
            ) : (
              DEFAULT_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            )}
          </select>

          <button
            onClick={refreshHealth}
            title="Ollama 상태 재확인"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenLlmModal}
            title="Ollama 상세 설정"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
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
            <span>AI 애널리스트 대화</span>
          </button>
        </div>

        {/* Action Controls */}
        {activeTab !== 'chat' && (
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>생성 중단</span>
              </button>
            ) : (
              <button
                onClick={() => handleGenerate(activeTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ 실시간 취합 실행</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title="결과 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab !== 'chat' ? (
        <div className="relative rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-4 sm:p-5 min-h-[340px] max-h-[500px] overflow-y-auto selectable-text">
          {isGenerating && (
            <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 py-1 px-2.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-semibold border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>로컬 모델 ({selectedModelName}) 실시간 스트리밍 추론 중...</span>
            </div>
          )}

          <div className="prose dark:prose-invert prose-xs sm:prose-sm max-w-none text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
            {getActiveText()}
          </div>
        </div>
      ) : (
        /* Interactive Chat Tab */
        <div className="space-y-3">
          <div
            ref={chatScrollRef}
            className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 p-4 h-[360px] overflow-y-auto space-y-3 selectable-text"
          >
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
              placeholder="알파벳 재무, 클라우드, Waymo, 스프레드에 대해 질문하세요..."
              className="flex-1 text-xs sm:text-sm py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {isGenerating ? (
              <button
                onClick={handleStop}
                className="px-4 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors font-bold text-xs"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>전송</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer Native AI App Launchers (aiAppLauncher protocol) */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>네이티브 AI 앱으로 원클릭 심층 분석 전송:</span>
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
