import { lazy, type ReactElement } from 'react';

import type * as CardViewModule from './card-view/card-view';
import type { CardViewProps } from './card-view/types';
import type { DataViewItem } from './data-view-item';
import type * as KanbanViewModule from './kanban-view/kanban-view';
import type { KanbanViewProps } from './kanban-view/types';
import type * as ListViewModule from './list-view/list-view';
import type { ListViewProps } from './list-view/types';
import type { DataViewMode } from './types';

let listViewImportPromise: Promise<typeof ListViewModule> | undefined;
let kanbanViewImportPromise: Promise<typeof KanbanViewModule> | undefined;
let cardViewImportPromise: Promise<typeof CardViewModule> | undefined;

function loadListView() {
  if (!listViewImportPromise) {
    listViewImportPromise = import('./list-view/list-view');
  }

  return listViewImportPromise;
}

function loadKanbanView() {
  if (!kanbanViewImportPromise) {
    kanbanViewImportPromise = import('./kanban-view/kanban-view');
  }

  return kanbanViewImportPromise;
}

function loadCardView() {
  if (!cardViewImportPromise) {
    cardViewImportPromise = import('./card-view/card-view');
  }

  return cardViewImportPromise;
}

export function preloadListView() {
  void loadListView();
}

export function preloadKanbanView() {
  void loadKanbanView();
}

export function preloadCardView() {
  void loadCardView();
}

export function preloadViewMode(mode: DataViewMode) {
  if (mode === 'list') {
    preloadListView();
    return;
  }

  if (mode === 'kanban') {
    preloadKanbanView();
    return;
  }

  if (mode === 'card') {
    preloadCardView();
  }
}

type LazyListViewComponent = <TData extends DataViewItem>(
  props: ListViewProps<TData>
) => ReactElement | null;

type LazyKanbanViewComponent = <TData extends DataViewItem>(
  props: KanbanViewProps<TData>
) => ReactElement | null;

type LazyCardViewComponent = <TData extends DataViewItem>(
  props: CardViewProps<TData>
) => ReactElement | null;

export const LazyListView = lazy(async () => {
  const module = await loadListView();

  return { default: module.ListView };
}) as unknown as LazyListViewComponent;

export const LazyKanbanView = lazy(async () => {
  const module = await loadKanbanView();

  return { default: module.KanbanView };
}) as unknown as LazyKanbanViewComponent;

export const LazyCardView = lazy(async () => {
  const module = await loadCardView();

  return { default: module.CardView };
}) as unknown as LazyCardViewComponent;
