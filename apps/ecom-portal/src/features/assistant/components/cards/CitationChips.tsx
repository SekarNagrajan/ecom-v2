// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { useNavigate } from "@tanstack/react-router";

import { AppIcon, Icons } from "../../../../components/icons";
import type { CitationChip } from "../../types/assistant.types";
import { citationOpenPath } from "../../utils/citation-routes";

export function CitationChips({ citations }: { citations: CitationChip[] }) {
  const navigate = useNavigate();
  if (!citations.length) return null;

  return (
    <div className="assistant-citations">
      {citations.map((cite) => {
        const path = citationOpenPath(cite.route);
        if (!path) return null;
        return (
          <button
            key={cite.marker}
            type="button"
            className="assistant-citation"
            onClick={() => navigate({ to: path })}
          >
            {cite.title}
            <AppIcon icon={Icons.arrowRight} size={12} />
          </button>
        );
      })}
    </div>
  );
}
