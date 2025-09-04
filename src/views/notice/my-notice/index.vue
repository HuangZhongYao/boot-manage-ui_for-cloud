<script setup>
import api from './api.js'
// 定义组件名称。设置keepAlive需将组件的name设置成当前菜单的code。一定要这样写才可以切换页面时保存当前标签页的状态。
defineOptions({ name: 'MyNotice' })
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
const loading = ref(false)

const listData = ref([])

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
 * @returns {Promise<void>}
 */
async function handleQuery() {
  try {
    loading.value = true
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize, ...queryItems.value }
    const res = await api.read(params)
    // 判断使用后端分页还是前端分页
    listData.value = res.result?.records || res.result
    pagination.itemCount = res.result.total ?? res.result.length
    pagination.pages = res.result.pages ?? 1
  }// eslint-disable-next-line unused-imports/no-unused-vars
  catch (error) {
    listData.value = []
    pagination.itemCount = 0
  }
  finally {
    loading.value = false
  }
}

/**
 * 已读
 * @param data
 */
function readRecords(data) {
  api.readNotificationRecords(data)
}

/**
 * 删除
 * @param data
 */
function delRecords(data) {
  api.delNotificationRecord(data)
}

onMounted(() => {
  handleQuery()
})
</script>

<template>
  <n-list hoverable clickable>
    <n-list-item v-for="item in listData" :key="item.id" class="group">
      <n-flex justify="space-between">
        <n-badge :value="1" dot>
          <span>{{ item.title }}</span>
        </n-badge>
        <n-space class="visibility-hidden group-hover:visibility-visible opacity-0 transition-all duration-700 group-hover:opacity-100">
          <n-button quaternary @click="readRecords({ ids: [item.id], readAll: false })">
            <template #icon>
              <i class="i-fe:check" />
            </template>
          </n-button>
          <n-button quaternary @click="delRecords({ ids: [item.id], delAll: false })">
            <template #icon>
              <i class="i-fe:x" />
            </template>
          </n-button>
        </n-space>
      </n-flex>
      <n-tag size="small" type="success">系统</n-tag>
      <n-time :time="item.createdTime" />
    </n-list-item>
  </n-list>
  <n-pagination
    v-model:page="pagination.page"
    v-model:page-size="pagination.pageSize"
    v-model:page-count="pagination.pages"
    class="pos-absolute bottom-1vh w-full justify-center"
    @update-page-size="pagination.onUpdatePageSize"
    @update-page="pagination.onChange"
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

</style>
