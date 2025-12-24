/**
 * ディープリンク（URL状態管理）用カスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import type { MapTheme, ShareableState } from '../types';

const VALID_THEMES: MapTheme[] = ['light', 'dark', 'satellite'];
const VALID_VIEWS = ['wide', 'focus'] as const;

/**
 * URLパラメータから状態を復元し、状態変更をURLに反映するフック
 */
export function useShareableState() {
  const [initialState, setInitialState] = useState<ShareableState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // URLからステート復元（初回のみ）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restored: ShareableState = {};

    // demo
    if (params.get('demo') === 'true') {
      restored.demo = true;
    }

    // year (例: "2024" または "2020-2024")
    const yearParam = params.get('year');
    if (yearParam) {
      // 妥当な年の範囲（Google Mapsタイムラインは2012年頃から）
      const MIN_YEAR = 2000;
      const MAX_YEAR = new Date().getFullYear() + 1;
      
      if (yearParam.includes('-')) {
        const [start, end] = yearParam.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end 
            && start >= MIN_YEAR && end <= MAX_YEAR) {
          restored.yearStart = start;
          restored.yearEnd = end;
        }
      } else {
        const year = Number(yearParam);
        if (!isNaN(year) && year >= MIN_YEAR && year <= MAX_YEAR) {
          restored.yearStart = year;
          restored.yearEnd = year;
        }
      }
    }

    // theme
    const themeParam = params.get('theme') as MapTheme;
    if (themeParam && VALID_THEMES.includes(themeParam)) {
      restored.theme = themeParam;
    }

    // view
    const viewParam = params.get('view') as 'wide' | 'focus';
    if (viewParam && VALID_VIEWS.includes(viewParam)) {
      restored.view = viewParam;
    }

    // speed
    const speedParam = params.get('speed');
    if (speedParam) {
      const speed = Number(speedParam);
      if (!isNaN(speed) && speed >= 1 && speed <= 50) {
        restored.speed = speed;
      }
    }

    setInitialState(restored);
    setIsInitialized(true);
  }, []);

  // ステートをURLに反映（履歴を変更しない）
  const updateUrl = useCallback((state: Partial<ShareableState>) => {
    const url = new URL(window.location.href);
    
    // 既存パラメータをクリア
    url.searchParams.delete('year');
    url.searchParams.delete('theme');
    url.searchParams.delete('view');
    url.searchParams.delete('speed');
    // demoはクリアしない

    // 新しいパラメータを設定
    if (state.yearStart !== undefined && state.yearEnd !== undefined) {
      if (state.yearStart === state.yearEnd) {
        url.searchParams.set('year', String(state.yearStart));
      } else {
        url.searchParams.set('year', `${state.yearStart}-${state.yearEnd}`);
      }
    }

    if (state.theme && state.theme !== 'light') {
      url.searchParams.set('theme', state.theme);
    }

    if (state.view && state.view !== 'wide') {
      url.searchParams.set('view', state.view);
    }

    if (state.speed && state.speed !== 5) {
      url.searchParams.set('speed', String(state.speed));
    }

    // URLを更新（履歴を追加しない）
    window.history.replaceState({}, '', url.toString());
  }, []);

  // シェア用URLを生成
  const generateShareUrl = useCallback((state: Partial<ShareableState>): string => {
    const url = new URL(window.location.origin + window.location.pathname);

    if (state.yearStart !== undefined && state.yearEnd !== undefined) {
      if (state.yearStart === state.yearEnd) {
        url.searchParams.set('year', String(state.yearStart));
      } else {
        url.searchParams.set('year', `${state.yearStart}-${state.yearEnd}`);
      }
    }

    if (state.theme && state.theme !== 'light') {
      url.searchParams.set('theme', state.theme);
    }

    if (state.view && state.view !== 'wide') {
      url.searchParams.set('view', state.view);
    }

    if (state.speed && state.speed !== 5) {
      url.searchParams.set('speed', String(state.speed));
    }

    if (state.demo) {
      url.searchParams.set('demo', 'true');
    }

    return url.toString();
  }, []);

  // クリーンなベースURLを取得
  const getBaseUrl = useCallback((): string => {
    return window.location.origin + window.location.pathname;
  }, []);

  return {
    initialState,
    isInitialized,
    updateUrl,
    generateShareUrl,
    getBaseUrl,
  };
}

/**
 * URLパラメータをパースするヘルパー関数
 */
export function parseUrlParams(): ShareableState {
  const params = new URLSearchParams(window.location.search);
  const state: ShareableState = {};

  if (params.get('demo') === 'true') {
    state.demo = true;
  }

  const yearParam = params.get('year');
  if (yearParam) {
    // 妥当な年の範囲
    const MIN_YEAR = 2000;
    const MAX_YEAR = new Date().getFullYear() + 1;
    
    if (yearParam.includes('-')) {
      const [start, end] = yearParam.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start >= MIN_YEAR && end <= MAX_YEAR) {
        state.yearStart = start;
        state.yearEnd = end;
      }
    } else {
      const year = Number(yearParam);
      if (!isNaN(year) && year >= MIN_YEAR && year <= MAX_YEAR) {
        state.yearStart = year;
        state.yearEnd = year;
      }
    }
  }

  const themeParam = params.get('theme') as MapTheme;
  if (themeParam && VALID_THEMES.includes(themeParam)) {
    state.theme = themeParam;
  }

  const viewParam = params.get('view') as 'wide' | 'focus';
  if (viewParam && VALID_VIEWS.includes(viewParam)) {
    state.view = viewParam;
  }

  const speedParam = params.get('speed');
  if (speedParam) {
    const speed = Number(speedParam);
    if (!isNaN(speed) && speed >= 1 && speed <= 50) {
      state.speed = speed;
    }
  }

  return state;
}
