<!--------------------------------
 - Author    ZhongYao.Huang (https://github.com/HuangZhongYao)
 - Time      2024-08-17 22:48
 - Copyright © 2024 ZuuuuYao By Github
 --------------------------------->
<template>
  <CommonPage>
    <n-flex justify="space-between">
      <n-flex vertical :size="[46, 10]">
        <h3>组织架构</h3>
        <div class="flex">
          <n-input v-model:value="treeOption.pattern" placeholder="搜索" clearable />
          <NButton class="ml-12" type="primary" ghost quaternary @click="initData">
            <i class="i-fe:rotate-ccw mr-4 text-14" />
          </NButton>
          <NButton class="ml-12" type="primary" @click="handleAdd">
            <i class="i-material-symbols:add mr-4 text-14" />
            新增
          </NButton>
        </div>
        <n-spin size="small" class="h-70vh overflow-y-auto" :show="treeOption.treeLoading">
          <n-tree
            :show-irrelevant-nodes="false"
            :pattern="treeOption.pattern"
            :data="treeData"
            :selected-keys="[currentNode?.id]"
            :render-switcher-icon="renderSwitcherIcon"
            :render-prefix="renderPrefix"
            :render-suffix="renderSuffix"
            :on-update:selected-keys="onSelect"
            key-field="id"
            label-field="name"
            default-expand-all
            block-line
          />
        </n-spin>
      </n-flex>
      <n-flex vertical class="ml-20 flex-1" style="flex-grow: 2">
        <n-flex inline justify="space-between">
          <h3>{{ currentNode?.name }}</h3>
        </n-flex>
        <NDataTable
          :remote="true"
          :columns="tableOption.columns"
          :loading="tableOption.loading"
          :data="tableData"
          :pagination="pagination"
        />
      </n-flex>
      <!--  树新增编辑模块框    -->
      <n-modal
        v-model:show="treeOption.showModal"
        class="custom-card"
        preset="card"
        :title="treeOption.modalTitle"
        size="small"
        close-on-esc
        :mask-closable="false"
        :style="treeOption.bodyStyle"
        :bordered="false"
        hoverable
      >
        <n-form
          ref="treeModalRef"
          label-align="left"
          label-placement="left"
          :label-width="80"
          :rules="treeOption.modalRule"
          :model="treeOption.modalForm"
        >
          <n-form-item path="parentId" label="所属上级">
            <n-tree-select
              :options="treeData"
              :default-value="treeOption.modalForm.parentId"
              placeholder="默认顶级"
              key-field="id"
              label-field="name"
              @update:value="treeSelectChange"
            />
          </n-form-item>
          <n-form-item path="name" label="组织名称">
            <n-input v-model:value="treeOption.modalForm.name" type="text" />
          </n-form-item>
          <n-form-item path="type" label="类型">
            <n-radio-group v-model:value="treeOption.modalForm.type" size="small" name="radioButtonOrganizationType">
              <n-radio-button
                v-for="item in treeOption.organizationType"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </n-radio-group>
          </n-form-item>
          <n-form-item path="sort" label="排序">
            <n-input
              v-model:value="treeOption.modalForm.sort"
              type="text"
              :allow-input="onlyAllowNumber"
              placeholder="值越小越靠前"
            />
          </n-form-item>
          <n-form-item label="备注">
            <n-input
              v-model:value="treeOption.modalForm.remark"
              type="textarea"
              maxlength="240"
              clearable
              show-count
            />
          </n-form-item>
          <n-form-item path="enable" label="状态">
            <NSwitch
              v-model:value="treeOption.modalForm.enable"
              :default-value="true"
              size="large"
            >
              <template #checked>
                启用
              </template>
              <template #unchecked>
                禁用
              </template>
            </NSwitch>
          </n-form-item>
        </n-form>

        <template #action>
          <n-flex justify="end">
            <NButton @click.prevent="treeOption.showModal = false">
              取消
            </NButton>
            <NButton type="primary" @click.prevent="saveOrganization">
              保存
            </NButton>
          </n-flex>
        </template>
      </n-modal>
    </n-flex>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NDataTable, NIcon, NSwitch, NTag } from 'naive-ui'
import { ChevronForward } from '@vicons/ionicons5'
import { withModifiers } from 'vue'
import api from './api.js'
import userApi from '@/views/pms/user/api.js'
import { formatDateTime, onlyAllowNumber } from '@/utils/common.js'

// 定义组件名称。设置keepAlive需将组件的name设置成当前菜单的code。一定要这样写才可以切换页面时保存当前标签页的状态。
defineOptions({ name: 'OrganizationalMgt' })

// 树结构数据
const treeData = ref([])
// 树设置项
const treeOption = ref({
  pattern: '',
  treeLoading: true,
  showModal: false,
  modalTitle: '',
  modalAction: '',
  modalActionAdd: 'add',
  modalActionEdit: 'edit',
  modalForm: { },
  modalRule: {
    parentId: {
      required: false,
      message: '请选择所属上级',
      trigger: 'blur',
    },
    name: {
      required: true,
      message: '请输入字典类型名称',
      trigger: 'blur',
    },
    type: {
      required: true,
      message: '请选择组织类型',
      trigger: 'blur',
    },
    sort: {
      required: true,
      message: '请输入排序值',
      trigger: 'blur',
      type: 'number',
    },
  },
  organizationType: [
    {
      value: 'DEPARTMENT',
      label: '部门',
    },
    {
      value: 'COMPANY',
      label: '公司',
    },
    {
      value: 'ORGANIZATION',
      label: '组织',
    },
  ],
  bodyStyle: {
    width: '600px',
  },
})

// 树模态框
const treeModalRef = ref(null)
// 树当前选中节点
const currentNode = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  pageSizes: [5, 20, 50, 100],
  showSizePicker: false,
  showQuickJumper: false,
  displayOrder: ['pages', 'quick-jumper', 'size-picker'],
  prefix({ itemCount }) {
    return `共 ${itemCount} 条数据`
  },
  onChange: (page) => {
    pagination.page = page
    loadUserData()
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    loadUserData()
  },
})

const genders = [
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' },
  { label: '保密', value: 'UNKNOWN' },
]
// 表格设置项
const tableOption = ref({
  columns:
    [
      {
        title: '头像',
        key: 'avatarUrl',
        render: ({ avatarUrl }) =>
          h(NAvatar, {
            size: 'medium',
            round: true,
            bordered: true,
            src: avatarUrl,
          }),
      },
      { title: '用户名', key: 'username', width: 100, ellipsis: { tooltip: true } },
      { title: '账号', key: 'account', width: 100, ellipsis: { tooltip: true } },
      {
        title: '角色',
        key: 'roles',
        ellipsis: { tooltip: true },
        render: ({ roles }) => {
          if (roles?.length) {
            return roles.map((item, index) =>
              h(
                NTag,
                { type: 'success', round: true, size: 'small', bordered: false, style: index > 0 ? 'margin-left: 8px;' : '' },
                { default: () => item.name },
              ),
            )
          }
          return '暂无角色'
        },
      },
      {
        title: '性别',
        key: 'gender',
        render: ({ gender }) => genders.find(item => gender === item.value)?.label ?? '',
      },
      { title: '手机号', key: 'phone', width: 90, ellipsis: { tooltip: true } },
      {
        title: '状态',
        key: 'enable',
        render: row =>
          h(
            NSwitch,
            {
              size: 'small',
              rubberBand: false,
              value: row.enable,
              disabled: true,
            },
            {
              checked: () => '启用',
              unchecked: () => '停用',
            },
          ),
      },
      {
        title: '创建时间',
        key: 'createdTime',
        render(row) {
          return h('span', formatDateTime(row.createdTime))
        },
      },
      { title: '描述', key: 'remark', ellipsis: { tooltip: true } },
    ],
  loading: false,
  showModal: false,
  modalTitle: '',
  modalAction: '',
  modalActionAdd: 'add',
  modalActionEdit: 'edit',
  tabModalForm: {},
  tabModalRule: {
    name: {
      required: true,
      message: '请输入字典名称',
      trigger: 'blur',
    },
    code: {
      required: true,
      message: '请输入字典编码',
      trigger: 'blur',
    },
  },
  bodyStyle: {
    width: '600px',
  },
})
// 表格数据
const tableData = ref([])

/**
 * 加载用户数据
 */
async function loadUserData() {
  // 未选中节点不查询
  if (!currentNode.value) {
    return
  }
  // 显示加载层
  tableOption.value.loading = true
  // 请求用户数据
  const res = await userApi.read({ pageNo: pagination.page, pageSize: pagination.pageSize, organizationId: currentNode?.value?.id || '' })
  // 设置表格
  tableData.value = res?.result?.records || []
  // 设置分页数据
  pagination.itemCount = res?.result?.total || 0
  // 关闭加载层
  tableOption.value.loading = false
}

// 挂载函数
onMounted(() => {
  initData()
})

/**
 * 获取树数据
 * @returns {Promise<void>}
 */
async function initData() {
  // 显示树加载层
  treeOption.value.treeLoading = true
  // 请求树结构数据
  const res = await api.organizationTree()
  treeData.value = res?.result || []
  // 关闭树加载层
  treeOption.value.treeLoading = false
  // 加载字典数据
  await loadUserData()
}

function treeSelectChange(value, option) {
  treeOption.value.modalForm.parentId = value
}

/**
 * 组织添加或编辑保存方法
 */
async function saveOrganization() {
  // 验证表单
  await treeModalRef.value?.validate(async (errors) => {
    if (!errors) {
      let res
      if (treeOption.value.modalAction === treeOption.value.modalActionAdd) {
        // 添加保存
        res = await api.create(treeOption.value.modalForm)
      }
      else if (treeOption.value.modalAction === treeOption.value.modalActionEdit) {
        // 编辑保存
        res = await api.update(treeOption.value.modalForm)
      }
      await saveResultHandel(res)
    }
  })
}

/**
 * 处理保存接口调用
 * @param res
 */
async function saveResultHandel(res) {
  if (res?.success) {
    $message.success(res.message)
    // 刷新数据
    await initData()
    // 关闭模态框
    treeOption.value.showModal = false
  }
}

/**
 * 点击添加字典类型按钮触发方法
 * @param row
 */
function handleAdd(row) {
  treeOption.value.showModal = true
  treeOption.value.modalForm = {
    sort: 0,
    enable: true,
    remark: '',
  }
  treeOption.value.modalAction = treeOption.value.modalActionAdd
  if (row.name) {
    // 新增下级
    treeOption.value.modalForm.parentId = row.id
    treeOption.value.modalTitle = `${row.name || ''} 新增下级组织`
  }
  else {
    treeOption.value.modalTitle = '新增组织'
  }
}

/**
 * 点击编辑字典类型按钮触发方法
 * @param row
 */
function handleEdit(row) {
  treeOption.value.showModal = true
  treeOption.value.modalForm = { ...row }
  treeOption.value.modalAction = treeOption.value.modalActionEdit
  treeOption.value.modalTitle = `编辑${row.name}`
}

/**
 * 删除字典类型
 * @param row
 */
function handleDelete(row) {
  const d = $dialog.warning({
    content: '确定删除？',
    title: '提示',
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        d.loading = true
        const result = await api.delDictType({ ids: [row.id] })
        if (result.success) {
          $message.success(result.message)
          initData()
        }
        else {
          $message.error(result.message)
        }
        d.loading = false
      }
      catch (error) {
        d.loading = false
        $message.error(error)
      }
    },
  })
}

/**
 * 选中树节点
 * @param keys
 * @param option
 * @param action
 * @param node
 */
function onSelect(keys, option, { action, node }) {
  currentNode.value = node
  // 加载数据
  loadUserData()
}

/**
 * 开关图标
 * @returns {VNode}
 */
function renderSwitcherIcon(treeOption) {
  if (treeOption.option.children && treeOption.option.children.length > 0) {
    return h(NIcon, null, { default: () => h(ChevronForward) })
  }
  else {
    // 不存在下级不展示开关图标
    return h(NIcon, null, { default: () => h() })
  }
}

function renderPrefix({ option }) {
  return h('i', { class: `${option.icon}?mask text-16` })
}

/**
 * 树节点后缀
 * @param option
 * @returns {VNode<RendererNode, RendererElement, {[p: string]: any}>[]}
 */
function renderSuffix({ option }) {
  return [
    h(
      NButton,
      {
        text: true,
        type: 'primary',
        title: '新增下级组织',
        size: 'tiny',
        // disabled: !isPermission('AddOrganization'),
        onClick: withModifiers(() => handleAdd(option), ['stop']),
      },
      { default: () => '新增' },
    ),
    h(
      NButton,
      {
        text: true,
        type: 'primary',
        title: '编辑组织',
        size: 'tiny',
        style: 'margin-left: 12px;',
        // disabled: !isPermission('EditOrganization'),
        onClick: withModifiers(() => handleEdit(option), ['stop']),
      },
      { default: () => '编辑' },
    ),
    h(
      NButton,
      {
        text: true,
        type: 'error',
        size: 'tiny',
        style: 'margin-left: 12px;',
        // disabled: !isPermission('DelOrganization'),
        onClick: withModifiers(() => handleDelete(option), ['stop']),
      },
      { default: () => '删除' },
    ),
  ]
}
</script>

<style scoped>

</style>
