import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import {
  type ArticleDetail,
  articleDetailQueryKey,
  fetchArticleDetail,
} from "@/entities/article"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { AppNode } from "@/store/useGraphStore"

import { ArticleModalContent } from "./ArticleModalContent"

type ArticleNodeModalProps = {
  node: AppNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArticleNodeModal({
  node,
  open,
  onOpenChange,
}: ArticleNodeModalProps) {
  const articleId = node ? Number(node.id) : null

  const {
    data: detail,
    isLoading,
    isError,
  } = useQuery<ArticleDetail>({
    queryKey: articleDetailQueryKey(articleId ?? "none"),
    queryFn: () => fetchArticleDetail(articleId as number),
    enabled: open && articleId != null && !Number.isNaN(articleId),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="graph-article-modal">
        {isLoading && (
          <div className="graph-article-modal__loading">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Cargando artículo…
          </div>
        )}

        {isError && !isLoading && node && (
          <div className="graph-article-modal__error">
            No se pudo cargar el detalle del artículo.
          </div>
        )}

        {!isLoading && !isError && node && (
          <ArticleModalContent node={node} detail={detail} />
        )}
      </DialogContent>
    </Dialog>
  )
}
