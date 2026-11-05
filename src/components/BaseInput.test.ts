import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  it('label 與 input 以 id 連結，輸入時發出 update:modelValue', async () => {
    const wrapper = mount(BaseInput, { props: { label: '電子郵件', modelValue: '' } })

    const label = wrapper.get('label')
    const input = wrapper.get('input')
    expect(label.text()).toContain('電子郵件')
    expect(label.attributes('for')).toBe(input.attributes('id'))

    await input.setValue('a@b.com')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a@b.com'])
  })

  it('有錯誤時顯示訊息並標記 aria-invalid', () => {
    const wrapper = mount(BaseInput, { props: { label: '密碼', modelValue: '', error: '請輸入密碼' } })

    const input = wrapper.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[role="alert"]').text()).toBe('請輸入密碼')
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('[role="alert"]').attributes('id'))
  })

  it('沒有錯誤時不渲染錯誤訊息', () => {
    const wrapper = mount(BaseInput, { props: { label: '姓名', modelValue: '王小明' } })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('false')
  })
})
