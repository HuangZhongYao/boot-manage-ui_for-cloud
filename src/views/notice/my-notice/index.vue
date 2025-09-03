<script setup>
import api from './api.js'
// 定义组件名称。设置keepAlive需将组件的name设置成当前菜单的code。一定要这样写才可以切换页面时保存当前标签页的状态。
defineOptions({ name: 'MyNotice' })
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
const loading = ref(false)

const tableData = ref([])

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
  },
})

async function handleQuery() {
  try {
    loading.value = true
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize, ...queryItems.value }
    const res = await api.read(params)
    // 判断使用后端分页还是前端分页
    tableData.value = res.result?.records || res.result
    pagination.itemCount = res.result.total ?? res.result.length
    pagination.pages = res.result.pages ?? 1
    if (pagination.itemCount && !tableData.value.length && pagination.page > 1) {
    }
  }
  catch (error) {
    tableData.value = []
    pagination.itemCount = 0
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  handleQuery()
})
</script>

<template>
  <n-list hoverable clickable>
    <n-list-item v-for="item in tableData" :key="item.id">
      <n-flex justify="space-between">
        <n-badge :value="1" dot>
          <span>{{ item.title }}</span>
        </n-badge>
        <n-space>
          <n-button quaternary>
            <template #icon>
              <i class="i-fe:check" />
            </template>
          </n-button>
          <n-button quaternary>
            <template #icon>
              <i class="i-fe:x" />
            </template>
          </n-button>
        </n-space>
      </n-flex>
    </n-list-item>
  </n-list>
  <n-pagination :page-count="pagination.pages" :page-size="pagination.pageSize" class="pos-absolute bottom-1vh w-full justify-center">
    <template #prev>
      <
    </template>
    <template #next>
      >
    </template>
  </n-pagination>
</template>

<style scoped>

</style>
