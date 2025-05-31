/**
 * Demo Data Generator for Customer Support Chat System
 * 
 * このモジュールは開発・デモ環境用のテストデータ生成機能を提供します。
 * 本番環境では使用しないでください。
 */

import { addInquiry } from '../supportStore.js';

// デモ用の顧客データ（オペレーター名と重複しないよう「様」付き）
const demoCustomers = [
  { name: '田中太郎様', tier: 'ゴールド', previousComplaints: 0 },
  { name: '鈴木花子様', tier: 'シルバー', previousComplaints: 1 },
  { name: '山田一郎様', tier: 'ブロンズ', previousComplaints: 3 },
  { name: '佐藤美咲様', tier: 'ゴールド', previousComplaints: 0 },
  { name: '高橋健太様', tier: 'シルバー', previousComplaints: 2 },
  { name: '伊藤愛様', tier: 'ブロンズ', previousComplaints: 0 },
  { name: '渡辺浩様', tier: 'ゴールド', isVIP: true, previousComplaints: 0 },
  { name: '中村優子様', tier: 'シルバー', previousComplaints: 1 },
  { name: '小林誠様', tier: 'ブロンズ', previousComplaints: 4 },
  { name: '加藤智子様', tier: 'シルバー', previousComplaints: 0 }
];

// デモ用のメッセージテンプレート
const demoMessages = [
  { text: '商品が届きません。いつ届きますか？', category: 'shipping' },
  { text: '購入した商品を返品したいです', category: 'return' },
  { text: '商品の使い方がわかりません', category: 'product' },
  { text: 'アプリにログインできません', category: 'technical' },
  { text: '請求金額が間違っているようです', category: 'billing' },
  { text: '配送先を変更したいです', category: 'shipping' },
  { text: '商品に不具合があります', category: 'return' },
  { text: 'パスワードをリセットしたい', category: 'technical' },
  { text: '注文をキャンセルしたい', category: 'other' },
  { text: 'ポイントが反映されていません', category: 'billing' }
];

/**
 * ランダムな問い合わせを生成
 * @returns {Promise<void>}
 */
export async function generateRandomInquiry() {
  const randomCustomer = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
  const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
  
  const customerData = {
    id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: randomCustomer.name,
    email: `${randomCustomer.name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: '090-' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0'),
    tier: randomCustomer.tier,
    isVIP: randomCustomer.isVIP || false,
    previousComplaints: randomCustomer.previousComplaints,
    registeredDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  try {
    await addInquiry(customerData, randomMessage.text, randomMessage.category);
  } catch (error) {
    console.error('Failed to generate demo inquiry:', error);
  }
}

/**
 * 初期デモデータを生成
 * @param {number} count - 生成する問い合わせ数
 * @returns {Promise<void>}
 */
export async function generateInitialDemoData(count = 5) {
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => setTimeout(resolve, i * 500));
    await generateRandomInquiry();
  }
}

// 生成中のインターバルIDを保持
let generationInterval = null;

/**
 * 問い合わせが自動生成中かどうか
 * @returns {boolean}
 */
export function isGeneratingInquiries() {
  return generationInterval !== null;
}

/**
 * 定期的にランダムな問い合わせを生成
 * @param {number} intervalMs - 生成間隔（ミリ秒）
 * @param {number} probability - 生成確率（0-1）
 * @returns {Function} クリーンアップ関数
 */
export function startRandomInquiryGeneration(intervalMs = 10000, probability = 0.3) {
  // 既に生成中の場合は停止
  if (generationInterval) {
    clearInterval(generationInterval);
  }
  
  generationInterval = setInterval(() => {
    if (Math.random() < probability) {
      generateRandomInquiry();
    }
  }, intervalMs);
  
  // クリーンアップ関数を返す
  return () => {
    if (generationInterval) {
      clearInterval(generationInterval);
      generationInterval = null;
    }
  };
}

/**
 * 問い合わせの自動生成を停止
 */
export function stopRandomInquiryGeneration() {
  if (generationInterval) {
    clearInterval(generationInterval);
    generationInterval = null;
  }
}

import { USE_CHAT_MOCK } from '../config.js';

/**
 * デモ環境かどうかを判定
 * @returns {boolean}
 */
export function isDemoMode() {
  return USE_CHAT_MOCK;
}