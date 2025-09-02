<script setup>
import { NAvatar, NButton, NDataTable, NIcon, NSwitch, NTag } from 'naive-ui'
import { ChevronForward } from '@vicons/ionicons5'
import { nanoid } from 'nanoid'
import api from '@/views/pms/organizational/api.js'
import { MeModal } from '@/components/index.js'
import userApi from '@/views/pms/user/api.js'

// 定义组件名称
defineOptions({ name: 'UserOrganizationSelector' })
// 定义组件属性
const props = defineProps({
  // 是否多选
  multiple: {
    type: Boolean,
    default: false,
  },
  // 默认选中数据
  checkedData: {
    type: [Array, Object],
    default: () => [],
  },
})
// 挂载函数
onMounted(() => {
  initData()
})
// 模态框ref
const modalRef = ref(null)
// 选中的用户和部门数据
const checkedDataRef = ref([])
// 选中数据类型
const checkedType = { user: 'USER', organization: 'ORGANIZATION' }

/**
 * 添加选中数据
 * @param type  类型
 * @param data  数据
 */
function addCheckedData(type, data) {
  // 清理 checkedDataRef 中原有的 type === type 数据
  const cleanedCheckedData = checkedDataRef.value.filter(item => item.type !== type)
  // 合并清理后的旧数据 + 新数据
  checkedDataRef.value = [...cleanedCheckedData, ...data]
}
/**
 * 根据类型获取选中数据
 * @param type 类型
 * @returns {UnwrapRefSimple<*>[]}
 */
function filterCheckedData(type) {
  return checkedDataRef.value.filter(item => item.type === type)
}
// 组织树结构数据
const treeData = ref([])
// 树当前选中节点
const currentNode = ref(null)
// 树设置项
const treeOption = ref({
  pattern: '',
  treeLoading: true,
  bodyStyle: {
    width: '600px',
  },
})

// 表格分页对象
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
// 表格选择的行key
const checkedRowKeysRef = ref([])
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
        type: 'selection',
        disabled: ({ enable }) => enable === false,
      },
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
      {
        title: '角色',
        key: 'roles',
        ellipsis: { tooltip: true },
        render: ({ roles }) => {
          if (roles?.length) {
            return roles.map((item, index) =>
              h(
                NTag,
                {
                  type: 'success',
                  round: true,
                  size: 'small',
                  bordered: false,
                  style: index > 0 ? 'margin-left: 8px;' : '',
                },
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
    ],
  loading: false,
})
// 表格数据
const tableData = ref([])

/**
 * 加载当前选择节点的用户数据
 */
async function loadUserData() {
  // 未选中节点不查询
  if (!currentNode.value) {
    return
  }
  // 显示加载层
  tableOption.value.loading = true
  // 请求用户数据
  const res = await userApi.read({
    pageNo: pagination.page,
    pageSize: pagination.pageSize,
    organizationId: currentNode?.value?.id || '',
  })
  // 设置表格
  tableData.value = res?.result?.records || []
  // 添加唯一标识
  for (const valueElement of tableData.value) {
    valueElement.key = nanoid()
  }
  // 设置分页数据
  pagination.itemCount = res?.result?.total || 0
  // 关闭加载层
  tableOption.value.loading = false
}

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
}

/**
 * 用户选择器选中树节点
 * @param keys
 * @param option
 * @param action
 * @param node
 */
function onSelect(keys, option, { node }) {
  currentNode.value = node
  // 加载数据
  loadUserData()
}

/**
 * 树节点内容渲染函数
 * @param option
 * @returns {VNode}
 */
function organizationRenderLabel(option) {
  // 组织禁用则禁止选择
  option.option.checkboxDisabled = option.option.enable === false
  option.option.disabled = option.option.enable === false
  return h(
    'span',
    {
      style: option.option.enable ? '' : 'color: red;',
    },
    {
      default: () => option.option.name,
    },
  )
}

/**
 * 部门选择器勾选节点发生变化时回调
 * @param keys 选中节点的 key 数组
 * @param option 选中选项数组
 * @param node 选中的节点对象
 */
function onOrganizationSelectChecked(keys, option, { node }) {
  // 从 option 中提取新的选中数据
  const newOrganizationData = option.map(row => ({
    id: row.id,
    name: row.name,
    type: checkedType.organization,
  }))
  // 添加到 checkedDataRef 中
  addCheckedData(checkedType.organization, newOrganizationData)
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

/**
 * 表格选中回调
 */
function handleCheckedRowChange() {
  // 获取当前选中的行数据
  const selectedRows = tableData.value.filter(row =>
    checkedRowKeysRef.value.includes(row.id),
  )
  // 从 selectedRows 中提取新的 type: 'USER' 数据
  const newUserData = selectedRows.map(row => ({
    id: row.id,
    name: row.username,
    type: checkedType.user,
  }))
  // 添加到 checkedDataRef 中
  addCheckedData(checkedType.user, newUserData)
}
</script>

<template>
  <div>
    回显选择
  </div>
  <MeModal ref="modalRef" width="1000px">
    <n-space>
      <n-space>
        <NTag v-for="item in filterCheckedData(checkedType.user)" :key="item.id" type="success">
          {{ item.name }}
        </NTag>
      </n-space>
      <n-space>
        <NTag v-for="item in filterCheckedData(checkedType.organization)" :key="item.id" type="info">
          {{ item.name }}
        </NTag>
      </n-space>
    </n-space>
    <n-tabs type="line" animated>
      <n-tab-pane name="oasis" tab="用户">
        <n-flex justify="space-between">
          <n-flex vertical :size="[46, 10]">
            <h3>组织架构</h3>
            <div class="flex">
              <n-input v-model:value="treeOption.pattern" placeholder="搜索" clearable />
              <NButton class="ml-12" type="primary" ghost quaternary @click="initData">
                <i class="i-fe:rotate-ccw mr-4 text-14" />
              </NButton>
            </div>
            <n-spin size="small" :show="treeOption.treeLoading">
              <n-tree
                class="hide-scrollbar h-70vh overflow-y-auto"
                :show-irrelevant-nodes="false"
                :pattern="treeOption.pattern"
                :data="treeData"
                :selected-keys="[currentNode?.id]"
                :render-switcher-icon="renderSwitcherIcon"
                :render-label="organizationRenderLabel"
                :on-update:selected-keys="onSelect"
                key-field="id"
                label-field="name"
                default-expand-all
                block-line
              />
            </n-spin>
          </n-flex>
          <n-flex vertical class="hide-scrollbar ml-20 h-80vh flex-1 overflow-y-auto" style="flex-grow: 2">
            <n-flex inline justify="space-between">
              <h3>{{ currentNode?.name }}</h3>
            </n-flex>
            <NDataTable
              v-model:checked-row-keys="checkedRowKeysRef"
              :row-key="row => row.id"
              :remote="true"
              :columns="tableOption.columns"
              :loading="tableOption.loading"
              :data="tableData"
              :pagination="pagination"
              @update:checked-row-keys="handleCheckedRowChange"
            />
          </n-flex>
        </n-flex>
      </n-tab-pane>
      <n-tab-pane name="the beatles" tab="部门">
        <n-flex vertical :size="[46, 10]">
          <h3>组织选择</h3>
          <div class="flex">
            <n-input v-model:value="treeOption.pattern" placeholder="搜索" clearable />
            <NButton class="ml-12" type="primary" ghost quaternary @click="initData">
              <i class="i-fe:rotate-ccw mr-4 text-14" />
            </NButton>
          </div>
          <n-spin size="small" :show="treeOption.treeLoading">
            <n-tree
              class="hide-scrollbar h-70vh overflow-y-auto"
              :show-irrelevant-nodes="false"
              :pattern="treeOption.pattern"
              :data="treeData"
              :render-label="organizationRenderLabel"
              :render-switcher-icon="renderSwitcherIcon"
              :on-update:checked-keys="onOrganizationSelectChecked"
              key-field="id"
              label-field="name"
              default-expand-all
              block-line
              checkable
            />
          </n-spin>
        </n-flex>
      </n-tab-pane>
    </n-tabs>
  </MeModal>
</template>

<style scoped>

</style>
