// Created by Sekar Nagarajan (2026-09-28 15:22)
import { useQuery } from "@tanstack/react-query";

import { fetchHotlineContacts } from "../api/hotline.api";
import { hotlineKeys } from "../api/hotline.keys";

/** Reference data — legacy was app-startup servlet-context cache. */
export function useHotlineContacts() {
  return useQuery({
    queryKey: hotlineKeys.contacts(),
    queryFn: fetchHotlineContacts,
    staleTime: Infinity,
  });
}
