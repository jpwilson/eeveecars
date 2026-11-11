import { useEffect } from "react";

/** Sets document.title (the prerenderer sets the full head for crawlers). */
export default function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
