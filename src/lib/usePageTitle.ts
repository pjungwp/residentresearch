import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title === 'ResearchForge' ? title : `${title} · ResearchForge`;
  }, [title]);
}
