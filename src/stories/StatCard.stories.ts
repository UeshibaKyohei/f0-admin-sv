import type { Meta, StoryObj } from '@storybook/svelte';
import StatCard from '../lib/components/StatCard.svelte';

// コンポーネントのメタデータ
const meta = {
	title: 'Components/StatCard',
	component: StatCard,
	tags: ['autodocs'],
	argTypes: {
		title: { control: 'text' },
		value: { control: 'text' },
		change: { control: 'text' },
		trend: {
			control: { type: 'select' },
			options: ['up', 'down']
		},
		iconType: {
			control: { type: 'select' },
			options: ['users', 'chart-line', 'shopping-cart', 'arrow-turn-down', '']
		}
	},
	parameters: {
		docs: {
			description: {
				component:
					'統計情報を表示するためのカードコンポーネント。トレンドの上昇/下降を視覚的に表現します。'
			}
		}
	}
} satisfies Meta<StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本的な使用例
export const Default: Story = {
	args: {
		title: 'ユーザー数',
		value: '1,234',
		change: '+12%',
		trend: 'up',
		iconType: 'users'
	}
};

// 上昇トレンドの例
export const UpTrend: Story = {
	args: {
		title: '売上',
		value: '¥2.4M',
		change: '+8.2%',
		trend: 'up',
		iconType: 'chart-line'
	}
};

// 下降トレンドの例
export const DownTrend: Story = {
	args: {
		title: '直帰率',
		value: '42%',
		change: '-2.1%',
		trend: 'down',
		iconType: 'arrow-turn-down'
	}
};

// アイコンなしの例
export const NoIcon: Story = {
	args: {
		title: '平均注文額',
		value: '¥3,500',
		change: '+5.7%',
		trend: 'up',
		iconType: ''
	}
};

// カスタムサフィックスの例
export const ShoppingCart: Story = {
	args: {
		title: '注文数',
		value: '854',
		change: '+4.3%',
		trend: 'up',
		iconType: 'shopping-cart'
	}
};
