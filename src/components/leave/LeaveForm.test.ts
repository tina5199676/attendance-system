import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LeaveForm from './LeaveForm.vue'

describe('LeaveForm', () => {
  it('事由為空時顯示錯誤且不送出', async () => {
    const wrapper = mount(LeaveForm, { props: { submitting: false } })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('請簡述請假事由')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('結束日期早於開始日期時顯示錯誤', async () => {
    const wrapper = mount(LeaveForm, { props: { submitting: false } })
    const [start, end] = wrapper.findAll('input[type="date"]')

    await start?.setValue('2024-03-10')
    await end?.setValue('2024-03-08')
    await wrapper.get('textarea').setValue('家庭旅遊')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('結束日期不可早於開始日期')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('資料完整時發出 submit 事件並帶出表單內容', async () => {
    const wrapper = mount(LeaveForm, { props: { submitting: false } })
    const [start, end] = wrapper.findAll('input[type="date"]')

    await wrapper.get('select').setValue('annual')
    await start?.setValue('2024-03-08')
    await end?.setValue('2024-03-10')
    await wrapper.get('textarea').setValue('家庭旅遊')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { type: 'annual', startDate: '2024-03-08', endDate: '2024-03-10', reason: '家庭旅遊' },
    ])
  })

  it('按取消會發出 cancel 事件', async () => {
    const wrapper = mount(LeaveForm, { props: { submitting: false } })
    const cancel = wrapper.findAll('button').find((button) => button.text() === '取消')

    await cancel?.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
