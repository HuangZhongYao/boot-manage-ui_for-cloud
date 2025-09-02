<script setup>
import { NAvatar, NButton, NDataTable, NIcon, NSwitch, NTag } from 'naive-ui'
import { ChevronForward } from '@vicons/ionicons5'
import { checkedType } from './index.js'
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
  // 默认选中数据 数组时格式[{ id: id, name: name, type: type}]
  checkedData: {
    type: Array,
    default: () => [],
  },
})
// 声明事件
const emit = defineEmits(['update'])
// 挂载函数
onMounted(() => {
  initData()
})
// 模态框ref
const modalRef = ref(null)
// 选中的用户和部门数据
const checkedDataRef = ref([])

// 组织树结构数据
const treeData = ref([])
// 树当前选中节点
const currentNode = ref(null)
// 用户tab搜索状态
const userSearchPattern = ref('')
// 部门tab搜索状态
const orgSearchPattern = ref('')
// 树选中节点key
const checkedTreeKey = ref([])
// 树设置项
const treeOption = ref({
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
  // 清空选中状态
  checkedRowKeysRef.value = []
  try {
    // 请求用户数据
    const res = await userApi.read({
      pageNo: pagination.page,
      pageSize: pagination.pageSize,
      organizationId: currentNode.value.id || '',
    })
    // 设置表格
    tableData.value = res?.result?.records || []
    // 设置分页数据
    pagination.itemCount = res?.result?.total || 0
  }
  catch (error) {
    console.error('加载用户数据失败:', error)
    tableData.value = []
    pagination.itemCount = 0
  }
  finally {
    // 关闭加载层
    tableOption.value.loading = false
  }
}

/**
 * 获取树数据
 * @returns {Promise<void>}
 */
async function initData() {
  // 显示树加载层
  treeOption.value.treeLoading = true
  try {
    // 请求树结构数据
    const res = await api.organizationTree()
    treeData.value = res?.result || []
  }
  catch (error) {
    console.error('加载组织架构失败:', error)
    treeData.value = []
  }
  finally {
    // 关闭树加载层
    treeOption.value.treeLoading = false
  }
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
  // 重置分页
  pagination.page = 1
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
  checkedTreeKey.value = option.map(row => row.id)
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
  // 发送事件
  emit('update', checkedDataRef.value)
}
/**
 * 移除选中数据
 * @param id  id
 */
function removeCheckedData(id) {
  // 移除 checkedRowKeysRef.value 中 id === id 的数据
  checkedRowKeysRef.value = checkedRowKeysRef.value.filter(item => item !== id)
  // 移除 checkedTreeKey.value 中 id === id 的数据
  checkedTreeKey.value = checkedTreeKey.value.filter(item => item !== id)
  // 清理 checkedDataRef 中原有的 id === id 数据
  checkedDataRef.value = checkedDataRef.value.filter(item => item.id !== id)
  // 发送事件
  emit('update', checkedDataRef.value)
}
/**
 * 根据类型获取选中数据
 * @param type 类型
 * @returns {UnwrapRefSimple<*>[]}
 */
function filterCheckedData(type) {
  return checkedDataRef.value.filter(item => item.type === type)
}
defineExpose({
  checkedType,
})
</script>

<template>
  <n-flex class="w-80vh">
    <n-button type="info" class="pl-15 pr-15" size="small" strong secondary @click="modalRef.open()">
      添加
    </n-button>
    <n-space class="h-7vh overflow-y-auto">
      <n-space>
        <TransitionGroup name="list" tag="ul">
          <NTag v-for="item in filterCheckedData(checkedType.user)" :key="item.id" closable type="success" @close="removeCheckedData(item.id)">
            {{ item.name }}
          </NTag>
        </TransitionGroup>
      </n-space>
      <n-space>
        <TransitionGroup name="list" tag="ul">
          <NTag v-for="item in filterCheckedData(checkedType.organization)" :key="item.id" closable type="info" @close="removeCheckedData(item.id)">
            {{ item.name }}
          </NTag>
        </TransitionGroup>
      </n-space>
    </n-space>
  </n-flex>
  <MeModal ref="modalRef" width="1000px">
    <n-space class="h-7vh overflow-y-auto">
      <n-space>
        <TransitionGroup name="list" tag="ul">
          <NTag v-for="item in filterCheckedData(checkedType.user)" :key="item.id" closable type="success" @close="removeCheckedData(item.id)">
            {{ item.name }}
          </NTag>
        </TransitionGroup>
      </n-space>
      <n-space>
        <TransitionGroup name="list" tag="ul">
          <NTag v-for="item in filterCheckedData(checkedType.organization)" :key="item.id" closable type="info" @close="removeCheckedData(item.id)">
            {{ item.name }}
          </NTag>
        </TransitionGroup>
      </n-space>
    </n-space>
    <n-tabs type="line" animated>
      <n-tab-pane name="oasis" tab="用户">
        <n-flex justify="space-between">
          <n-flex vertical :size="[46, 10]">
            <h3>组织架构</h3>
            <div class="flex">
              <n-input v-model:value="userSearchPattern" placeholder="搜索" clearable />
              <NButton class="ml-12" type="primary" ghost quaternary @click="initData">
                <i class="i-fe:rotate-ccw mr-4 text-14" />
              </NButton>
            </div>
            <n-spin size="small" :show="treeOption.treeLoading">
              <n-tree
                class="hide-scrollbar h-70vh overflow-y-auto"
                :show-irrelevant-nodes="false"
                :pattern="userSearchPattern"
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
            <n-input v-model:value="orgSearchPattern" placeholder="搜索" clearable />
            <NButton class="ml-12" type="primary" ghost quaternary @click="initData">
              <i class="i-fe:rotate-ccw mr-4 text-14" />
            </NButton>
          </div>
          <n-spin size="small" :show="treeOption.treeLoading">
            <n-tree
              :checked-keys="checkedTreeKey"
              class="hide-scrollbar h-70vh overflow-y-auto"
              :show-irrelevant-nodes="false"
              :pattern="orgSearchPattern"
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
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
