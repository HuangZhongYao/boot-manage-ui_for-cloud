<template>
  <CommonPage>
    <template #action>
      <NButton size="small" type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        发布公告
      </NButton>
    </template>
    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :columns="columns"
      :get-data="api.read"
      card-title-key="title"
      expand
    >
      <MeQueryItem label="标题" :label-width="40">
        <n-input
          v-model:value="queryItems.username"
          type="text"
          placeholder="请输入标题"
          clearable
          style="min-width: 70%"
          autosize
        />
      </MeQueryItem>
      <MeQueryItem label="状态" :label-width="40">
        <DictSelect v-model:value="queryItems.state" dict-type-code="NOTICE_STATE" clearable />
      </MeQueryItem>
    </MeCrud>
    <MeModal ref="modalRef" width="60%" class="h-95vh" :mask-closable="false">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          label="标题"
          path="title"
          :rule="{
            required: true,
            message: '请输入标题',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.title" />
        </n-form-item>
        <n-form-item
          label="级别"
          path="level"
          :rule="{
            required: true,
            message: '请选择通知级别',
            trigger: ['input', 'blur'],
          }"
        >
          <DictSelect v-model:value="modalForm.level" dict-type-code="SYS:TZ:JB" />
        </n-form-item>
        <n-form-item
          label="级别"
          path="type"
          :rule="{
            required: true,
            message: '请选择通知类型',
            trigger: ['input', 'blur'],
          }"
        >
          <DictSelect v-model:value="modalForm.type" dict-type-code="SYS:TZ:LX" />
        </n-form-item>
        <n-form-item
          label="全体通知"
          path="allNotifications"
          required
        >
          <n-switch v-model:value="modalForm.allNotifications" />
        </n-form-item>
        <n-form-item
          label="通知对象"
          :required="!modalForm.allNotifications"
        >
          <UserRoleOrgSelector multiple :disabled="modalAction === 'view' || modalForm.allNotifications" :checked-data="modalForm.notificationsTargets" @update="handleOrganizationSelector" />
        </n-form-item>
      </n-form>
      <n-form>
        <RichTextEditor :read-only-flag="modalAction === 'view'" :show-toolbar-flag="modalAction !== 'view'" :content="modalForm.content" @update="updateTextContent" />
      </n-form>
      <n-space v-show="false" :size="[50, 5]" justify="center">
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
        <n-skeleton height="35px" width="310px" />
      </n-space>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import api from './api.js'
import { CommonPage, DictSelect, MeCrud, MeModal, MeQueryItem, RichTextEditor, UserRoleOrgSelector } from '@/components/index'
import { useCrud } from '@/composables/index.js'
import { formatDateTime } from '@/utils/index.js'

// 定义组件名称。设置keepAlive需将组件的name设置成当前菜单的code。一定要这样写才可以切换页面时保存当前标签页的状态。
defineOptions({ name: 'NoticeMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

const { modalRef, modalFormRef, modalForm, modalAction, handleAdd, handleDelete, handleEdit, handleView } = useCrud({
  name: '公告',
  initForm: {
    content: '',
    title: '',
    allNotifications: true,
    notificationsTargets: [],
  },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

// 表格字段
const columns = [
  {
    title: '标题',
    key: 'title',
  },
  {
    title: '状态',
    key: 'state',
    render(row) {
      return h(
        NTag,
        { type: row.state === 'PUBLISHED' ? 'success' : 'info', bordered: false },
        row.stateDesc,
      )
    },
    ellipsis: { tooltip: true },
  },
  { title: '发布人', key: 'publisherName', ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createdTime',
    render(row) {
      return h('span', formatDateTime(row.createdTime))
    },
  },
  {
    title: '发布时间',
    key: 'publishTime',
    render(row) {
      return h('span', formatDateTime(row.publishTime))
    },
  },
  {
    title: '操作',
    key: 'actions',
    align: 'left',
    fixed: 'right',
    width: 320,
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'tiny',
            style: 'margin-left: 8px;',
            onClick: () => handleView(row),
          },
          {
            default: () => '查看',
            icon: () => h('i', { class: 'i-material-symbols:visibility-outline text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'info',
            style: 'margin-left: 8px;',
            disabled: !row.showPublishBtn,
            onClick: () => handlePublish(row),
          },
          {
            default: () => '发布',
            icon: () => h('i', { class: 'i-fe:send text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'primary',
            style: 'margin-left: 12px;',
            disabled: !row.showEditBtn,
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
            style: 'margin-left: 8px;',
            disabled: !row.showDelBtn,
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

/**
 * 发布公告方法
 * @param row
 */
function handlePublish(row) {
  api.publish({ id: row.id })
}

/**
 * 富文本内容更新函数
 * @param content
 */
function updateTextContent(content) {
  modalForm.value.content = content
}

/**
 * 组织选择器回调函数
 * @param data 选中数据
 */
function handleOrganizationSelector(data) {
  modalForm.value.notificationsTargets = data
}
</script>

<style scoped>

</style>
