<!--------------------------------
 - 通用CRUD组件支持表格和卡片切换显示
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/04 22:51:42
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->
<template>
  <AppCard v-if="$slots.default" bordered bg="#fafafc dark:black" class="mb-30 min-h-60 rounded-4">
    <form class="flex justify-between p-10" @submit.prevent="handleSearch()">
      <n-scrollbar x-scrollable>
        <n-space :wrap="!expand || isExpanded" :size="[32, 16]" class="p-10">
          <slot />
        </n-space>
      </n-scrollbar>
      <div class="flex flex-shrink-0 items-center p-10">
        <NButton ghost type="primary" @click="handleReset">
          <i class="i-fe:rotate-ccw mr-4" />
          重置
        </NButton>
        <NButton attr-type="submit" class="ml-20" type="primary">
          <i class="i-fe:search mr-4" />
          搜索
        </NButton>
        <n-icon
          class="ml-4 cursor-pointer p-2 transition-all duration-200 hover:bg-gray-100 hover:text-primary"
          size="25"
          @click="toggleView"
        >
          <i :class="viewMode === 'table' ? 'i-me:xicon-card' : 'i-me:xicon-table'" />
        </n-icon>
        <template v-if="expand">
          <NButton v-if="!isExpanded" type="primary" text @click="toggleExpand">
            <i class="i-fe:chevrons-down ml-4" />
            展开
          </NButton>
          <NButton v-else text type="primary" @click="toggleExpand">
            <i class="i-fe:chevrons-up ml-4" />
            收起
          </NButton>
        </template>
      </div>
    </form>
  </AppCard>

  <!-- 视图容器 -->
  <div class="view-container">
    <transition name="view-transition" mode="out-in">
      <!-- 表格视图 -->
      <NDataTable
        v-if="viewMode === 'table'"
        key="table-view"
        :remote="remote"
        :loading="loading"
        :scroll-x="scrollX"
        :max-height="maxHeight"
        :columns="columns"
        :data="tableData"
        :row-key="(row) => row[rowKey]"
        :pagination="isPagination ? pagination : false"
        class="view-content"
        @update:checked-row-keys="onChecked"
        @update:page="onPageChange"
        @update:page-size="onPageSizeChange"
      />

      <!-- 卡片视图 -->
      <div
        v-else-if="viewMode === 'card'"
        key="card-view"
        class="card-container view-content"
        :style="{ height: `${maxHeight}px` }"
      >
        <n-grid
          v-if="tableData && tableData.length > 0"
          cols="1 s:2 m:3 l:4 xl:5 2xl:6"
          responsive="screen"
          :x-gap="12"
          :y-gap="12"
        >
          <n-grid-item v-for="(row, index) in tableData" :key="row[rowKey] || index">
            <n-card
              size="small"
              hoverable
              embedded
              class="card-item"
            >
              <template #header>
                <span class="card-title">{{ getCardTitle(row) }}</span>
              </template>

              <n-descriptions label-placement="left" size="small" :column="1">
                <n-descriptions-item
                  v-for="column in displayColumns"
                  :key="column.key"
                  :label="column.title"
                >
                  <template v-if="column.render">
                    <RenderContent :render="column.render" :row="row" />
                  </template>
                  <template v-else>
                    {{ row[column.key] || '-' }}
                  </template>
                </n-descriptions-item>
              </n-descriptions>
            </n-card>
          </n-grid-item>
        </n-grid>

        <!-- 空状态 -->
        <n-empty
          v-else
          description="暂无数据"
          size="large"
          class="empty-state"
        />

        <!-- 分页 -->
        <n-pagination
          v-if="isPagination && pagination.itemCount > 0"
          class="pagination"
          :page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.itemCount"
          :page-sizes="pagination.pageSizes"
          show-size-picker
          show-quick-jumper
          @update:page="onPageChange"
          @update:page-size="onPageSizeChange"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { utils, writeFile } from 'xlsx'

const props = defineProps({
  /**
   * @remote true: 后端分页  false： 前端分页
   */
  remote: {
    type: Boolean,
    default: true,
  },
  /**
   * @isPagination 是否分页
   */
  isPagination: {
    type: Boolean,
    default: true,
  },
  scrollX: {
    type: Number,
    default: 1200,
  },
  maxHeight: {
    type: Number,
    default: 500,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  columns: {
    type: Array,
    required: true,
  },
  /** queryBar中的参数 */
  queryItems: {
    type: Object,
    default() {
      return {}
    },
  },
  /**
   * ! 约定接口入参出参
   * 分页模式需约定分页接口入参
   *    @pageSize 分页参数：一页展示多少条，默认10
   *    @pageNo   分页参数：页码，默认1
   * 需约定接口出参
   *    @pageData 分页模式必须,非分页模式如果没有pageData则取上一层data
   *    @total    分页模式必须，非分页模式如果没有total则取上一层data.length
   */
  getData: {
    type: Function,
    required: true,
  },
  /** 是否支持展开 */
  expand: Boolean,
})

const emit = defineEmits(['update:queryItems', 'onChecked', 'onDataChange'])

// 渲染内容组件
// eslint-disable-next-line no-undef
const RenderContent = defineComponent({
  props: {
    render: {
      type: Function,
      required: true,
    },
    row: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const result = computed(() => {
      try {
        return props.render(props.row)
      }
      catch (error) {
        console.error('Render function error:', error)
        return '-'
      }
    })

    return () => {
      const content = result.value

      // 处理不同类型的返回值
      if (content === null || content === undefined) {
        return h('span', '-')
      }

      if (Array.isArray(content)) {
        // 过滤掉无效的元素
        const validContent = content.filter(item => item !== null && item !== undefined)
        return validContent.length > 0 ? validContent : h('span', '-')
      }

      if (typeof content === 'object' && content !== null) {
        // 检查是否为 VNode
        if (typeof content === 'object' && 'type' in content) {
          return content
        }
        return h('span', JSON.stringify(content))
      }

      return h('span', String(content))
    }
  },
})

// 响应式数据
const loading = ref(false)
const initQuery = { ...props.queryItems }
const tableData = ref([])
const viewMode = ref('table') // 'table' | 'card'
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageSizes: [5, 10, 20, 30, 40, 50, 100],
  itemCount: 0,
  showSizePicker: true,
  showQuickJumper: true,
  displayOrder: ['pages', 'quick-jumper', 'size-picker'],
  prefix({ itemCount }) {
    return `共 ${itemCount} 条数据`
  },
})

// 是否展开
const isExpanded = ref(false)

// 计算属性 - 过滤卡片显示的列
const displayColumns = computed(() => {
  return props.columns.filter(column =>
    column
    && column.key
    && column.title
    && column.type !== 'selection'
    && column.type !== 'expand',
  )
})

// 切换视图模式
function toggleView() {
  viewMode.value = viewMode.value === 'table' ? 'card' : 'table'
}

// 获取卡片标题
function getCardTitle(row) {
  return row.name || row.username || row.title || row[props.rowKey] || '未命名'
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

// 处理查询
async function handleQuery() {
  try {
    loading.value = true
    let paginationParams = {}

    // 如果非分页模式或者使用前端分页,则无需传分页参数
    if (props.isPagination && props.remote) {
      paginationParams = { pageNo: pagination.page, pageSize: pagination.pageSize }
    }

    const res = await props.getData({
      ...props.queryItems,
      ...paginationParams,
    })

    // 判断使用后端分页还是前端分页
    tableData.value = res.result?.records || res.result || []
    pagination.itemCount = res.result?.total ?? res.result?.length ?? 0

    if (pagination.itemCount > 0 && tableData.value.length === 0 && pagination.page > 1) {
      // 如果当前页数据为空，且总条数不为0，则返回上一页数据
      onPageChange(pagination.page - 1)
    }
  }
  catch (error) {
    console.error('查询失败:', error)
    tableData.value = []
    pagination.itemCount = 0
  }
  finally {
    emit('onDataChange', tableData.value)
    loading.value = false
  }
}

function handleSearch(keepCurrentPage = false) {
  if (keepCurrentPage) {
    handleQuery()
  }
  else {
    onPageChange(1)
  }
}

async function handleReset() {
  const queryItems = { ...props.queryItems }
  for (const key in queryItems) {
    queryItems[key] = null
  }
  emit('update:queryItems', { ...queryItems, ...initQuery })
  await nextTick()
  pagination.page = 1
  handleQuery()
}

function onPageChange(currentPage) {
  pagination.page = currentPage
  if (props.remote) {
    handleQuery()
  }
}

function onPageSizeChange(pageSize) {
  pagination.pageSize = pageSize
  handleSearch()
}

function onChecked(rowKeys) {
  if (props.columns.some(item => item.type === 'selection')) {
    emit('onChecked', rowKeys)
  }
}

function handleExport(columns = props.columns, data = tableData.value) {
  if (!data?.length)
    return $message.warning('没有数据')

  const columnsData = columns.filter(item => !!item.title && !item.hideInExcel)
  const thKeys = columnsData.map(item => item.key)
  const thData = columnsData.map(item => item.title)
  const trData = data.map(item => thKeys.map(key => item[key]))
  const sheet = utils.aoa_to_sheet([thData, ...trData])
  const workBook = utils.book_new()
  utils.book_append_sheet(workBook, sheet, '数据报表')
  writeFile(workBook, '数据报表.xlsx')
}

defineExpose({
  handleSearch,
  handleReset,
  handleExport,
  toggleView,
})
</script>

<style scoped>
.view-container {
  position: relative;
}

.view-content {
  width: 100%;
}

.card-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-item {
  height: 100%;
  border-radius: 1vh;
}

.card-title {
  font-size: 14px;
  font-weight: 550;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

/* 视图切换动画 */
.view-transition-enter-active {
  transition: all 0.3s ease-out;
}

.view-transition-leave-active {
  transition: all 0.3s ease-in;
}

.view-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.view-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 暗色主题适配 */
:deep(.dark) .view-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

:deep(.dark) .view-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
