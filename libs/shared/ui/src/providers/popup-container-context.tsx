import { createContext, useContext, type ReactNode } from 'react';

import { resolveDefaultPopupContainer } from '../utils/helpers';

export type PopupContainerResolver = (triggerNode?: HTMLElement) => HTMLElement;

const PopupContainerContext = createContext<PopupContainerResolver>(
  resolveDefaultPopupContainer
);

export function PopupContainerProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: PopupContainerResolver;
}) {
  return (
    <PopupContainerContext.Provider value={value}>
      {children}
    </PopupContainerContext.Provider>
  );
}

export function usePopupContainer() {
  return useContext(PopupContainerContext);
}
