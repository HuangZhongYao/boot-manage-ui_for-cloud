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
      :scroll-x="1900"
      :columns="columns"
      :get-data="api.read"
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
        <DictSelect v-model:value="modalForm.state" dict-type-code="NOTICE_STATE" :default-value="modalForm.type ? modalForm.type : modalForm.type = `mysql`" clearable />
      </MeQueryItem>
    </MeCrud>
    <MeModal ref="modalRef" width="60%" :mask-closable="false">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        inline
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
          label="通知对象"
          path="receive"
          :rule="{
            required: true,
            message: '请选择通知对象',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.receive" default-value="f" />
        </n-form-item>
      </n-form>
      <n-form>
        <RichTextEditor :content="modalForm.centent" @update="updateTextContent" />
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
import { NButton } from 'naive-ui'
import api from './api.js'
import { CommonPage, DictSelect, MeCrud, MeModal, MeQueryItem } from '@/components/index'
import { useCrud } from '@/composables/index.js'
import { formatDateTime } from '@/utils/index.js'
import RichTextEditor from '@/components/me/rich-text-editor/index.vue'

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
    notificationsTargetDTOList: [{ notificationsTarget: 'ALL', notificationsTargetId: '1' }],
  },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '标题',
    key: 'title',
  },
  { title: '状态', key: 'state', ellipsis: { tooltip: true } },
  { title: '发布人', key: 'createdBy', ellipsis: { tooltip: true } },
  {
    title: '创建时间',
    key: 'createdTime',
    render(row) {
      return h('span', formatDateTime(row.createdTime))
    },
  },
  {
    title: '操作',
    key: 'actions',
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'tiny',
            style: 'margin-left: 8px;',
            onClick: () => handleView(),
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
            style: 'margin-left: 8px;',
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
 * 富文本内容更新函数
 * @param content
 */
function updateTextContent(content) {
  modalForm.value.content = content
}
</script>

<style scoped>

</style>
