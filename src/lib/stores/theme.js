// src/lib/stores/theme.js
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// DaisyUI v5で利用可能な全テーマリスト
export const availableThemes = [
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'retro',
	'cyberpunk',
	'valentine',
	'halloween',
	'garden',
	'forest',
	'aqua',
	'lofi',
	'pastel',
	'fantasy',
	'wireframe',
	'black',
	'luxury',
	'dracula',
	'cmyk',
	'autumn',
	'business',
	'acid',
	'lemonade',
	'night',
	'coffee',
	'winter',
	'dim',
	'nord',
	'sunset',
	'caramellatte',
	'abyss',
	'silk'
];

// 各テーマの色パレット情報（Tailwind v4のCSS変数形式に対応）
export const themeColors = {
	light: {
		primary: 'oklch(0.570 0.210 287.5)',
		secondary: 'oklch(0.750 0.190 342.5)',
		accent: 'oklch(0.760 0.150 174.1)',
		neutral: 'oklch(0.279 0.030 240.0)'
	},
	dark: {
		primary: 'oklch(0.651 0.162 285.3)',
		secondary: 'oklch(0.692 0.205 342.6)',
		accent: 'oklch(0.705 0.136 191.8)',
		neutral: 'oklch(0.230 0.020 240.0)'
	},
	cupcake: {
		primary: 'oklch(0.779 0.070 183.9)',
		secondary: 'oklch(0.815 0.110 349.2)',
		accent: 'oklch(0.800 0.120 89.3)',
		neutral: 'oklch(0.190 0.080 285.7)'
	},
	bumblebee: {
		primary: 'oklch(0.799 0.131 84.7)',
		secondary: 'oklch(0.900 0.140 89.6)',
		accent: 'oklch(0.150 0.020 240.0)',
		neutral: 'oklch(0.150 0.020 240.0)'
	},
	emerald: {
		primary: 'oklch(0.750 0.100 162.1)',
		secondary: 'oklch(0.600 0.180 252.4)',
		accent: 'oklch(0.690 0.180 27.4)',
		neutral: 'oklch(0.279 0.046 225.6)'
	},
	corporate: {
		primary: 'oklch(0.570 0.190 253.6)',
		secondary: 'oklch(0.596 0.049 225.3)',
		accent: 'oklch(0.710 0.130 162.1)',
		neutral: 'oklch(0.140 0.040 237.0)'
	},
	synthwave: {
		primary: 'oklch(0.760 0.160 333.4)',
		secondary: 'oklch(0.740 0.150 212.8)',
		accent: 'oklch(0.840 0.150 83.4)',
		neutral: 'oklch(0.180 0.080 285.7)'
	},
	retro: {
		primary: 'oklch(0.760 0.100 27.4)',
		secondary: 'oklch(0.720 0.080 162.1)',
		accent: 'oklch(0.790 0.160 83.4)',
		neutral: 'oklch(0.220 0.040 19.1)'
	},
	cyberpunk: {
		primary: 'oklch(0.750 0.140 333.4)',
		secondary: 'oklch(0.780 0.120 212.8)',
		accent: 'oklch(0.760 0.130 285.7)',
		neutral: 'oklch(0.320 0.020 19.1)'
	},
	valentine: {
		primary: 'oklch(0.720 0.140 333.4)',
		secondary: 'oklch(0.710 0.130 285.7)',
		accent: 'oklch(0.750 0.080 183.9)',
		neutral: 'oklch(0.550 0.120 333.4)'
	},
	halloween: {
		primary: 'oklch(0.700 0.160 45.2)',
		secondary: 'oklch(0.550 0.140 285.7)',
		accent: 'oklch(0.650 0.180 123.4)',
		neutral: 'oklch(0.150 0.010 240.0)'
	},
	garden: {
		primary: 'oklch(0.580 0.080 162.1)',
		secondary: 'oklch(0.930 0.040 162.1)',
		accent: 'oklch(0.930 0.040 27.4)',
		neutral: 'oklch(0.580 0.080 162.1)'
	},
	forest: {
		primary: 'oklch(0.650 0.150 162.1)',
		secondary: 'oklch(0.680 0.160 162.1)',
		accent: 'oklch(0.650 0.130 183.9)',
		neutral: 'oklch(0.250 0.080 162.1)'
	},
	aqua: {
		primary: 'oklch(0.840 0.120 183.9)',
		secondary: 'oklch(0.640 0.100 285.7)',
		accent: 'oklch(0.900 0.100 89.3)',
		neutral: 'oklch(0.570 0.120 212.8)'
	},
	lofi: {
		primary: 'oklch(0.100 0.000 0)',
		secondary: 'oklch(0.140 0.000 0)',
		accent: 'oklch(0.200 0.000 0)',
		neutral: 'oklch(0.100 0.000 0)'
	},
	pastel: {
		primary: 'oklch(0.820 0.060 285.7)',
		secondary: 'oklch(0.850 0.080 333.4)',
		accent: 'oklch(0.860 0.100 162.1)',
		neutral: 'oklch(0.710 0.080 212.8)'
	},
	fantasy: {
		primary: 'oklch(0.450 0.140 285.7)',
		secondary: 'oklch(0.550 0.160 212.8)',
		accent: 'oklch(0.760 0.140 333.4)',
		neutral: 'oklch(0.220 0.040 240.0)'
	},
	wireframe: {
		primary: 'oklch(0.720 0.000 0)',
		secondary: 'oklch(0.720 0.000 0)',
		accent: 'oklch(0.720 0.000 0)',
		neutral: 'oklch(0.720 0.000 0)'
	},
	black: {
		primary: 'oklch(0.250 0.000 0)',
		secondary: 'oklch(0.250 0.000 0)',
		accent: 'oklch(0.250 0.000 0)',
		neutral: 'oklch(0.000 0.000 0)'
	},
	luxury: {
		primary: 'oklch(1.000 0.000 0)',
		secondary: 'oklch(0.320 0.040 240.0)',
		accent: 'oklch(0.400 0.060 333.4)',
		neutral: 'oklch(0.000 0.000 0)'
	},
	dracula: {
		primary: 'oklch(0.760 0.160 333.4)',
		secondary: 'oklch(0.730 0.140 285.7)',
		accent: 'oklch(0.800 0.140 89.3)',
		neutral: 'oklch(0.320 0.030 240.0)'
	}
	// 他のテーマも同様に定義...
};

// デフォルトテーマ
const DEFAULT_THEME = 'light';

// ローカルストレージから初期テーマを取得
function getInitialTheme() {
	if (!browser) return DEFAULT_THEME;

	try {
		const stored = localStorage.getItem('theme');
		if (stored && availableThemes.includes(stored)) {
			return stored;
		}

		// システムの設定を確認
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark';
		}
	} catch (e) {
		console.warn('Failed to access localStorage or system preferences:', e);
	}

	return DEFAULT_THEME;
}

// テーマストアを作成
export const theme = writable(getInitialTheme());

// システムテーマ変更の監視
if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', (e) => {
		// ユーザーが明示的にテーマを選択していない場合のみ自動変更
		const currentTheme = localStorage.getItem('theme');
		if (!currentTheme) {
			theme.set(e.matches ? 'dark' : 'light');
		}
	});
}

// ブラウザ環境でのみ動作する関数
if (browser) {
	// ストアの変更を監視してローカルストレージに保存
	theme.subscribe((value) => {
		try {
			localStorage.setItem('theme', value);

			// HTMLのdata-theme属性を即座に更新
			document.documentElement.setAttribute('data-theme', value);

			// メタテーマカラーを更新（モバイルブラウザのアドレスバー色）
			const primaryColor = themeColors[value]?.primary || themeColors.light.primary;
			let metaThemeColor = document.querySelector('meta[name="theme-color"]');
			if (!metaThemeColor) {
				metaThemeColor = document.createElement('meta');
				metaThemeColor.name = 'theme-color';
				document.head.appendChild(metaThemeColor);
			}
			metaThemeColor.content = primaryColor;

			// アニメーション効果を追加
			document.documentElement.classList.add('animate-theme-switch');
			setTimeout(() => {
				document.documentElement.classList.remove('animate-theme-switch');
			}, 300);
		} catch (e) {
			console.warn('Failed to save theme to localStorage:', e);
		}
	});

	// 初期テーマを適用（ちらつき防止）
	const initialTheme = getInitialTheme();
	document.documentElement.setAttribute('data-theme', initialTheme);
}

// テーマ変更関数
export function setTheme(newTheme) {
	if (availableThemes.includes(newTheme)) {
		theme.set(newTheme);
	} else {
		console.warn(`Invalid theme: ${newTheme}. Available themes:`, availableThemes);
	}
}

// テーマの日本語表示名
export function getThemeDisplayName(themeName) {
	const displayNames = {
		light: 'ライト',
		dark: 'ダーク',
		cupcake: 'カップケーキ',
		bumblebee: 'バンブルビー',
		emerald: 'エメラルド',
		corporate: 'コーポレート',
		synthwave: 'シンセウェーブ',
		retro: 'レトロ',
		cyberpunk: 'サイバーパンク',
		valentine: 'バレンタイン',
		halloween: 'ハロウィン',
		garden: 'ガーデン',
		forest: 'フォレスト',
		aqua: 'アクア',
		lofi: 'ローファイ',
		pastel: 'パステル',
		fantasy: 'ファンタジー',
		wireframe: 'ワイヤーフレーム',
		black: 'ブラック',
		luxury: 'ラグジュアリー',
		dracula: 'ドラキュラ',
		cmyk: 'CMYK',
		autumn: 'オータム',
		business: 'ビジネス',
		acid: 'アシッド',
		lemonade: 'レモネード',
		night: 'ナイト',
		coffee: 'コーヒー',
		winter: 'ウィンター',
		dim: 'ディム',
		nord: 'ノルド',
		sunset: 'サンセット',
		caramellatte: 'キャラメルラテ',
		abyss: 'アビス',
		silk: 'シルク'
	};
	return displayNames[themeName] || themeName;
}

// 現在のテーマ情報を取得する関数
export function getCurrentThemeInfo() {
	let currentTheme;
	theme.subscribe((value) => (currentTheme = value))();

	return {
		name: currentTheme,
		displayName: getThemeDisplayName(currentTheme),
		colors: themeColors[currentTheme] || themeColors.light,
		isDark: [
			'dark',
			'synthwave',
			'halloween',
			'forest',
			'black',
			'luxury',
			'dracula',
			'night',
			'coffee',
			'dim',
			'abyss'
		].includes(currentTheme)
	};
}
