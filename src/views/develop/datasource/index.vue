<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" size="small" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增数据源
      </NButton>
    </template>
    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="名称" :label-width="50">
        <n-input
          v-model:value="queryItems.keyword"
          type="text"
          placeholder="数据源名称"
          clearable
          style="min-width: 70%"
          autosize
        />
      </MeQueryItem>
    </MeCrud>
    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <n-form-item
          label="名称"
          path="name"
          :rule="{
            required: true,
            message: '请输入名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" />
        </n-form-item>
        <n-form-item
          label="类型" path="type"
          :rule="{
            required: true,
            message: '请选择数据源类型',
            trigger: ['change', 'blur'],
          }"
        >
          <DictSelect v-model:value="modalForm.type" dict-type-code="DATA_SOURCE_TYPE" :default-value="modalForm.type ? modalForm.type : modalForm.type = `mysql`" clearable />
        </n-form-item>
        <n-form-item
          label="驱动类"
          path="driverClassName"
          :rule="{
            required: true,
            message: '请输入驱动类',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.driverClassName" />
        </n-form-item>
        <n-form-item
          label="url"
          path="url"
          :rule="{
            required: true,
            message: '请输入url',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.url" />
        </n-form-item>
        <n-form-item
          label="用户名"
          path="username"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.username" />
        </n-form-item>
        <n-form-item
          label="密码"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.password" />
        </n-form-item>

        <n-form-item label="状态" path="enable">
          <NSwitch v-model:value="modalForm.enable" :default-value="true" :checked-value="true" :unchecked-value="false">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup lang="js">
import { NButton, NSwitch } from 'naive-ui'
import { ref } from 'vue'
import api from './api'
import { CommonPage, DictSelect, MeCrud, MeModal, MeQueryItem } from '@/components/index.js'
import { formatDateTime } from '@/utils/index'
import { useCrud } from '@/composables/index.js'
// 定义组件名称。设置keepAlive需将组件的name设置成当前菜单的code。一定要这样写才可以切换页面时保存当前标签页的状态。
defineOptions({ name: 'DataSourceMgt' })

const $table = ref(null)

// 页码挂载函数
onMounted(() => {
  $table.value?.handleSearch()
})

/** QueryBar筛选参数（可选） */
const queryItems = ref({})

const { modalRef, modalFormRef, modalAction, modalForm, handleAdd, handleDelete, handleEdit }
    = useCrud({
      name: '数据源',
      doCreate: api.create,
      doDelete: api.delete,
      doUpdate: api.update,
      initForm: { enable: true },
      refresh: (_, keepCurrentPage) => $table.value?.handleSearch(keepCurrentPage),
    })
const typeIcon = {
  MYSQL: { value: 'i-me:mysql' },
  ORACLE: { value: 'i-me:sqlserver' },
  POSTGRESQL: { value: 'i-me:postgre' },
  SQLSERVER: { value: 'i-me:oracle' },
  UNKNOWN: { value: 'i-me:database' },
}
const columns = [
  { title: '名称', key: 'name', ellipsis: { tooltip: true } },
  {
    title: '类型',
    key: 'type',
    render: ({ type }) =>
      [h(
        'i',
        {
          class: typeIcon[type ?? 'UNKNOWN'].value,
        },
      ), h(
        'span',
        {},
        ` ${type ?? ''}`,
      )],
  },
  { title: '驱动类', key: 'driverClassName', ellipsis: { tooltip: true } },
  { title: '用户名', key: 'username', ellipsis: { tooltip: true } },
  { title: 'URL', key: 'url', ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createdTime',
    ellipsis: { tooltip: true },
    render(row) {
      return h('span', formatDateTime(row.createdTime))
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-me:edit text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            style: 'margin-left: 12px;',
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
</script>

<style scoped>
</style>
