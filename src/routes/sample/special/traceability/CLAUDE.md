# 工場向けトレーサビリティ機能開発概要

## 概要

DaisyUI v5, SvelteKit v2(Svelte v5)を使用した工場向けトレーサビリティ機能のサンプル実装です。
このサンプルは工場向けシステム開発においてチートシート、またはそのまま利用できるレベルの高い品質のUI/UXおよび機能を作成します。

## プロジェクトについて

- 作成場所は @src/routes/sample/traceability 以下に全てのファイルを作成してください。例外的に他のディレクトリを使用する場合は必ず許可をとってください。
- かならずプロジェクト直下のCLAUDE.mdを確認しルールを守ってください
- かならずpackage.jsonを確認して利用しているライブラリとそのバージョンを意識してください
- npmではなくpnpmを使用してください

## 実装済み機能

### 完成したコンポーネント

1. **+page.svelte** - メインページ（バッチ一覧、フィルタリング、ビュー切り替え）
2. **HorizontalTimeline.svelte** - 横型タイムライン表示
3. **VerticalSteps.svelte** - 縦型ステップ表示（DaisyUIのStepsコンポーネント使用）
4. **GanttChart.svelte** - ガントチャート表示（ズーム・パン機能付き）
5. **AlertsPanel.svelte** - 異常検知アラートパネル
6. **DetailModal.svelte** - 詳細情報モーダル（履歴、コメント機能付き）
7. **mockData.js** - リアルなモックデータ構造

### 実装した主な機能

- リアルタイムステータス更新（5秒ごとの自動更新）
- アニメーション付き進捗表示
- ホバーで詳細情報表示
- ズーム/パン機能（ガントチャート）
- フィルター/検索機能
- コメント・メモ機能（UI実装済み）
- 異常検知アラート表示と管理

## Svelte v5での注意点

### $derived の正しい使い方

```javascript
// ❌ 間違い - 関数を渡してはいけない
const value = $derived(() => computeValue());

// ✅ 正解 - 式を直接渡す
const value = $derived(computeValue());

// 複雑なロジックの場合はIIFEを使用
const value = $derived(
	(() => {
		// 複雑な処理
		return result;
	})()
);
```

### TypeScriptの型定義

- 関数の引数には必ず型を付ける
- $props()には型定義を追加する
- Date演算では.getTime()を使用する

### アクセシビリティ

- クリック可能な要素は<button>を使用
- aria-labelを適切に設定
- インタラクティブな要素にはrole属性を設定

## 機能要件

- **プロセス可視化**
  - 横型タイムライン
  - 縦型ステップ表示
  - ガントチャート風表示
  - サンキーダイアグラム（フロー表示）
- **ステータス管理**
  - リアルタイムステータス更新
  - 異常検知アラート
  - 詳細履歴モーダル
  - コメント/メモ機能
- **UI要素**
  - アニメーション付き進捗表示
  - ホバーで詳細情報表示
  - ズーム/パン機能
  - フィルター/検索

## 使用するDaisyUIコンポーネント

- Steps（プロセス表示）
- Timeline（履歴表示）
- Progress（進捗バー）
- Alert（異常通知）
- Modal（詳細表示）
- Collapse（詳細情報の展開）
- Badge（ステータス）

## AIの振る舞い

- 今回の開発はクライアント側のみなのでデータは変数で用意するが、後にサーバーサイドやDB連携も行うため、実際のDB定義やAPIでのデータ取得を意識したリアルな状況を想定したデータ構造を心がけてください
- コメントは簡潔に書くが、複雑な処理においては細かく詳細に書いてください
- 500行程度でファイルを分割する様にしてください
- Svelte v5, Daisy v5のテクニックや間違いを修正することで学んだTipsは汎用的な知識の場合は@CLAUDE.mdへ記録、この機能の作りの詳細や注意点、本実装時に役立つ情報はこのファイルに追記してください。

## 品質とAIの役割

- 基本的にSvelteやDaisyUIに備わっている機能を活用し、それらが持つにも関わらず独自実装してしまわない様に注意してください。
- 機能概要はあくまで例であり、本要件においてより豊かな表現方法、先端的なUI/UX表現を追求してください。
