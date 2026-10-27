import React, { useState } from 'react';
import { X, Cpu, Check, RefreshCw, Terminal, ExternalLink, HelpCircle } from 'lucide-react';
import { getOllamaHost, setOllamaHost, checkOllamaHealth } from '../../lib/ollamaClient';

interface LlmSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const LlmSettingsModal: React.FC<LlmSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  if (!isOpen) return null;

  const [hostInput, setHostInput] = useState<string>(getOllamaHost());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    online: boolean;
    modelCount: number;
    error?: string;
  }>({ tested: false, online: false, modelCount: 0 });

  const handleTestConnection = async () => {
    setTesting(true);
    setOllamaHost(hostInput);
    const res = await checkOllamaHealth();
    setTesting(false);
    setTestResult({
      tested: true,
      online: res.online,
      modelCount: res.models.length,
    });
  };

  const handleSave = () => {
    setOllamaHost(hostInput);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              로컬 LLM (Ollama) 연결 설정
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 dark:text-zinc-200">
            Ollama 호스트 주소 (API Endpoint)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hostInput}
              onChange={(e) => setHostInput(e.target.value)}
              placeholder="http://127.0.0.1:11434 또는 /ollama-api"
              className="flex-1 font-mono text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5"
            >
              {testing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>연결 테스트</span>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            로컬 기본값: <code className="font-mono">http://127.0.0.1:11434</code> (개발 모드 프록시: <code className="font-mono">/ollama-api</code>)
          </p>
        </div>

        {/* Test Result Indicator */}
        {testResult.tested && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult.online
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            {testResult.online ? (
              <>
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Ollama 연결 성공! (로컬 설치 모델: {testResult.modelCount}개 감지됨)
                </span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  연결 실패: Ollama가 실행 중인지, CORS 설정이 허용되었는지 확인하세요.
                </span>
              </>
            )}
          </div>
        )}

        {/* Setup Guide / Terminal commands */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-zinc-200">
            <Terminal className="w-4 h-4 text-blue-500" />
            <span>브라우저 CORS 허용 실행 방법:</span>
          </div>
          <p className="text-slate-600 dark:text-zinc-400 text-[11.5px] leading-relaxed">
            웹 브라우저에서 로컬 Ollama에 직접 통신하려면 다음과 같이 실행합니다:
          </p>
          <div className="p-2 rounded-lg bg-slate-900 dark:bg-black text-slate-100 dark:text-zinc-200 border border-slate-800 dark:border-zinc-800 font-mono text-[11px] select-all">
            OLLAMA_ORIGINS="*" ollama serve
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
            권장 모델: <code className="font-bold text-blue-500">gemma4:26b-a4b</code> 또는 <code className="font-bold text-emerald-500">gemma4-coding:latest</code>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};
