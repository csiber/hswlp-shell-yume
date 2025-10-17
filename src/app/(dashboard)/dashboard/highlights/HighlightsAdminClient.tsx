"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useServerAction } from 'zsa-react'
import { toast } from 'sonner'
import {
  createHighlightCollectionAction,
  deleteHighlightCollectionAction,
  updateHighlightCollectionAction,
} from './actions'
import type { ExploreItem } from '@/components/explore/ExplorePostCard'

interface AdminCollection {
  id: string
  slug: string
  title: string
  description: string | null
  activeFrom: string | null
  activeTo: string | null
  displayOrder: number
  isActive: boolean
  isDefault: boolean
  items: ExploreItem[]
}

interface FetchResponse {
  sections?: AdminCollection[]
}

interface FormState {
  title: string
  slug: string
  description: string
  activeFrom: string
  activeTo: string
  isActive: boolean
  isDefault: boolean
  displayOrder: string
}

const DEFAULT_FORM: FormState = {
  title: '',
  slug: '',
  description: '',
  activeFrom: '',
  activeTo: '',
  isActive: true,
  isDefault: false,
  displayOrder: '0',
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktív' },
  { value: 'upcoming', label: 'Következő' },
  { value: 'expired', label: 'Lejárt' },
  { value: 'inactive', label: 'Inaktív' },
  { value: 'all', label: 'Mind' },
] as const

type StatusValue = (typeof STATUS_OPTIONS)[number]['value']

function toInputDate(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

function formatDisplayDate(value: string | null) {
  if (!value) return 'nyitott'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'ismeretlen'
  }
  return date.toLocaleString('hu-HU')
}

export default function HighlightsAdminClient({ endpoint = '/api/explore' }: { endpoint?: string }) {
  const [collections, setCollections] = useState<AdminCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusValue>('active')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [createForm, setCreateForm] = useState<FormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(DEFAULT_FORM)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim())
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        admin: '1',
        includeItems: '1',
        collectionLimit: '200',
        highlightLimit: '200',
        status,
      })
      if (searchTerm) {
        params.set('search', searchTerm)
      }
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error('failed')
      }
      const data = (await response.json()) as FetchResponse
      setCollections(
        (data.sections ?? []).map(section => ({
          ...section,
          isActive: Boolean(section.isActive),
          isDefault: Boolean(section.isDefault),
        })),
      )
    } catch (error) {
      console.error(error)
      toast.error('Nem sikerült betölteni a kollekciókat')
    } finally {
      setLoading(false)
    }
  }, [endpoint, searchTerm, status])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const { execute: createCollection, isPending: creating } = useServerAction(
    createHighlightCollectionAction,
    {
      onError: (err) => {
        toast.error(err.err?.message ?? 'Nem sikerült létrehozni a kollekciót')
      },
      onSuccess: () => {
        toast.success('Kollekció létrehozva')
      },
    },
  )

  const { execute: updateCollection, isPending: updating } = useServerAction(
    updateHighlightCollectionAction,
    {
      onError: (err) => {
        toast.error(err.err?.message ?? 'Nem sikerült frissíteni a kollekciót')
      },
      onSuccess: () => {
        toast.success('Kollekció frissítve')
      },
    },
  )

  const { execute: deleteCollection, isPending: deleting } = useServerAction(
    deleteHighlightCollectionAction,
    {
      onError: (err) => {
        toast.error(err.err?.message ?? 'Nem sikerült törölni a kollekciót')
      },
      onSuccess: () => {
        toast.success('Kollekció törölve')
      },
    },
  )

  const handleCreate = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      title: createForm.title.trim(),
      slug: createForm.slug.trim(),
      description: createForm.description.trim() || undefined,
      activeFrom: createForm.activeFrom || null,
      activeTo: createForm.activeTo || null,
      isActive: createForm.isActive,
      isDefault: createForm.isDefault,
      displayOrder: Number.parseInt(createForm.displayOrder, 10) || 0,
    }
    try {
      await createCollection(payload)
      setCreateForm(DEFAULT_FORM)
      await fetchCollections()
    } catch (error) {
      console.error(error)
    }
  }, [createCollection, createForm, fetchCollections])

  const startEdit = (collection: AdminCollection) => {
    setEditingId(collection.id)
    setEditForm({
      title: collection.title,
      slug: collection.slug,
      description: collection.description ?? '',
      activeFrom: toInputDate(collection.activeFrom),
      activeTo: toInputDate(collection.activeTo),
      isActive: collection.isActive,
      isDefault: collection.isDefault,
      displayOrder: String(collection.displayOrder ?? 0),
    })
  }

  const handleUpdate = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingId) return

    const payload = {
      id: editingId,
      title: editForm.title.trim(),
      slug: editForm.slug.trim(),
      description: editForm.description.trim() || undefined,
      activeFrom: editForm.activeFrom || null,
      activeTo: editForm.activeTo || null,
      isActive: editForm.isActive,
      isDefault: editForm.isDefault,
      displayOrder: Number.parseInt(editForm.displayOrder, 10) || 0,
    }

    try {
      await updateCollection(payload)
      setEditingId(null)
      await fetchCollections()
    } catch (error) {
      console.error(error)
    }
  }, [editForm, editingId, updateCollection, fetchCollections])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törlöd ezt a kollekciót?')) {
      return
    }

    try {
      await deleteCollection({ id })
      await fetchCollections()
    } catch (error) {
      console.error(error)
    }
  }

  const activeCount = useMemo(() => collections.filter(col => col.isActive).length, [collections])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Új kollekció</CardTitle>
          <CardDescription>Hozz létre tematikus gyűjteményeket a kiemelt tartalmakhoz.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="new-title">Cím</Label>
              <Input
                id="new-title"
                value={createForm.title}
                onChange={event => setCreateForm(prev => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-slug">Slug</Label>
              <Input
                id="new-slug"
                value={createForm.slug}
                onChange={event => setCreateForm(prev => ({ ...prev, slug: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-description">Leírás</Label>
              <Textarea
                id="new-description"
                value={createForm.description}
                onChange={event => setCreateForm(prev => ({ ...prev, description: event.target.value }))}
                rows={3}
                placeholder="Rövid magyarázat a blokkhoz"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-active-from">Megjelenés kezdete</Label>
                <Input
                  id="new-active-from"
                  type="datetime-local"
                  value={createForm.activeFrom}
                  onChange={event => setCreateForm(prev => ({ ...prev, activeFrom: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-active-to">Megjelenés vége</Label>
                <Input
                  id="new-active-to"
                  type="datetime-local"
                  value={createForm.activeTo}
                  onChange={event => setCreateForm(prev => ({ ...prev, activeTo: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={event => setCreateForm(prev => ({ ...prev, isActive: event.target.checked }))}
                />
                Aktív kollekció
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={createForm.isDefault}
                  onChange={event => setCreateForm(prev => ({ ...prev, isDefault: event.target.checked }))}
                />
                Alapértelmezett gyűjtemény
              </label>
              <div className="grid gap-2">
                <Label htmlFor="new-order">Sorrend</Label>
                <Input
                  id="new-order"
                  type="number"
                  min={0}
                  value={createForm.displayOrder}
                  onChange={event => setCreateForm(prev => ({ ...prev, displayOrder: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? 'Mentés...' : 'Kollekció létrehozása'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kiemelt kollekciók</CardTitle>
          <CardDescription>
            {activeCount} aktív gyűjtemény, összesen {collections.length} kollekció található.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="sm:w-64">
                <Label htmlFor="search">Keresés</Label>
                <Input
                  id="search"
                  placeholder="Cím vagy slug alapján"
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                />
              </div>
              <div>
                <Label>Státusz</Label>
                <Select value={status} onValueChange={value => setStatus(value as StatusValue)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Státusz" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" onClick={fetchCollections} disabled={loading}>
              {loading ? 'Frissítés...' : 'Lista frissítése'}
            </Button>
          </div>

          {loading && collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">Betöltés folyamatban...</p>
          ) : (
            <div className="space-y-4">
              {collections.map(collection => (
                <div key={collection.id} className="rounded-lg border border-border p-4 space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{collection.title}</h3>
                      <p className="text-xs text-muted-foreground">Slug: {collection.slug}</p>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground mt-2">{collection.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={collection.isActive ? 'default' : 'secondary'}>
                        {collection.isActive ? 'Aktív' : 'Inaktív'}
                      </Badge>
                      {collection.isDefault && <Badge variant="outline">Alapértelmezett</Badge>}
                      <Badge variant="secondary">Sorrend: {collection.displayOrder}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {collection.activeFrom || collection.activeTo ? (
                      <span>
                        Időablak: {formatDisplayDate(collection.activeFrom)} → {formatDisplayDate(collection.activeTo)}
                      </span>
                    ) : (
                      <span>Nincs időablak megadva</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {collection.items.length > 0 ? (
                      collection.items.slice(0, 6).map(item => (
                        <Badge key={`${collection.id}-${item.id}`} variant="secondary" className="text-xs">
                          {item.title || 'Cím nélküli'}
                        </Badge>
                      ))
                    ) : (
                      <span>Nincs hozzárendelt elem</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(collection)}>
                      Szerkesztés
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(collection.id)}
                      disabled={deleting || collection.isDefault}
                      title={collection.isDefault ? 'Az alapértelmezett kollekció nem törölhető' : undefined}
                    >
                      Törlés
                    </Button>
                  </div>

                  {editingId === collection.id && (
                    <form className="space-y-3 border-t pt-4" onSubmit={handleUpdate}>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-title">Cím</Label>
                        <Input
                          id="edit-title"
                          value={editForm.title}
                          onChange={event => setEditForm(prev => ({ ...prev, title: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-slug">Slug</Label>
                        <Input
                          id="edit-slug"
                          value={editForm.slug}
                          onChange={event => setEditForm(prev => ({ ...prev, slug: event.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-description">Leírás</Label>
                        <Textarea
                          id="edit-description"
                          value={editForm.description}
                          onChange={event => setEditForm(prev => ({ ...prev, description: event.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-active-from">Megjelenés kezdete</Label>
                          <Input
                            id="edit-active-from"
                            type="datetime-local"
                            value={editForm.activeFrom}
                            onChange={event => setEditForm(prev => ({ ...prev, activeFrom: event.target.value }))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-active-to">Megjelenés vége</Label>
                          <Input
                            id="edit-active-to"
                            type="datetime-local"
                            value={editForm.activeTo}
                            onChange={event => setEditForm(prev => ({ ...prev, activeTo: event.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={event => setEditForm(prev => ({ ...prev, isActive: event.target.checked }))}
                          />
                          Aktív kollekció
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.isDefault}
                            onChange={event => setEditForm(prev => ({ ...prev, isDefault: event.target.checked }))}
                          />
                          Alapértelmezett gyűjtemény
                        </label>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-order">Sorrend</Label>
                          <Input
                            id="edit-order"
                            type="number"
                            min={0}
                            value={editForm.displayOrder}
                            onChange={event => setEditForm(prev => ({ ...prev, displayOrder: event.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setEditingId(null)} disabled={updating}>
                          Mégse
                        </Button>
                        <Button type="submit" disabled={updating}>
                          {updating ? 'Mentés...' : 'Változtatások mentése'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
              {collections.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">Nincs a feltételeknek megfelelő kollekció.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
