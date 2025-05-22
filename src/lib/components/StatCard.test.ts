import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StatCard from './StatCard.svelte';

describe('StatCard', () => {
  it('正しいタイトルと値を表示する', () => {
    const title = 'ユーザー数';
    const value = '1,234';
    
    render(StatCard, { title, value, change: '+12%', trend: 'up' });
    
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(value)).toBeTruthy();
  });

  it('上昇トレンドの場合は成功色を使用する', () => {
    render(StatCard, { 
      title: '売上', 
      value: '¥2.4M', 
      change: '+8.2%', 
      trend: 'up' 
    });
    
    const changeElement = screen.getByText('+8.2%').closest('span');
    expect(changeElement?.classList.contains('text-success')).toBe(true);
  });

  it('下降トレンドの場合はエラー色を使用する', () => {
    render(StatCard, { 
      title: '直帰率', 
      value: '42%', 
      change: '-2.1%', 
      trend: 'down' 
    });
    
    const changeElement = screen.getByText('-2.1%').closest('span');
    expect(changeElement?.classList.contains('text-error')).toBe(true);
  });

  it('アイコンが指定されていない場合はアイコン要素を表示しない', () => {
    render(StatCard, { 
      title: '平均注文額', 
      value: '¥3,500', 
      change: '+5.7%', 
      trend: 'up', 
      iconType: '' 
    });
    
    const cardBody = document.querySelector('.card-body');
    const iconContainer = cardBody?.querySelector('.rounded-full');
    expect(iconContainer).toBeNull();
  });

  it('アイコンが指定されている場合はアイコンコンテナを表示する', () => {
    const { container } = render(StatCard, { 
      title: '新規顧客', 
      value: '256', 
      change: '+18%', 
      trend: 'up', 
      iconType: 'users' 
    });
    
    const iconContainer = container.querySelector('.rounded-full');
    expect(iconContainer).not.toBeNull();
    expect(iconContainer?.classList.contains('bg-primary/10')).toBe(true);
    expect(iconContainer?.classList.contains('text-primary')).toBe(true);
  });

  it('先月比テキストが表示される', () => {
    const { container } = render(StatCard, { 
      title: '新規顧客', 
      value: '256', 
      change: '+18%', 
      trend: 'up', 
      iconType: 'users' 
    });
    
    const suffixText = container.querySelector('.text-base-content\/60');
    expect(suffixText).not.toBeNull();
    expect(suffixText?.textContent).toBe('先月比');
  });
});
