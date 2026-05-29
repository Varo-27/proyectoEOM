import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  fetchArticleDetailMock,
  type ArticleDetail,
} from "@/mocks/articleDetail.mock"
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
  const { data: detail, isLoading } = useQuery<ArticleDetail>({
    queryKey: ["article-detail-mock", node?.id],
    queryFn: () => fetchArticleDetailMock(node as AppNode),
    enabled: open && node != null,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,820px)] overflow-y-auto border-2 border-foreground p-0 shadow-[6px_6px_0_0_var(--color-foreground)] sm:max-w-2xl"
      >
        {isLoading && (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Cargando artículo…
          </div>
        )}

        {!isLoading && node && (
          <ArticleModalContent node={node} detail={detail} />
        )}
      </DialogContent>
    </Dialog>
  )
}
