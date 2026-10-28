import { mount } from '@vue/test-utils';
import { describe, expect, test, vi } from 'vitest';

import AuthPage from '@/views/AuthPage.vue';

vi.mock('@/firebase', () => ({ auth: {} }));

describe('AuthPage.vue', () => {
  test('renders the login form', () => {
    const wrapper = mount(AuthPage);
    expect(wrapper.text()).toMatch('Acesse sua conta');
    expect(wrapper.text()).toMatch('Esqueci minha senha');
  });

  test('opens the password recovery form', async () => {
    const wrapper = mount(AuthPage);
    await wrapper.get('button.text-button').trigger('click');
    expect(wrapper.text()).toMatch('Recupere o acesso');
    expect(wrapper.text()).toMatch('Enviar link de recuperação');
  });
});
