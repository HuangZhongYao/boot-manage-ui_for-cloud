<script setup>
import api from './api.js'

// 定义组件名称（用于 keepAlive，与菜单 code 一致）
defineOptions({ name: 'MyNotice' })

// 查询参数（可选）
const queryItems = ref({})

// 加载状态
const loading = ref(false)

// 列表数据
const listData = ref([])

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
  handleQuery()
}

// 页面加载时查询数据
onMounted(() => {
  handleQuery()
})
</script>

<template>
  <n-list hoverable clickable>
    <!-- 每个列表项包裹 Transition，实现删除动画 -->
    <Transition
      v-for="item in listData"
      :key="item.id"
      name="fade"
      mode="out-in"
    >
      <n-list-item
        v-if="item._visible !== false"
        :key="item.id"
        class="group"
      >
        <n-flex justify="space-between">
          <n-badge :value="item.readState ? 0 : 1" :dot="!item.readState">
            {{ item.title }}
          </n-badge>
          <n-space
            class="visibility-hidden group-hover:visibility-visible opacity-0 transition-all duration-700 group-hover:opacity-100"
            :size="[1, 0]"
          >
            <n-button
              quaternary
              round
              @click="readRecords({ ids: [item.id], readAll: false }, item)"
            >
              <template #icon>
                <i class="i-fe:check" />
              </template>
            </n-button>
            <n-button
              quaternary
              round
              @click="handleDelete(item)"
            >
              <template #icon>
                <i class="i-fe:x" />
              </template>
            </n-button>
          </n-space>
        </n-flex>
        <n-time :time="item.createdTime" class="mr-10 font-size-13" />
        <n-tag size="small" round type="success">
          系统
        </n-tag>
      </n-list-item>
    </Transition>
  </n-list>

  <!-- 分页组件 -->
  <n-pagination
    v-model:page="pagination.page"
    v-model:page-size="pagination.pageSize"
    :page-count="pagination.pages"
    class="pos-absolute bottom-1vh w-full justify-center"
    @update:page-size="pagination.onUpdatePageSize"
    @update:page="pagination.onChange"
  >
    <template #prev>
      <
    </template>
    <template #next>
      >
    </template>
  </n-pagination>
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
</style>
