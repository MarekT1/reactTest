import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react'
import { InfoCard } from './InfoCard'
import {
  accountMembershipQueryKey,
  deleteMemoMessage,
  getAccountMembership,
  getMemoryMessages,
  identifiedAccounts,
  janeDoeCustomerId,
  memoryMessagesQueryKey,
  postMemoMessages,
} from './memosApi'

const MEMO_MAX_LENGTH = 250

function formatMaintainedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

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
  accountId,
  productName,
  message,
  date,
  hasMessage,
  open,
  editing,
  locked,
  canCopy,
  copyPending,
  onToggle,
  onStartEdit,
  onStopEdit,
  onCopy,
}: {
  accountId: string
  productName: string
  message: string
  date: string
  hasMessage: boolean
  open: boolean
  editing: boolean
  locked: boolean
  canCopy: boolean
  copyPending: boolean
  onToggle: () => void
  onStartEdit: (productId: string) => void
  onStopEdit: (productId: string) => void
  onCopy: () => Promise<void>
}) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const editingRef = useRef(false)
  const pinCaretOnMouseUp = useRef(false)
  const selectionRef = useRef<number | null>(null)
  const wasOpenRef = useRef(open)
  const [trackedEditing, setTrackedEditing] = useState(editing)
  const [loadedMessage, setLoadedMessage] = useState(message)
  const [draft, setDraft] = useState(message)
  const [saveError, setSaveError] = useState<string | null>(null)
  const maintainedDate = formatMaintainedDate(date)

  if (message !== loadedMessage) {
    setLoadedMessage(message)
    if (!editing) {
      setDraft(message)
    }
  }
  if (editing !== trackedEditing) {
    setTrackedEditing(editing)
    if (!editing) {
      setDraft(message)
    }
  }
  if (!editing) {
    editingRef.current = false
    pinCaretOnMouseUp.current = false
  }

  const saveMutation = useMutation({
    mutationFn: async (memoryMessage: string) => {
      if (memoryMessage.trim() === '') {
        await deleteMemoMessage({ accountId })
        return
      }
      await postMemoMessages({ accountId, memoryMessage })
    },
  })

  const revealInColumn = () => {
    const editor = editorRef.current
    const widget = editor?.closest<HTMLElement>('[data-memos-widget]')
    if (!editor || !widget) {
      return
    }
    scrollColumnForMemo(widget, editor)
  }

  useLayoutEffect(() => {
    const wasOpen = wasOpenRef.current
    wasOpenRef.current = open
    if (!wasOpen || open || !editing) {
      return
    }
    const el = inputRef.current
    if (!el) {
      return
    }
    selectionRef.current = el.selectionStart
    el.blur()
  }, [open, editing])

  useLayoutEffect(() => {
    if (!open || !editing) {
      return
    }
    const el = inputRef.current
    if (!el) {
      return
    }
    el.focus()
    const position = selectionRef.current
    if (position !== null) {
      el.setSelectionRange(position, position)
      selectionRef.current = null
      return
    }
    placeCaretAtEnd(el)
  }, [open, editing])

  useLayoutEffect(() => {
    if (!editing) {
      return
    }
    revealInColumn()
  }, [editing])

  const beginEditing = () => {
    if (locked) {
      return
    }
    editingRef.current = true
    setSaveError(null)
    onStartEdit(accountId)
  }

  const toggle = () => {
    onToggle()
  }

  const handleMouseDown = (event: MouseEvent<HTMLTextAreaElement>) => {
    if (locked) {
      event.preventDefault()
      return
    }
    if (editingRef.current) {
      revealInColumn()
      return
    }
    event.preventDefault()
    const el = event.currentTarget
    pinCaretOnMouseUp.current = true
    beginEditing()
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
    if (locked || editingRef.current) {
      return
    }
    const el = event.currentTarget
    beginEditing()
    requestAnimationFrame(() => placeCaretAtEnd(el))
  }

  const handleCancel = () => {
    setDraft(message)
    setSaveError(null)
    inputRef.current?.blur()
    onStopEdit(accountId)
  }

  const handleSave = async () => {
    if (draft.length > MEMO_MAX_LENGTH) {
      return
    }
    setSaveError(null)
    try {
      await saveMutation.mutateAsync(draft)
      await queryClient.invalidateQueries({ queryKey: memoryMessagesQueryKey })
      editingRef.current = false
      pinCaretOnMouseUp.current = false
      inputRef.current?.blur()
      onStopEdit(accountId)
    } catch {
      setSaveError('Could not save the memo.')
    }
  }

  const handleCopy = async () => {
    setSaveError(null)
    try {
      await onCopy()
    } catch {
      setSaveError('Could not copy the memo.')
    }
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
          <Typography variant="body2" sx={{ fontWeight: hasMessage ? 700 : 400 }}>
            {productName || accountId}
          </Typography>
          {productName ? (
            <Typography variant="caption" color="text.secondary">
              {accountId}
            </Typography>
          ) : null}
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
          {maintainedDate ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
              Last maintained · {maintainedDate}
            </Typography>
          ) : null}
          <TextField
            inputRef={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={locked}
            multiline
            minRows={2}
            fullWidth
            size="small"
            placeholder="Add a memo"
            slotProps={{
              htmlInput: {
                'aria-label': `Memo for ${productName || accountId}`,
                onMouseDown: handleMouseDown,
                onMouseUp: handleMouseUp,
                onFocus: handleFocus,
              },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mt: 0.5,
            }}
          >
            {draft.length > MEMO_MAX_LENGTH ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 16 }} />
                <Typography variant="caption" color="error">
                  Message is too long
                </Typography>
              </Box>
            ) : (
              <Box />
            )}
            <Typography
              variant="caption"
              color={draft.length > MEMO_MAX_LENGTH ? 'error' : 'text.secondary'}
              sx={{ flexShrink: 0 }}
            >
              {draft.length}/{MEMO_MAX_LENGTH}
            </Typography>
          </Box>
          {editing ? (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={
                  saveMutation.isPending ||
                  draft === message ||
                  draft.length > MEMO_MAX_LENGTH
                }
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
          {canCopy && !editing ? (
            <Button
              size="small"
              variant="text"
              onClick={handleCopy}
              disabled={copyPending}
              sx={{ mt: 0.5, px: 0.5, textTransform: 'none' }}
            >
              Copy to all
            </Button>
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
  const queryClient = useQueryClient()
  const membershipQuery = useQuery({
    queryKey: accountMembershipQueryKey,
    queryFn: () => getAccountMembership(janeDoeCustomerId),
  })
  const accounts = identifiedAccounts(membershipQuery.data?.accounts ?? [])
  const accountIds = accounts.map((account) => account.accountId)
  const messagesQuery = useQuery({
    queryKey: [...memoryMessagesQueryKey, accountIds],
    queryFn: () => getMemoryMessages({ accountIds }),
    enabled: membershipQuery.isSuccess,
  })
  const copyMutation = useMutation({
    mutationFn: postMemoMessages,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memoryMessagesQueryKey }),
  })
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set())
  const [expandScrollNonce, setExpandScrollNonce] = useState(0)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const startEdit = useCallback((productId: string) => {
    setEditingProductId((current) => {
      if (current !== null && current !== productId) {
        return current
      }
      return productId
    })
  }, [])
  const stopEdit = useCallback((productId: string) => {
    setEditingProductId((current) => (current === productId ? null : current))
  }, [])

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
    setOpenIds(new Set(accountIds))
    setExpandScrollNonce((nonce) => nonce + 1)
  }

  useEffect(() => {
    if (expandScrollNonce === 0) {
      return
    }
    const widget = widgetRef.current
    if (!widget) {
      return
    }

    let finished = false
    const finish = () => {
      if (finished) {
        return
      }
      finished = true
      scrollColumnForMemo(widget, widget)
    }

    const collapses = [...widget.querySelectorAll<HTMLElement>('.MuiCollapse-root')].filter(
      (node) => !node.classList.contains('MuiCollapse-entered'),
    )
    if (collapses.length === 0) {
      finish()
      return
    }

    let remaining = collapses.length
    const timer = window.setTimeout(finish, 450)
    const cleanups = collapses.map((node) => {
      const onEnd = (event: TransitionEvent) => {
        if (event.target !== node || event.propertyName !== 'height') {
          return
        }
        remaining -= 1
        if (remaining <= 0) {
          window.clearTimeout(timer)
          finish()
        }
      }
      node.addEventListener('transitionend', onEnd)
      return () => node.removeEventListener('transitionend', onEnd)
    })

    return () => {
      window.clearTimeout(timer)
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [expandScrollNonce])

  const collapseAll = () => {
    setOpenIds(new Set())
  }

  const messagesByAccount = new Map((messagesQuery.data ?? []).map((memo) => [memo.accountId, memo]))
  const isPending = membershipQuery.isPending || (membershipQuery.isSuccess && messagesQuery.isPending)
  const isError = membershipQuery.isError || messagesQuery.isError
  const allExpanded = accounts.length > 0 && accounts.every((account) => openIds.has(account.accountId))
  const editingAnywhere = editingProductId !== null

  return (
    <Box ref={widgetRef} data-memos-widget>
      <InfoCard
        title="Memos"
        subheader="Jane Doe"
        action={
          <Button
            size="small"
            onClick={allExpanded ? collapseAll : expandAll}
            disabled={accounts.length === 0}
            sx={{ minWidth: 0, px: 1, fontSize: '0.75rem', textTransform: 'none' }}
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </Button>
        }
      >
        {isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        ) : null}
        {isError ? (
          <Typography variant="body2" color="error">
            Could not load memos.
          </Typography>
        ) : null}
        {!isPending && !isError
          ? accounts.map((account) => {
              const memo = messagesByAccount.get(account.accountId)
              const message = memo?.message ?? ''
              const hasMessage = message.trim() !== ''
              return (
                <ProductMemoRow
                  key={account.accountId}
                  accountId={account.accountId}
                  productName={account.productName}
                  message={message}
                  date={memo?.date ?? ''}
                  hasMessage={hasMessage}
                  open={openIds.has(account.accountId)}
                  editing={editingProductId === account.accountId}
                  locked={editingAnywhere && editingProductId !== account.accountId}
                  canCopy={hasMessage && !editingAnywhere}
                  copyPending={copyMutation.isPending}
                  onToggle={() => toggleProduct(account.accountId)}
                  onStartEdit={startEdit}
                  onStopEdit={stopEdit}
                  onCopy={() =>
                    copyMutation.mutateAsync({
                      accountIds,
                      memoryMessage: message,
                    })
                  }
                />
              )
            })
          : null}
      </InfoCard>
    </Box>
  )
}
