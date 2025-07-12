<template>
  <div class="flex flex-col space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Közösségi feed</h2>
      <button @click="loadFeed" class="rounded-md bg-muted px-2 py-1 text-sm shadow">Frissítés</button>
    </div>

    <transition-group name="feed" tag="div" class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-lg bg-muted p-4 text-muted-foreground shadow-md"
      >
        <div class="mb-2 flex justify-between text-xs">
          <span>{{ item.user.name || item.user.email }}</span>
          <span>{{ dayjs(item.created_at).fromNow() }}</span>
        </div>
        <div v-if="item.type === 'image'" class="flex justify-center">
          <img :src="item.url" :alt="item.title" class="max-h-48 rounded-md object-cover" />
        </div>
        <div v-else-if="item.type === 'music'" class="space-y-2">
          <div class="font-semibold">{{ item.title }}</div>
          <audio :src="item.url" controls class="w-full" />
        </div>
        <div v-else class="rounded-md border border-muted-foreground/20 p-3">
          {{ item.title }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface FeedItem {
  id: string
  user: { name?: string; email?: string }
  type: 'image' | 'music' | 'prompt'
  title: string
  created_at: string
  url: string
}

const items = ref<FeedItem[]>([])
let timer: number | undefined

async function loadFeed() {
  try {
    const res = await fetch('/api/community-feed')
    if (!res.ok) throw new Error('Failed to load feed')
    const data: FeedItem[] = await res.json()
    items.value = data
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadFeed()
  timer = window.setInterval(loadFeed, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.feed-enter-active,
.feed-leave-active {
  transition: all 0.3s ease;
}
.feed-enter-from,
.feed-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

