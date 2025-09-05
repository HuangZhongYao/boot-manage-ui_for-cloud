<script setup>
import api from './api.js'

// 定义组件名称（用于 keepAlive，与菜单 code 一致）
defineOptions({ name: 'MyNotice' })
// 定义更新事件
const emit = defineEmits(['update'])
// 查询参数（可选）
const queryItems = ref({})

// 加载状态
const loading = ref(false)

// 列表数据
const listData = ref([])
// 空状态判定
const showEmpty = computed(() => !loading.value && listData.value.length === 0)

// 类型映射（可根据后端字段自适应）
function getTypeInfo(item) {
  const label = item.typeName || item.type || item.category || '系统'
  // 简单的类型到颜色映射，可继续扩展
  const map = {
    系统: 'success',
    公告: 'info',
    告警: 'error',
    提醒: 'warning',
  }
  const type = map[label] || 'default'
  return { label, type }
}

// 禁止背景滚动（进入页面时）
let prevBodyOverflow = ''
onMounted(() => {
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.body.style.overflow = prevBodyOverflow
})

// 分页配置
const pagination = reactive({
  itemCount: 0,
  pages: 1,
  page: 1,
  pageSize: 30,
  pageSizes: [20, 30, 50, 100],
  showSizePicker: true,
  showQuickJumper: true,
  displayOrder: ['pages'],
  prefix({ itemCount }) {
    return `共 ${itemCount} 条数据`
  },
  onChange: (page) => {
    pagination.page = page
    handleQuery()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    handleQuery()
  },
})

/**
 * 查询通知列表
 */
async function handleQuery() {
  try {
    loading.value = true
    const params = {
      pageNo: pagination.page,
      pageSize: pagination.pageSize,
      ...queryItems.value,
    }
    const res = await api.read(params)

    // 列表数据：兼容后端分页对象 或 直接数组
    listData.value = (res.result?.records || res.result).map(item => ({
      ...item,
      _visible: true, // 用于控制删除动画的显示/隐藏
    }))

    // 分页信息
    pagination.itemCount = res.result.total ?? res.result.length
    pagination.pages = res.result.pages ?? 1

    onUpdateItemCount()
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    listData.value = []
    pagination.itemCount = 0
  }
  finally {
    loading.value = false
  }
}

/**
 * 标记已读
 */
function readRecords(data, row) {
  for (const item of listData.value) {
    if (item.id === row.id) {
      item.readState = true
      // 执行标记已读
      api.readNotificationRecords(data).then((res) => {
        item.readState = res.result
        if (!res.result) {
          $message.warning('操作失败')
        }
      })
      break
    }
  }
}

/**
 * 处理删除（带动画）
 */
function handleDelete(item) {
  // 1. 先隐藏该项，触发淡出动画
  item._visible = false

  // 2. 延迟执行真正的删除请求
  setTimeout(() => {
    api.delNotificationRecord({ ids: [item.id], delAll: false })
      .then((res) => {
        if (res.result) {
          const index = listData.value.findIndex(i => i.id === item.id)
          if (index > -1) {
            listData.value.splice(index, 1)
            pagination.itemCount = pagination.itemCount - 1
            onUpdateItemCount()
          }
        }
        else {
          item._visible = true
          $message.warning('操作失败')
        }
      })
      // eslint-disable-next-line node/handle-callback-err
      .catch((err) => {
        $message.warning('操作失败')
        // 可在此处重新显示该条目，或者提示用户
        item._visible = true
      })
  }, 300) // 动画时长，与 CSS 中 transition 保持一致
}

function onUpdateItemCount() {
  emit('update', pagination.itemCount)
}

// 页面加载时查询数据
onMounted(() => {
  handleQuery()
})
</script>

<template>
  <!-- 加载骨架屏 -->
  <n-skeleton v-if="loading" text :repeat="5" class="mb-8" />

  <!-- 空状态 -->
  <n-empty v-else-if="showEmpty" description="暂无通知" class="py-10" />

  <!-- 通知列表 -->
  <n-list v-else hoverable clickable bordered class="border-none">
    <Transition
      v-for="item in listData"
      :key="item.id"
      name="fade"
      mode="out-in"
    >
      <n-list-item
        v-if="item._visible !== false"
        :key="item.id"
        class="group my-notice-item rounded-8 px-2 py-1"
      >
        <div class="notice-row">
          <!-- 图标列 -->
          <div class="flex items-center justify-center">
            <n-badge :value="item.readState ? 0 : 1" :dot="!item.readState">
              <n-avatar size="small" class="bg-primary:10 text-primary">
                <i class="i-fe:bell" />
              </n-avatar>
            </n-badge>
          </div>

          <!-- 标题与时间（自适应） -->
          <div class="content-col">
            <div class="title line-height-24">
              <n-ellipsis>{{ item.title }}</n-ellipsis>
            </div>
            <div class="meta flex items-center gap-2 text-12 color-#999">
              <n-time :time="item.createdTime" />
              <n-tag size="small" round :type="getTypeInfo(item).type" class="origin-left scale-85 opacity-90">
                <n-ellipsis line-clamp="1">
                  {{ getTypeInfo(item).label }}
                </n-ellipsis>
              </n-tag>
            </div>
          </div>

          <!-- 操作列 -->
          <div class="action-col">
            <n-space
              class="visibility-hidden group-hover:visibility-visible opacity-0 transition-all duration-500 group-hover:opacity-100"
              :size="4"
            >
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button
                    quaternary
                    round
                    @click="readRecords({ ids: [item.id], readAll: false }, item)"
                  >
                    <template #icon>
                      <i class="i-fe:check" />
                    </template>
                  </n-button>
                </template>
                标记已读
              </n-tooltip>

              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button
                    quaternary
                    round
                    type="error"
                    @click="handleDelete(item)"
                  >
                    <template #icon>
                      <i class="i-fe:x" />
                    </template>
                  </n-button>
                </template>
                删除
              </n-tooltip>
            </n-space>
          </div>
        </div>
      </n-list-item>
    </Transition>
  </n-list>

  <!-- 分页组件（底部粘性） -->
  <div
    class="pointer-events-auto sticky bottom-0 z-40 w-full flex justify-center overscroll-contain border-t bg-white/90 py-8 backdrop-blur-md dark:bg-#121212/90"
    @wheel.capture.stop.prevent
    @touchmove.capture.stop.prevent
  >
    <n-pagination
      v-model:page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :page-count="pagination.pages"
      @update:page-size="pagination.onUpdatePageSize"
      @update:page="pagination.onChange"
    >
      <template #prev>
        &lt;
      </template>
      <template #next>
        &gt;
      </template>
    </n-pagination>
  </div>
</template>

<style scoped>
/* 淡出动画 + 向上滑动 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 卡片与列表的细节样式 */
.my-notice-item {
  transition:
    box-shadow 0.25s ease,
    background-color 0.25s ease;
}

.my-notice-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

/* 网格对齐：icon 40px / type 72px / content 自适应 / action 92px */
.notice-row {
  display: grid;
  grid-template-columns: 40px 1fr 92px;
  align-items: center;
  gap: 8px;
}

.content-col .title :deep(.n-ellipsis) {
  font-weight: 600;
}

.action-col {
  display: flex;
  justify-content: flex-end;
}
</style>
