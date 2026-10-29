import { BusinessPillar } from '../types/stock';

export const ALPHABET_PILLARS: BusinessPillar[] = [
  {
    id: 'search-services',
    title: 'Google Services & Search',
    subtitle: '검색 엔진 및 플랫폼 생태계의 절대 강자',
    category: 'Core Cash Cow',
    color: 'from-blue-500/20 to-blue-600/5',
    dotColor: 'bg-[#4285F4]',
    badge: '매출 비중 72%',
    highlights: [
      { label: '글로벌 검색 점유율', value: '90.8%' },
      { label: 'AI Overview 커버리지', value: '100개국+' },
      { label: '분기 서비스 영업이익률', value: '38.2%' },
    ],
    summary:
      '글로벌 검색 시장의 독점적 해자를 바탕으로 쿼리당 광고 단가와 AI 요약(AI Overviews) 광고 전환율이 상승 곡선을 그리고 있습니다. 모바일 Android 및 Chrome 브라우저 생태계와 결합된 가장 견고한 캐시카우입니다.',
    catalysts: [
      'AI Overviews 도입 후 고단가 커머스 및 여행/금융 쿼리 체류 시간 증가',
      'Circle to Search 및 멀티모달 비주얼 검색을 통한 신규 검색 쿼리 창출',
      'Android 15+ 생성형 AI 기본 탑재를 통한 사용자 락인(Lock-in) 강화',
    ],
    risks: [
      '미 법무부(DOJ) 검색 독점 소송 판결에 따른 기본 검색 설정 계약(Apple 수수료 등) 재협상 리스크',
      'OpenAI Search 및 Perplexity 등 AI 대화형 검색 엔진과의 사용자 점유율 경쟁',
    ],
  },
  {
    id: 'google-cloud',
    title: 'Google Cloud Platform (GCP)',
    subtitle: 'AI 하이퍼컴퓨터와 엔터프라이즈 클라우드의 폭발적 도약',
    category: 'High Growth Engine',
    color: 'from-emerald-500/20 to-emerald-600/5',
    dotColor: 'bg-[#34A853]',
    badge: '연간 런레이트 $122.8B (Q3 $30.7B)',
    highlights: [
      { label: 'Q3 분기 매출 성장률', value: '+103.0%', change: 'YoY ($30.7B)' },
      { label: '클라우드 영업이익률', value: '36.2%', change: '$11.1B 달성' },
      { label: 'Vertex AI 엔터프라이즈 도입', value: 'Fortune 500의 75%+' },
    ],
    summary:
      '2026 Q3 분기 매출 $30.7B(+103% YoY) 및 영업이익 $11.1B(마진 36.2%)를 달성하며 전사 최대 성장 엔진으로 자리잡았습니다. 독자 설계한 TPU Trillium과 Vertex AI 플랫폼을 기반으로 글로벌 엔터프라이즈의 생성형 AI 워크로드를 흡수하고 있습니다.',
    catalysts: [
      '엔터프라이즈 생성형 AI 파이프라인 수주 급증 및 대규모 장기 계약 체결',
      'TPU 기반의 압도적인 비용 효율성으로 AWS 및 Azure 대비 가격 경쟁력 확보',
      'Google Workspace의 Gemini 비즈니스 애드온 구독자 수 급증',
    ],
    risks: [
      '마이크로소프트 Azure(OpenAI 생태계) 및 AWS와의 가격 인하 경쟁',
      '데이터센터 전력 공급 및 냉각 인프라 CapEx 지출 증가',
    ],
  },
  {
    id: 'youtube-subscriptions',
    title: 'YouTube & Subscriptions',
    subtitle: '글로벌 1위 동영상 플랫폼과 구독 경제',
    category: 'Recurring Revenue',
    color: 'from-red-500/20 to-red-600/5',
    dotColor: 'bg-[#EA4335]',
    badge: '구독자 1.5억 명 돌파',
    highlights: [
      { label: 'Music & Premium 구독자', value: '150M+' },
      { label: 'Q3 분기 광고 매출', value: '$11.2B (+9% YoY)' },
      { label: '거실(Living Room) TV 시청 1위', value: 'Nielsen 인증' },
    ],
    summary:
      '전통적인 광고 수익뿐만 아니라 YouTube Premium, YouTube Music, YouTube TV, NFL Sunday Ticket을 아우르는 고마진 반복 구독(Subscription) 비즈니스가 가파르게 성장하고 있습니다.',
    catalysts: [
      '광고 차단기 차단 정책 강화에 따른 유료 YouTube Premium 전환율 급상승',
      'TV 스트리밍 시장에서 넷플릭스를 제치고 미국 내 점유율 1위 지속',
      'Shorts 전용 수익 배분 모델 안착으로 틱톡 대비 크리에이터 이탈 방지',
    ],
    risks: [
      '거시경제 둔화 시 브랜드 광고주들의 디지털 광고 예산 축소',
      '음악/스포츠 독점 중계권 라이선스 비용 인상 압박',
    ],
  },
  {
    id: 'waymo-other-bets',
    title: 'Waymo & Other Bets',
    subtitle: '자율주행 상용화의 유일한 상업적 리더',
    category: 'Moonshot Breakthrough',
    color: 'from-amber-500/20 to-amber-600/5',
    dotColor: 'bg-[#FBBC05]',
    badge: '주당 10만 건 유료 탑승',
    highlights: [
      { label: '주당 유료 무인 운행', value: '150,000건+' },
      { label: '무인 상용화 운행 도시', value: 'SF, 피닉스, LA, 오스틴' },
      { label: '인간 운전자 대비 사고율', value: '-85% 안전' },
    ],
    summary:
      'Waymo는 현재 미국 주요 대도시에서 안전 운전자(Safety Driver) 없는 100% 무인 로보택시를 상용 운영하는 전 세계 유일의 기업입니다. 테슬라의 Cybercab 대비 수년 앞선 상용 데이터와 규제 승인을 보유하고 있습니다.',
    catalysts: [
      'Uber와의 전략적 제휴를 통한 전국 단위 로보택시 디스패치 네트워크 확장',
      '현대차 아이오닉 5 기반 차세대 6세대 Waymo Driver 탑재 차량 양산',
      '향후 단독 IPO 또는 대규모 기업가치 평가($50B+)를 통한 히든 밸류 실현',
    ],
    risks: [
      '초기 센서 및 라이다(LiDAR) 원가 회수 기간 필요',
      '악천후 조건에서의 규제 승인 지연 가능성',
    ],
  },
  {
    id: 'ai-silicon-research',
    title: 'AI Research & Custom Silicon',
    subtitle: 'Google DeepMind와 TPU Trillium의 풀스택 혁신',
    category: 'Full-Stack Moat',
    color: 'from-indigo-500/20 to-indigo-600/5',
    dotColor: 'bg-indigo-500',
    badge: '자체 칩 6세대 양산',
    highlights: [
      { label: '최신 파운데이션 모델', value: 'Gemini 2.0 / Flash' },
      { label: '자체 AI 가속기', value: 'TPU v6 Trillium' },
      { label: '컨텍스트 윈도우', value: '200만 토큰 (최대)' },
    ],
    summary:
      '하드웨어(TPU), 모델(Gemini, Gemma), 리서치(DeepMind), 애플리케이션(Search, Android)을 수직 계열화한 전 세계 유일한 풀스택 AI 기업입니다. 엔비디아 칩 공급난에서도 자립적인 훈련과 서빙이 가능합니다.',
    catalysts: [
      'TPU v6 Trillium의 전력 대비 훈련 성능 4.7배 향상으로 AI 서빙 마진 극대화',
      'DeepMind의 AlphaFold 3 등 노벨상급 과학/신약 바이오 AI 상용화',
      'Project Astra(실시간 음성/영상 상호작용 AI 비서)의 Android 전면 통합',
    ],
    risks: [
      '오픈소스 모델(Llama 3 등)의 급속한 추격으로 인한 API 가격 경쟁',
      'AI 모델 학습을 위한 데이터 저작권 소송 리스크',
    ],
  },
  {
    id: 'capital-allocation',
    title: 'Capital Allocation & Cash Fortress',
    subtitle: '$240B+ 현금 요새와 주주환원 가속화',
    category: 'Shareholder Yield',
    color: 'from-teal-500/20 to-teal-600/5',
    dotColor: 'bg-teal-500',
    badge: '$70B 바이백 + 배당',
    highlights: [
      { label: '보유 현금 및 유가증권', value: '$242.5B' },
      { label: '연간 자사주 매입 규모', value: '$70B' },
      { label: '주당 분기 배당금', value: '$0.20 ($0.80/년)' },
    ],
    summary:
      '역사상 가장 풍부한 순현금($120B+)을 보유한 재무적 철옹성입니다. 지속적인 자사주 매각 소각을 통해 유통 주식 수를 꾸준히 줄이고 있으며, 사상 최초의 분기 배당 도입으로 연기금 및 배당 ETF 자금이 유입되고 있습니다.',
    catalysts: [
      '자사주 소각으로 인한 주당순이익(EPS) 가속 성장 효과',
      '배당금 지속 인상 시 글로벌 배당 성장주 지수 편입 확대',
      '거시경제 침체 시 M&A 및 전략적 투자 기회를 선점할 수 있는 막강한 현금력',
    ],
    risks: [
      '인공지능 데이터센터 구축을 위한 설비투자(CapEx) 일시적 급증',
    ],
  },
];
