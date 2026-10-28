<template>
  <ion-page>
    <ion-header class="app-header">
      <ion-toolbar>
        <div class="toolbar-inner">
          <router-link class="brand" to="/home" aria-label="Firebase Perfil">
            <span class="brand-icon">F</span>
            <span>firebase<span class="brand-light">perfil</span></span>
          </router-link>
          <div class="account-actions">
            <span class="account-email">{{ auth.currentUser?.email }}</span>
            <ion-button fill="clear" class="logout-button" @click="logout">Sair</ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <main class="page-container">
        <header class="page-heading">
          <div>
            <p class="eyebrow">SEU ESPAÇO PESSOAL</p>
            <h1>Olá, {{ greetingName }} <span aria-hidden="true">👋</span></h1>
            <p class="heading-copy">Tudo pronto. Aqui você pode acompanhar e atualizar seu perfil.</p>
          </div>
          <div class="welcome-badge">
            <span class="badge-dot" />
            Sessão segura
          </div>
        </header>

        <nav class="tabs" aria-label="Seções do perfil">
          <button :class="{ active: activeTab === 'welcome' }" @click="activeTab = 'welcome'">Visão geral</button>
          <button :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">Meu perfil</button>
        </nav>

        <div v-if="feedback" class="feedback" :class="{ success: feedbackIsSuccess }" role="status">
          {{ feedback }}
        </div>

        <section v-if="activeTab === 'welcome'" class="welcome-grid">
          <article class="welcome-card">
            <div class="welcome-card-copy">
              <p class="eyebrow">BEM-VINDO(A)</p>
              <h2>Que bom ter você aqui, {{ greetingName }}.</h2>
              <p>Seu perfil fica salvo na nuvem e pode ser atualizado sempre que precisar.</p>
              <ion-button class="primary-button" @click="openProfile">
                {{ hasProfile ? 'Editar meu perfil' : 'Completar meu perfil' }}
              </ion-button>
            </div>
            <div class="welcome-art" aria-hidden="true">
              <div class="art-orbit orbit-one" />
              <div class="art-orbit orbit-two" />
              <div class="art-avatar">{{ greetingName.charAt(0).toUpperCase() }}</div>
              <span class="art-star star-one">✦</span>
              <span class="art-star star-two">✦</span>
            </div>
          </article>

          <article class="info-card">
            <div class="section-title">
              <div>
                <p class="eyebrow">SEUS DADOS</p>
                <h2>Resumo do perfil</h2>
              </div>
              <span class="cloud-icon" aria-hidden="true">☁</span>
            </div>
            <div v-if="isLoadingProfile" class="loading-state">
              <ion-spinner name="crescent" />
              <span>Carregando perfil...</span>
            </div>
            <dl v-else class="profile-summary">
              <div>
                <dt>Nome</dt>
                <dd>{{ profile.name || 'Ainda não informado' }}</dd>
              </div>
              <div>
                <dt>Nickname</dt>
                <dd>{{ profile.nickname ? `@${profile.nickname}` : 'Ainda não informado' }}</dd>
              </div>
              <div>
                <dt>Data de nascimento</dt>
                <dd>{{ formattedBirthDate }}</dd>
              </div>
            </dl>
            <div class="storage-note">
              <span class="storage-check">✓</span>
              Perfil conectado ao Firebase
            </div>
          </article>
        </section>

        <section v-else class="profile-card">
          <div class="profile-card-heading">
            <div>
              <p class="eyebrow">INFORMAÇÕES PESSOAIS</p>
              <h2>Meu perfil</h2>
              <p>Seus dados são armazenados no Cloud Firestore e sua foto no Firebase Storage.</p>
            </div>
            <span class="secure-label"><span class="badge-dot" /> Sincronizado na nuvem</span>
          </div>

          <div v-if="isLoadingProfile" class="loading-state profile-loading">
            <ion-spinner name="crescent" />
            <span>Carregando perfil...</span>
          </div>

          <form v-else class="profile-form" @submit.prevent="saveProfile">
            <div class="avatar-editor">
              <div class="avatar-preview">
                <img v-if="avatarSrc" :src="avatarSrc" alt="Foto do perfil" />
                <span v-else>{{ (profile.name || greetingName).charAt(0).toUpperCase() }}</span>
              </div>
              <div class="avatar-description">
                <strong>Foto do perfil</strong>
                <span>JPG, PNG ou WEBP. Máximo de 5 MB.</span>
                <label class="upload-button">
                  Escolher foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Escolher foto do perfil"
                    @change="handlePhotoSelection"
                  />
                </label>
              </div>
            </div>

            <div class="fields-grid">
              <label class="form-field">
                <span>Nome completo</span>
                <input v-model="profile.name" type="text" autocomplete="name" maxlength="100" required />
              </label>
              <label class="form-field">
                <span>Nickname</span>
                <div class="nickname-input">
                  <span>@</span>
                  <input
                    v-model="profile.nickname"
                    type="text"
                    autocomplete="nickname"
                    maxlength="30"
                    placeholder="seu apelido"
                    required
                  />
                </div>
              </label>
              <label class="form-field">
                <span>Data de nascimento</span>
                <input v-model="profile.birthDate" type="date" :max="today" required />
              </label>
            </div>

            <div class="form-footer">
              <p>Ao salvar, suas informações serão atualizadas na sua conta.</p>
              <ion-button class="primary-button save-button" type="submit" :disabled="isSaving">
                <ion-spinner v-if="isSaving" name="crescent" />
                <span v-else>Salvar alterações</span>
              </ion-button>
            </div>
          </form>
        </section>

        <footer class="page-footer">Desenvolvido com Ionic, Vue.js, Capacitor e Firebase.</footer>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { IonButton, IonContent, IonHeader, IonPage, IonSpinner, IonToolbar } from '@ionic/vue';

import { auth, db, storage } from '../firebase';
import { firebaseErrorMessage } from '../firebaseErrors';

type Profile = {
  name: string;
  birthDate: string;
  nickname: string;
  photoURL: string;
};

const router = useRouter();
const activeTab = ref<'welcome' | 'profile'>('welcome');
const profile = reactive<Profile>({
  name: '',
  birthDate: '',
  nickname: '',
  photoURL: '',
});
const isLoadingProfile = ref(true);
const isSaving = ref(false);
const feedback = ref('');
const feedbackIsSuccess = ref(false);
const selectedPhoto = ref<File | null>(null);
const photoPreview = ref('');
const currentDate = new Date();
const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

const greetingName = computed(
  () =>
    profile.nickname ||
    profile.name ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split('@')[0] ||
    'por aqui',
);
const avatarSrc = computed(() => photoPreview.value || profile.photoURL);
const hasProfile = computed(() => Boolean(profile.name && profile.nickname && profile.birthDate));
const formattedBirthDate = computed(() => {
  if (!profile.birthDate) return 'Ainda não informado';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${profile.birthDate}T00:00:00Z`));
});

onMounted(loadProfile);
onBeforeUnmount(() => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
});

function openProfile() {
  feedback.value = '';
  activeTab.value = 'profile';
}

async function loadProfile() {
  const user = auth.currentUser;
  if (!user) {
    await router.replace('/auth');
    return;
  }

  try {
    const snapshot = await getDoc(doc(db, 'users', user.uid));
    if (snapshot.exists()) {
      const data = snapshot.data();
      profile.name = typeof data.name === 'string' ? data.name : '';
      profile.birthDate = typeof data.birthDate === 'string' ? data.birthDate : '';
      profile.nickname = typeof data.nickname === 'string' ? data.nickname : '';
      profile.photoURL = typeof data.photoURL === 'string' ? data.photoURL : '';
    }
  } catch (error) {
    feedback.value = firebaseErrorMessage(error);
  } finally {
    isLoadingProfile.value = false;
  }
}

function handlePhotoSelection(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.files?.length) return;

  const file = input.files[0];
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    feedback.value = 'Selecione uma imagem JPG, PNG ou WEBP.';
    feedbackIsSuccess.value = false;
    input.value = '';
    discardPhotoSelection();
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    feedback.value = 'A imagem deve ter no máximo 5 MB.';
    feedbackIsSuccess.value = false;
    input.value = '';
    discardPhotoSelection();
    return;
  }

  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  selectedPhoto.value = file;
  photoPreview.value = URL.createObjectURL(file);
  feedback.value = '';
}

function discardPhotoSelection() {
  selectedPhoto.value = null;
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoPreview.value = '';
}

async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    await router.replace('/auth');
    return;
  }

  const name = profile.name.trim();
  const nickname = profile.nickname.trim().replace(/^@+/, '');
  if (!name || !nickname || !profile.birthDate) {
    feedback.value = 'Preencha nome, nickname e data de nascimento.';
    feedbackIsSuccess.value = false;
    return;
  }

  isSaving.value = true;
  feedback.value = '';

  try {
    let photoURL = profile.photoURL;
    if (selectedPhoto.value) {
      const imageRef = storageRef(storage, `users/${user.uid}/profile`);
      const uploadedImage = await uploadBytes(imageRef, selectedPhoto.value, {
        contentType: selectedPhoto.value.type,
      });
      photoURL = await getDownloadURL(uploadedImage.ref);
    }

    await setDoc(
      doc(db, 'users', user.uid),
      {
        name,
        birthDate: profile.birthDate,
        nickname,
        photoURL,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    profile.name = name;
    profile.nickname = nickname;
    profile.photoURL = photoURL;
    selectedPhoto.value = null;
    if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
    photoPreview.value = '';
    feedback.value = 'Perfil salvo com sucesso.';
    feedbackIsSuccess.value = true;
  } catch (error) {
    feedback.value = firebaseErrorMessage(error);
    feedbackIsSuccess.value = false;
  } finally {
    isSaving.value = false;
  }
}

async function logout() {
  try {
    await signOut(auth);
    await router.replace('/auth');
  } catch (error) {
    feedback.value = firebaseErrorMessage(error);
    feedbackIsSuccess.value = false;
  }
}
</script>

<style scoped>
.app-header {
  box-shadow: 0 1px 0 #e9edf4;
}

.app-header ion-toolbar {
  --background: #fff;
  --min-height: 72px;
}

.toolbar-inner {
  display: flex;
  width: min(1120px, calc(100% - 48px));
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #23314b;
  font-size: 17px;
  font-weight: 750;
  text-decoration: none;
}

.brand-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 11px;
  background: #e5edfc;
  color: #3569cc;
  font-size: 18px;
}

.brand-light {
  color: #7d899c;
  font-weight: 500;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.account-email {
  color: #788398;
  font-size: 13px;
}

.logout-button {
  margin: 0;
  --color: #56657e;
  font-size: 13px;
  font-weight: 650;
}

.home-content {
  --background: #f5f7fb;
}

.page-container {
  width: min(1120px, calc(100% - 48px));
  min-height: 100%;
  margin: 0 auto;
  padding: 48px 0 28px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #6280b5;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.15em;
}

.page-heading h1 {
  margin: 0;
  color: #1d2b43;
  font-size: clamp(29px, 4vw, 40px);
  font-weight: 750;
  letter-spacing: -0.045em;
}

.page-heading h1 span {
  font-size: 0.78em;
}

.heading-copy {
  margin: 10px 0 0;
  color: #7b8698;
  font-size: 14px;
}

.welcome-badge,
.secure-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #dfe9e4;
  border-radius: 999px;
  background: #f8fcf9;
  color: #547563;
  font-size: 11px;
  white-space: nowrap;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38a56d;
}

.tabs {
  display: flex;
  gap: 25px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e9f1;
}

.tabs button {
  padding: 0 2px 13px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #8993a3;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}

.tabs button.active {
  border-bottom-color: #3d70d0;
  color: #315fae;
}

.feedback {
  margin: 0 0 17px;
  padding: 12px 15px;
  border: 1px solid #f3d9d6;
  border-radius: 10px;
  background: #fff8f7;
  color: #a43830;
  font-size: 13px;
}

.feedback.success {
  border-color: #d7eddf;
  background: #f5fbf7;
  color: #278150;
}

.welcome-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: 20px;
}

.welcome-card,
.info-card,
.profile-card {
  border: 1px solid #e8ecf3;
  border-radius: 19px;
  background: #fff;
  box-shadow: 0 12px 34px rgb(34 53 89 / 4%);
}

.welcome-card {
  position: relative;
  display: flex;
  min-height: 330px;
  overflow: hidden;
  align-items: center;
  padding: clamp(26px, 4vw, 43px);
  background: linear-gradient(120deg, #fff 30%, #eff5ff 100%);
}

.welcome-card-copy {
  z-index: 1;
  max-width: 390px;
}

.welcome-card h2,
.section-title h2,
.profile-card-heading h2 {
  margin: 0;
  color: #22314b;
  font-size: 24px;
  letter-spacing: -0.035em;
}

.welcome-card-copy > p:not(.eyebrow) {
  max-width: 330px;
  margin: 13px 0 22px;
  color: #788398;
  font-size: 13px;
  line-height: 1.65;
}

.primary-button {
  min-height: 43px;
  margin: 0;
  --background: #3569cc;
  --background-hover: #285ab8;
  --border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.welcome-art {
  position: absolute;
  top: 50%;
  right: 7%;
  width: 210px;
  height: 210px;
  transform: translateY(-50%);
}

.art-orbit {
  position: absolute;
  inset: 14px;
  border: 1px solid #cbd9f1;
  border-radius: 50%;
}

.orbit-two {
  inset: 37px;
  border-color: #dbe5f6;
}

.art-avatar {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 98px;
  height: 98px;
  place-items: center;
  border: 8px solid #fff;
  border-radius: 50%;
  background: linear-gradient(145deg, #dce8ff, #bfd2f4);
  box-shadow: 0 10px 30px rgb(49 84 145 / 16%);
  color: #3569cc;
  font-size: 36px;
  font-weight: 700;
  transform: translate(-50%, -50%);
}

.art-star {
  position: absolute;
  color: #7698d5;
}

.star-one {
  top: 16px;
  right: 48px;
  font-size: 23px;
}

.star-two {
  bottom: 30px;
  left: 17px;
  font-size: 15px;
}

.info-card {
  padding: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 21px;
  border-bottom: 1px solid #edf0f5;
}

.section-title h2 {
  font-size: 18px;
}

.cloud-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  background: #edf3ff;
  color: #4775c8;
  font-size: 23px;
}

.profile-summary {
  margin: 0;
}

.profile-summary > div {
  padding: 15px 0;
  border-bottom: 1px solid #f0f2f6;
}

.profile-summary dt {
  margin-bottom: 5px;
  color: #8a94a5;
  font-size: 11px;
}

.profile-summary dd {
  overflow: hidden;
  margin: 0;
  color: #35435c;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
}

.storage-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: #64806f;
  font-size: 11px;
}

.storage-check {
  display: grid;
  width: 19px;
  height: 19px;
  place-items: center;
  border-radius: 50%;
  background: #e9f6ed;
  color: #338657;
}

.loading-state {
  display: flex;
  min-height: 160px;
  align-items: center;
  justify-content: center;
  gap: 11px;
  color: #7b8698;
  font-size: 13px;
}

.profile-card {
  padding: clamp(24px, 4vw, 38px);
}

.profile-card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 27px;
  border-bottom: 1px solid #edf0f5;
}

.profile-card-heading h2 {
  font-size: 24px;
}

.profile-card-heading > div > p:last-child {
  margin: 9px 0 0;
  color: #7b8698;
  font-size: 13px;
  line-height: 1.6;
}

.profile-loading {
  min-height: 280px;
}

.profile-form {
  padding-top: 28px;
}

.avatar-editor {
  display: flex;
  align-items: center;
  gap: 17px;
  margin-bottom: 34px;
}

.avatar-preview {
  display: grid;
  width: 82px;
  height: 82px;
  overflow: hidden;
  place-items: center;
  border: 4px solid #f0f4fb;
  border-radius: 50%;
  background: #e3ecfc;
  color: #3569cc;
  font-size: 28px;
  font-weight: 700;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-description {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.avatar-description strong {
  color: #36445d;
  font-size: 13px;
}

.avatar-description > span {
  color: #8993a3;
  font-size: 11px;
}

.upload-button {
  position: relative;
  overflow: hidden;
  margin-top: 4px;
  padding: 7px 10px;
  border: 1px solid #dbe4f3;
  border-radius: 8px;
  color: #3569cc;
  cursor: pointer;
  font-size: 11px;
  font-weight: 650;
}

.upload-button input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  opacity: 0;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 18px;
}

.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  color: #3b4962;
  font-size: 12px;
  font-weight: 650;
}

.form-field input {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 0 13px;
  border: 1px solid #e1e6ef;
  border-radius: 9px;
  outline: none;
  background: #fcfdff;
  color: #33425c;
  font: inherit;
  font-size: 13px;
  font-weight: 400;
}

.form-field input:focus {
  border-color: #7fa2e2;
  box-shadow: 0 0 0 3px rgb(78 124 206 / 11%);
}

.nickname-input {
  display: flex;
  min-height: 46px;
  align-items: center;
  padding-left: 13px;
  border: 1px solid #e1e6ef;
  border-radius: 9px;
  background: #fcfdff;
  color: #8995a8;
  font-size: 13px;
  font-weight: 500;
}

.nickname-input:focus-within {
  border-color: #7fa2e2;
  box-shadow: 0 0 0 3px rgb(78 124 206 / 11%);
}

.nickname-input input {
  min-height: 44px;
  border: 0;
  box-shadow: none;
  background: transparent;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 30px;
  padding-top: 23px;
  border-top: 1px solid #edf0f5;
}

.form-footer p {
  margin: 0;
  color: #8993a3;
  font-size: 11px;
}

.save-button {
  min-width: 155px;
}

.save-button ion-spinner {
  width: 18px;
  height: 18px;
}

.page-footer {
  margin-top: 30px;
  color: #a0a8b5;
  font-size: 11px;
  text-align: center;
}

@media (max-width: 780px) {
  .page-container,
  .toolbar-inner {
    width: calc(100% - 32px);
  }

  .welcome-grid {
    grid-template-columns: 1fr;
  }

  .welcome-card {
    min-height: 300px;
  }

  .welcome-art {
    right: -40px;
    opacity: 0.6;
  }

  .welcome-card-copy {
    max-width: 75%;
  }

  .profile-card-heading {
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .app-header ion-toolbar {
    --min-height: 62px;
  }

  .account-email {
    display: none;
  }

  .page-container {
    padding-top: 32px;
  }

  .page-heading {
    align-items: flex-start;
  }

  .welcome-badge {
    padding: 8px;
    font-size: 0;
  }

  .welcome-card {
    min-height: 330px;
    align-items: flex-start;
  }

  .welcome-card-copy {
    max-width: 100%;
  }

  .welcome-art {
    top: auto;
    right: -33px;
    bottom: -82px;
    transform: none;
  }

  .fields-grid {
    grid-template-columns: 1fr;
  }

  .form-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .save-button {
    width: 100%;
    margin: 0;
  }
}
</style>
