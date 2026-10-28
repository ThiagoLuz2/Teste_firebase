<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <main class="auth-layout">
        <section class="intro">
          <div class="brand-mark" aria-hidden="true">F</div>
          <p class="eyebrow">IONIC + VUE + FIREBASE</p>
          <h1>Seu espaço,<br />do seu jeito.</h1>
          <p class="intro-copy">
            Entre para acessar seu perfil e manter suas informações seguras em qualquer dispositivo.
          </p>
          <div class="tech-list" aria-label="Tecnologias">
            <span>Authentication</span>
            <span>Firestore</span>
            <span>Storage</span>
          </div>
        </section>

        <section class="form-panel">
          <div class="form-heading">
            <p class="eyebrow">
              {{ mode === 'register' ? 'COMECE AGORA' : mode === 'reset' ? 'RECUPERAÇÃO' : 'BEM-VINDO DE VOLTA' }}
            </p>
            <h2>{{ heading }}</h2>
            <p>{{ description }}</p>
          </div>

          <form class="auth-form" @submit.prevent="submit">
            <label class="field-label" for="email">E-mail</label>
            <ion-input
              id="email"
              v-model="email"
              class="form-input"
              type="email"
              autocomplete="email"
              placeholder="voce@exemplo.com"
              required
              :disabled="isLoading"
            />

            <template v-if="mode !== 'reset'">
              <label class="field-label" for="password">Senha</label>
              <ion-input
                id="password"
                v-model="password"
                class="form-input"
                type="password"
                autocomplete="current-password"
                placeholder="Mínimo de 6 caracteres"
                :minlength="6"
                required
                :disabled="isLoading"
              />
            </template>

            <p v-if="message" class="feedback" :class="{ success: isSuccess }" role="status">
              {{ message }}
            </p>

            <ion-button class="submit-button" expand="block" type="submit" :disabled="isLoading">
              <ion-spinner v-if="isLoading" name="crescent" />
              <span v-else>{{ actionLabel }}</span>
            </ion-button>
          </form>

          <div class="form-links">
            <button v-if="mode === 'login'" class="text-button" type="button" @click="changeMode('reset')">
              Esqueci minha senha
            </button>
            <p v-if="mode === 'login'">
              Ainda não tem conta?
              <button class="text-button strong" type="button" @click="changeMode('register')">Criar conta</button>
            </p>
            <p v-else-if="mode === 'register'">
              Já tem uma conta?
              <button class="text-button strong" type="button" @click="changeMode('login')">Fazer login</button>
            </p>
            <p v-else>
              Lembrou sua senha?
              <button class="text-button strong" type="button" @click="changeMode('login')">Voltar ao login</button>
            </p>
          </div>

          <p class="privacy-note">Seus dados são armazenados com segurança pelo Firebase.</p>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { IonButton, IonContent, IonInput, IonPage, IonSpinner } from '@ionic/vue';

import { auth } from '../firebase';
import { firebaseErrorMessage } from '../firebaseErrors';

type AuthMode = 'login' | 'register' | 'reset';

const router = useRouter();
const mode = ref<AuthMode>('login');
const email = ref('');
const password = ref('');
const message = ref('');
const isSuccess = ref(false);
const isLoading = ref(false);

const heading = computed(() => {
  if (mode.value === 'register') return 'Crie sua conta';
  if (mode.value === 'reset') return 'Recupere o acesso';
  return 'Acesse sua conta';
});

const description = computed(() => {
  if (mode.value === 'register') return 'Use seu e-mail para começar. Seu perfil pode ser completado depois.';
  if (mode.value === 'reset') return 'Enviaremos um link para redefinir sua senha.';
  return 'Informe seus dados para continuar.';
});

const actionLabel = computed(() => {
  if (mode.value === 'register') return 'Criar conta';
  if (mode.value === 'reset') return 'Enviar link de recuperação';
  return 'Entrar';
});

function changeMode(nextMode: AuthMode) {
  mode.value = nextMode;
  message.value = '';
  isSuccess.value = false;
  password.value = '';
}

async function submit() {
  isLoading.value = true;
  message.value = '';
  isSuccess.value = false;

  try {
    if (mode.value === 'register') {
      await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
      await router.replace('/home');
    } else if (mode.value === 'reset') {
      await sendPasswordResetEmail(auth, email.value.trim());
      message.value = 'Enviamos um link de recuperação para seu e-mail.';
      isSuccess.value = true;
    } else {
      await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
      await router.replace('/home');
    }
  } catch (error) {
    message.value = firebaseErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.auth-content {
  --background: #f5f7fb;
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 460px);
  gap: clamp(48px, 9vw, 140px);
  align-items: center;
  width: min(1120px, calc(100% - 48px));
  min-height: 100%;
  margin: 0 auto;
  padding: 64px 0;
}

.intro {
  max-width: 500px;
}

.brand-mark {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  margin-bottom: 56px;
  border-radius: 17px;
  background: #dce8ff;
  color: #2857b7;
  font-size: 26px;
  font-weight: 800;
}

.eyebrow {
  margin: 0 0 14px;
  color: #5876ac;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

.intro h1 {
  margin: 0;
  color: #18243a;
  font-size: clamp(42px, 5vw, 64px);
  font-weight: 750;
  letter-spacing: -0.055em;
  line-height: 1.06;
}

.intro-copy {
  max-width: 400px;
  margin: 24px 0;
  color: #69758b;
  font-size: 16px;
  line-height: 1.7;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.tech-list span {
  padding: 8px 11px;
  border: 1px solid #dfe5ef;
  border-radius: 999px;
  color: #53637e;
  font-size: 12px;
}

.form-panel {
  padding: clamp(28px, 5vw, 46px);
  border: 1px solid #e8ecf3;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 60px rgb(34 53 89 / 8%);
}

.form-heading h2 {
  margin: 0 0 9px;
  color: #1c2940;
  font-size: 28px;
  letter-spacing: -0.035em;
}

.form-heading > p:last-child {
  margin: 0;
  color: #788398;
  font-size: 14px;
  line-height: 1.6;
}

.auth-form {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
}

.field-label {
  margin: 0 0 8px;
  color: #3b4962;
  font-size: 13px;
  font-weight: 650;
}

.form-input {
  --background: #fbfcfe;
  --border-color: #e2e7ef;
  --border-radius: 11px;
  --padding-start: 14px;
  min-height: 48px;
  margin-bottom: 20px;
  border: 1px solid #e2e7ef;
  border-radius: 11px;
  color: #24334d;
  font-size: 14px;
}

.submit-button {
  min-height: 49px;
  margin: 5px 0 0;
  --background: #3569cc;
  --background-hover: #285ab8;
  --border-radius: 11px;
  font-size: 14px;
  font-weight: 700;
}

.submit-button ion-spinner {
  width: 20px;
  height: 20px;
}

.feedback {
  margin: -4px 0 14px;
  color: #b42318;
  font-size: 13px;
  line-height: 1.5;
}

.feedback.success {
  color: #13834b;
}

.form-links {
  margin-top: 20px;
  color: #748096;
  font-size: 13px;
  text-align: center;
}

.form-links p {
  margin: 13px 0 0;
}

.text-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #3569cc;
  cursor: pointer;
  font: inherit;
}

.text-button.strong {
  font-weight: 700;
}

.privacy-note {
  margin: 27px 0 0;
  color: #98a1b1;
  font-size: 11px;
  text-align: center;
}

@media (max-width: 760px) {
  .auth-layout {
    grid-template-columns: 1fr;
    gap: 28px;
    width: min(460px, calc(100% - 32px));
    padding: 32px 0;
  }

  .brand-mark {
    width: 44px;
    height: 44px;
    margin-bottom: 22px;
  }

  .intro h1 {
    font-size: 40px;
  }

  .intro-copy {
    margin: 14px 0;
    font-size: 14px;
  }

  .form-panel {
    padding: 26px 22px;
  }
}
</style>
