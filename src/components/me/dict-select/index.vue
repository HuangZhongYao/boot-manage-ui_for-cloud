<script setup>
import dictApi from '@/api/dict'

const props = defineProps({
  // 字典类型编码
  dictTypeCode: {
    type: String,
    default: '',
  },
  // 是否多选
  multiple: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, Number, Array],
    default: undefined,
  },
  defaultValue: {
    type: [String, Number, Array],
    default: undefined,
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 选项数据
const options = ref([])

// 异步获取选项数据的
async function loadOptions() {
  if (!props.dictTypeCode) {
    options.value = []
    return
  }

  try {
    const { result = [] } = await dictApi.getDictDataQueryListByCode({ dictTypeCode: props.dictTypeCode })
    options.value = result.map(item => ({
      label: () =>
        h('span', { class: 'flex items-center' }, [
          h('i', { class: 'text-18 mr-8' }), // 请根据你的 UI 框架替换为真实图标组件
          item.name,
        ]),
      disabled: !item.enable,
      value: item.code,
    }))
  }
  catch (error) {
    console.error('获取字典数据失败:', error)
    options.value = []
  }
}

// 组件挂载时加载
onMounted(() => {
  loadOptions()
})

// Watch dictTypeCode 变化，重新加载
watch(() => props.dictTypeCode, loadOptions, { immediate: true })
</script>

<template>
  <n-select
    :model-value="props.modelValue"
    :options="options"
    :default="props.defaultValue"
    :clearable="props.clearable"
    :multiple="props.multiple"
    @update:value="(val) => emit('update:modelValue', val)"
  />
</template>

<style scoped>

</style>
