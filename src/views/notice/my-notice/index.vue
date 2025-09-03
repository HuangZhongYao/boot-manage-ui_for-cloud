<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api.js'
import { formatDateTime } from '@/utils/index.js'
// 定义组件名称。设置keepAlive需将组件的name设置成当前菜单的code。一定要这样写才可以切换页面时保存当前标签页的状态。
defineOptions({ name: 'MyNotice' })
const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
const loading = ref(false)

const tableData = ref([])

const pagination = reactive({
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

const columns = [
  {
    title: '序号',
    key: 'serialNo', // 可以随便取名，不会对应实际字段
    width: 60,
    align: 'center',
    render(row, index) {
      // index 是当前页的行索引（从 0 开始）
      // 计算全局序号：(当前页码 - 1) * 每页条数 + 当前行索引 + 1
      const globalIndex = (pagination.page - 1) * pagination.pageSize + index + 1
      return h('span', globalIndex)
    },
  },
  {
    title: '标题',
    key: 'title',
    ellipsis: { tooltip: true },
  },
  {
    title: '状态',
    key: 'readState',
    width: 60,
    render: ({ readState }) =>
      h(
        NTag,
        { type: 'success', round: true, size: 'small', bordered: false, style: '' },
        { default: () => readState ? '已读' : '未读' },
      ),
  },
  {
    title: '通知时间',
    key: 'createdTime',
    ellipsis: { tooltip: true },
    render(row) {
      return h('span', formatDateTime(row.createdTime))
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 70,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            onClick: () => handleDelete({ ids: [row.id] }),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        ),
      ]
    },
  },
]

async function handleQuery() {
  try {
    loading.value = true
    const params = { pageNo: pagination.page, pageSize: pagination.pageSize, ...queryItems.value }
    const res = await api.read(params)
    // 判断使用后端分页还是前端分页
    tableData.value = res.result?.records || res.result
    pagination.itemCount = res.result.total ?? res.result.length
    if (pagination.itemCount && !tableData.value.length && pagination.page > 1) {
    }
    for (const valueElement of tableData.value) {
      valueElement.key = valueElement.id
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
  <NDataTable
    ref="$table"
    size="large"
    :remote="true"
    :loading="loading"
    max-height="80vh"
    min-width=""
    virtual-scroll
    :columns="columns"
    :data="tableData"
    :row-key="(row) => row[rowKey]"
    :pagination="pagination"
  />
</template>

<style scoped>

</style>
