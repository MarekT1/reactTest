import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import { InfoCard } from './InfoCard'
import {
  getMemos,
  janeDoeProductIds,
  memosQueryKey,
  saveMemo,
  type ProductMemo,
} from './memosApi'

function placeCaretAtEnd(el: HTMLInputElement | HTMLTextAreaElement) {
  const end = el.value.length
  el.setSelectionRange(end, end)
}

function getColumnScroller(widget: HTMLElement) {
  let node = widget.parentElement
  while (node) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node
    }
    node = node.parentElement
  }
  return null
}

function scrollColumnForMemo(widget: HTMLElement, editor: HTMLElement) {
  const scroller = getColumnScroller(widget)
  if (!scroller) {
    return
  }

  const scrollerRect = scroller.getBoundingClientRect()
  const widgetRect = widget.getBoundingClientRect()
  const editorRect = editor.getBoundingClientRect()
  const widgetFits = widgetRect.height <= scrollerRect.height
  const target = widgetFits ? widgetRect : editorRect
  const inset = target.height + 16 <= scrollerRect.height ? 8 : 0

  let delta = 0
  if (!widgetFits && editorRect.height > scrollerRect.height) {
    delta = editorRect.top - scrollerRect.top
  } else if (target.top < scrollerRect.top + inset) {
    delta = target.top - scrollerRect.top - inset
  } else if (target.bottom > scrollerRect.bottom - inset) {
    delta = target.bottom - scrollerRect.bottom + inset
  }

  if (delta !== 0) {
    scroller.scrollBy({ top: delta })
  }
}

function ProductMemoRow({
  product,
  open,
  onToggle,
}: {
  product: ProductMemo
  open: boolean
  onToggle: () => void
}) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const editingRef = useRef(false)
  const pinCaretOnMouseUp = useRef(false)
  const openRef = useRef(open)
  const [editing, setEditing] = useState(false)
  const [showField, setShowField] = useState(true)
  const [draft, setDraft] = useState(product.memo)
  const [saveError, setSaveError] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: saveMemo,
  })

  useEffect(() => {
    const wasOpen = openRef.current
    openRef.current = open
    if (wasOpen === open) {
      return
    }
    editingRef.current = false
    pinCaretOnMouseUp.current = false
    setEditing(false)
    setSaveError(null)
    if (open) {
      setDraft(product.memo)
      setShowField(true)
    }
  }, [open, product.memo])

  const revealInColumn = () => {
    const editor = editorRef.current
    const widget = editor?.closest<HTMLElement>('[data-memos-widget]')
    if (!editor || !widget) {
      return
    }
    scrollColumnForMemo(widget, editor)
  }

  useLayoutEffect(() => {
    if (!open || !showField || !editing) {
      return
    }
    const el = inputRef.current
    if (!el || document.activeElement === el) {
      return
    }
    el.focus()
    placeCaretAtEnd(el)
  }, [open, showField, editing])

  useLayoutEffect(() => {
    if (!editing) {
      return
    }
    revealInColumn()
  }, [editing])

  const showLoadedMessage = () => {
    editingRef.current = false
    pinCaretOnMouseUp.current = false
    setEditing(false)
    setDraft(product.memo)
    setShowField(false)
    setSaveError(null)
  }

  const toggle = () => {
    onToggle()
  }

  const handleMouseDown = (event: MouseEvent<HTMLTextAreaElement>) => {
    if (editingRef.current) {
      revealInColumn()
      return
    }
    event.preventDefault()
    const el = event.currentTarget
    editingRef.current = true
    pinCaretOnMouseUp.current = true
    setEditing(true)
    setSaveError(null)
    el.focus()
    placeCaretAtEnd(el)
  }

  const handleMouseUp = (event: MouseEvent<HTMLTextAreaElement>) => {
    if (!pinCaretOnMouseUp.current) {
      return
    }
    pinCaretOnMouseUp.current = false
    placeCaretAtEnd(event.currentTarget)
  }

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    if (editingRef.current) {
      return
    }
    const el = event.currentTarget
    editingRef.current = true
    setEditing(true)
    setSaveError(null)
    requestAnimationFrame(() => placeCaretAtEnd(el))
  }

  const handleCancel = () => {
    showLoadedMessage()
  }

  const handleSave = async () => {
    setSaveError(null)
    try {
      await saveMutation.mutateAsync({ productId: product.productId, memo: draft })
      await queryClient.invalidateQueries({ queryKey: memosQueryKey })
      editingRef.current = false
      pinCaretOnMouseUp.current = false
      setEditing(false)
      setShowField(false)
    } catch {
      setSaveError('Could not save the memo.')
    }
  }

  const beginEditFromMessage = () => {
    setDraft(product.memo)
    setShowField(true)
    setSaveError(null)
    editingRef.current = true
    setEditing(true)
  }

  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', py: 0.5 }}>
      <Box
        component="button"
        type="button"
        onClick={toggle}
        aria-expanded={open}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 0,
          py: 0.75,
          border: 0,
          bgcolor: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2">{product.productName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {product.productId}
          </Typography>
        </Box>
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      </Box>
      <Collapse in={open}>
        <Box ref={editorRef} sx={{ pb: 1 }}>
          {showField ? (
            <TextField
              inputRef={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              multiline
              minRows={2}
              fullWidth
              size="small"
              placeholder="Add a memo"
              slotProps={{
                htmlInput: {
                  'aria-label': `Memo for ${product.productName}`,
                  onMouseDown: handleMouseDown,
                  onMouseUp: handleMouseUp,
                  onFocus: handleFocus,
                },
              }}
            />
          ) : (
            <Typography
              component="button"
              type="button"
              variant="body2"
              onClick={beginEditFromMessage}
              sx={{
                display: 'block',
                width: '100%',
                p: 0,
                border: 0,
                bgcolor: 'transparent',
                color: product.memo ? 'text.primary' : 'text.secondary',
                font: 'inherit',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                cursor: 'text',
              }}
            >
              {product.memo || 'No memo'}
            </Typography>
          )}
          {editing ? (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={saveMutation.isPending || draft === product.memo}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
            </Box>
          ) : null}
          {saveError ? (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
              {saveError}
            </Typography>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  )
}

export function MemosWidget() {
  const memosQuery = useQuery({
    queryKey: memosQueryKey,
    queryFn: () => getMemos({ productIds: janeDoeProductIds }),
  })
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set())

  const toggleProduct = (productId: string) => {
    setOpenIds((current) => {
      const next = new Set(current)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const expandAll = () => {
    setOpenIds(new Set(memosQuery.data?.map((product) => product.productId) ?? []))
  }

  const collapseAll = () => {
    setOpenIds(new Set())
  }

  const products = memosQuery.data ?? []

  return (
    <Box data-memos-widget>
      <InfoCard
        title="Memos"
        subheader="Jane Doe"
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              onClick={expandAll}
              disabled={products.length === 0}
              sx={{ minWidth: 0, px: 1, fontSize: '0.75rem', textTransform: 'none' }}
            >
              Expand all
            </Button>
            <Button
              size="small"
              onClick={collapseAll}
              disabled={products.length === 0}
              sx={{ minWidth: 0, px: 1, fontSize: '0.75rem', textTransform: 'none' }}
            >
              Collapse all
            </Button>
          </Box>
        }
      >
        {memosQuery.isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        ) : null}
        {memosQuery.isError ? (
          <Typography variant="body2" color="error">
            Could not load memos.
          </Typography>
        ) : null}
        {products.map((product) => (
          <ProductMemoRow
            key={product.productId}
            product={product}
            open={openIds.has(product.productId)}
            onToggle={() => toggleProduct(product.productId)}
          />
        ))}
      </InfoCard>
    </Box>
  )
}
