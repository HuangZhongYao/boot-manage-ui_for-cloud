<script setup>
import api from './api.js'

// 定义组件名称（用于 keepAlive，与菜单 code 一致）
defineOptions({ name: 'MyNotice' })
// 定义更新事件
const emit = defineEmits(['haveReadOne', 'readAll', 'total'])
// 查询参数（可选）
const queryItems = ref({})
// 加载状态
const loading = ref(false)
// 列表数据
const listData = ref([])
// 空状态判定
const showEmpty = computed(() => !loading.value && listData.value.length === 0)
// 消息总数
const totalNum = ref(0)
// 类型映射（可根据后端字段自适应）
function getTypeInfo(item) {
  const label = item.typeName || item.type || item.category || '系统'
  const map = {
    SYSTEM: 'success',
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
  handleQuery()
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

    listData.value = (res.result?.records || res.result).map(item => ({
      ...item,
      _visible: true,
    }))

    pagination.itemCount = res.result.total ?? res.result.length
    pagination.pages = res.result.pages ?? 1
    totalNum.value = pagination.itemCount

    onUpdateItemCount()
  }
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
      api.readNotificationRecords(data).then((res) => {
        item.readState = res.result
        if (res.result) {
          emit('haveReadOne')
        }
        else {
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
  item._visible = false

  setTimeout(() => {
    api.delNotificationRecord({ ids: [item.id], delAll: false })
      .then((res) => {
        if (res.result) {
          const index = listData.value.findIndex(i => i.id === item.id)
          if (index > -1) {
            listData.value.splice(index, 1)
            pagination.itemCount = pagination.itemCount - 1
            totalNum.value = pagination.itemCount
            onUpdateItemCount()
          }
        }
        else {
          item._visible = true
          $message.warning('操作失败')
        }
      })
      .catch((err) => {
        $message.warning('操作失败')
        item._visible = true
      })
  }, 300)
}

function onUpdateItemCount() {
  emit('total', totalNum.value)
}
</script>

<template>
  <!-- 加载骨架屏 -->
  <n-skeleton v-if="loading" text :repeat="5" class="mb-8" />

  <!-- 空状态 -->
  <n-empty v-else-if="showEmpty" description="暂无通知" class="py-10" />

  <!-- 通知列表 -->
  <n-list v-else clickable bordered hoverable class="border-none overflow-hidden w-full">
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
          <!-- 图标列：固定 40px -->
          <div class="icon-col">
            <n-badge :value="item.readState ? 0 : 1" :dot="!item.readState">
              <n-avatar size="small" class="bg-primary:10 text-primary">
                <i class="i-fe:bell" />
              </n-avatar>
            </n-badge>
          </div>

          <!-- 标题与时间（强制收缩区） -->
          <div class="content-col">
            <div class="title" :title="item.title">
              {{ item.title }}
            </div>
            <div class="meta flex items-center gap-2 text-12 color-#999 mt-2px overflow-hidden whitespace-nowrap">
              <n-time :time="item.createdTime" class="shrink-0" />
              <n-tag size="small" round :type="getTypeInfo(item).type" class="origin-left scale-85 opacity-90">
                <span class="block truncate max-w-80px">
                  {{ getTypeInfo(item).label }}
                </span>
              </n-tag>
            </div>
          </div>

          <!-- 操作列：稍微加宽到 40px，上下排列，绿勾红叉 -->
          <div class="action-col">
            <div
              v-if="!item.readState"
              class="action-buttons visibility-hidden group-hover:visibility-visible opacity-0 transition-all duration-300 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5"
            >
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button round quaternary size="tiny" type="success" @click="readRecords({ ids: [item.id], readAll: false }, item)">
                    <template #icon>
                      <i class="i-fe:check" />
                    </template>
                  </n-button>
                </template>
                已读
              </n-tooltip>

              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button round quaternary size="tiny" type="error" @click="handleDelete(item)">
                    <template #icon>
                      <i class="i-fe:x" />
                    </template>
                  </n-button>
                </template>
                删除
              </n-tooltip>
            </div>
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
/* 强制清除列表项默认可能带来的溢出 */
:deep(.n-list-item) {
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* 淡出动画 + 向上滑动 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 卡片与列表的细节样式 */
.my-notice-item {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  transition: box-shadow 0.25s ease, background-color 0.25s ease;
}

.my-notice-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

/* 外层弹性布局 */
.notice-row {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  gap: 12px;
}

/* 左侧图标固定宽度 */
.icon-col {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 中间内容区：宽度设0加上flex:1，实现完美自适应收缩 */
.content-col {
  flex: 1;
  width: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 标题单行截断 */
.content-col .title {
  display: block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  line-height: 24px;
}

/* 右侧操作区：稍微加宽，保证上下按钮排列时视觉居中 */
.action-col {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
</style>
