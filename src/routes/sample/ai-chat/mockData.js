/**
 * モックデータ生成モジュール
 * 開発・デモ時に使用するモックデータを生成
 */

// モックレスポンス生成
export function generateMockResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // 株価関連の質問
  if (lowerMessage.includes('株価') || lowerMessage.includes('stock')) {
    return `承知いたしました。どのような情報をお求めでしょうか？

株価データの取得には、より詳細な条件の指定が必要です。以下の選択肢から、ご希望の情報範囲をお選びください。`;
  }
  
  // データ分析関連
  if (lowerMessage.includes('分析') || lowerMessage.includes('データ')) {
    return `データ分析のご依頼ですね。分析の詳細度について確認させてください。

どのレベルの分析をご希望でしょうか？以下からお選びください。`;
  }
  
  // タスク管理関連
  if (lowerMessage.includes('タスク') || lowerMessage.includes('予定')) {
    return `タスク情報の確認ですね。表示方法について確認させてください。

どのような形式でタスクを表示しましょうか？`;
  }
  
  // デフォルトレスポンス
  return `ご質問を承りました。より詳しい情報を提供するため、以下の点について確認させてください。

どのような情報をお求めでしょうか？`;
}

// モック選択肢生成
export function generateMockSuggestions(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  // 株価関連の質問
  if (lowerMessage.includes('株価') || lowerMessage.includes('stock')) {
    // 企業名を抽出（簡易的な実装）
    let company = 'Apple';
    if (lowerMessage.includes('apple')) company = 'Apple';
    else if (lowerMessage.includes('google')) company = 'Google';
    else if (lowerMessage.includes('microsoft')) company = 'Microsoft';
    
    const today = new Date().toLocaleDateString('ja-JP');
    
    return [
      {
        id: '1',
        text: '基本的な株価情報',
        prompt: `${today}の${company}の株価及び、前1週間のデータを出力してください。終値、始値、高値、安値、出来高を含めてください。`
      },
      {
        id: '2',
        text: '総合的な市場分析',
        prompt: `本日の${company}の株価と一緒に、昨日から現在時刻までの主要ニュース、明日以降の株価予想、アナリストの評価も調べてください。`
      },
      {
        id: '3',
        text: 'シンプルな現在値',
        prompt: `${company}の現在の株価だけをシンプルに教えてください。前日比の変動率も含めてください。`
      }
    ];
  }
  
  // データ分析関連
  if (lowerMessage.includes('分析') || lowerMessage.includes('データ') || lowerMessage.includes('レポート')) {
    return [
      {
        id: '1',
        text: '詳細なトレンド分析',
        prompt: '過去3ヶ月間の全データを使用して、週次・月次のトレンド分析、異常値の検出、予測モデルの構築まで行ってください。グラフも作成してください。'
      },
      {
        id: '2',
        text: '要点のみの簡潔な分析',
        prompt: '主要な3つの指標に絞って、前月比の変化と簡単な要因分析のみを箇条書きで提示してください。詳細は不要です。'
      },
      {
        id: '3',
        text: 'リアルタイムダッシュボード',
        prompt: '現在のリアルタイムデータを基に、経営陣向けのエグゼクティブサマリーを作成してください。ビジュアル重視でお願いします。'
      }
    ];
  }
  
  // タスク管理関連
  if (lowerMessage.includes('タスク') || lowerMessage.includes('予定') || lowerMessage.includes('スケジュール')) {
    return [
      {
        id: '1',
        text: '今日の重要タスクのみ',
        prompt: '本日中に完了すべき優先度「高」のタスクを、締切時刻順に表示してください。各タスクの推定所要時間も含めてください。'
      },
      {
        id: '2',
        text: '週間スケジュール全体',
        prompt: '今週のタスクを曜日別にガントチャート形式で表示し、リソースの配分状況と負荷の偏りを可視化してください。'
      },
      {
        id: '3',
        text: '遅延タスクの対処法',
        prompt: '期限を過ぎているタスクと、今日中に間に合わない可能性があるタスクを抽出し、優先順位の再調整案を提示してください。'
      }
    ];
  }
  
  // デフォルトの選択肢
  return [
    {
      id: '1',
      text: '詳細な説明を追加',
      prompt: 'この回答について、より具体的な例を3つ以上挙げて、実践的な適用方法を含めて詳しく説明してください。'
    },
    {
      id: '2',
      text: '簡潔な要約のみ',
      prompt: '今の説明を3つのポイントに要約して、それぞれ1文で簡潔に説明してください。'
    },
    {
      id: '3',
      text: '次のステップを提案',
      prompt: 'この情報を基に、具体的に私が次に取るべきアクションを優先順位付きで5つ提案してください。'
    }
  ];
}

// プロンプトテンプレートのモックデータ
export const mockPromptTemplates = [
  {
    id: '1',
    title: 'コード生成',
    prompt: '以下の要件に基づいてコードを生成してください：\n\n',
    category: 'development'
  },
  {
    id: '2',
    title: 'データ分析',
    prompt: '以下のデータを分析し、洞察を提供してください：\n\n',
    category: 'analysis'
  },
  {
    id: '3',
    title: 'レポート作成',
    prompt: '以下の情報を基にレポートを作成してください：\n\n',
    category: 'documentation'
  }
];

// 初期テンプレートボタンのデータ
export const mockQuickActions = [
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
    text: '今日のタスク',
    prompt: '今日のタスクを教えて'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>`,
    text: '売上レポート',
    prompt: '売上レポートを作成して'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>`,
    text: '顧客分析',
    prompt: '顧客データを分析して'
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>`,
    text: '在庫確認',
    prompt: '在庫状況を確認して'
  }
];