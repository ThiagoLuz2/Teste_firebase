# Firebase Perfil

Aplicação móvel/web de demonstração criada com Ionic Framework, Vue.js, Capacitor e Firebase. O projeto implementa autenticação por e-mail e senha, recuperação de senha, uma área de boas-vindas e edição de perfil com foto.

## Pesquisa prática: conceitos e arquitetura

- **Ionic Framework** fornece componentes de interface adaptáveis e navegação com aparência nativa.
- **Vue.js 3** organiza as telas em componentes e controla formulários, estado e apresentação reativa.
- **Capacitor** empacota a aplicação web em um WebView e permite gerar projetos Android e iOS. A interface de upload usa o seletor de arquivos do navegador/WebView, sem plugin nativo adicional.
- **Firebase Authentication** cria e autentica contas com e-mail e senha e envia o link de redefinição.
- **Cloud Firestore** guarda os dados do perfil em `users/{uid}`. O UID do usuário autenticado também identifica o documento.
- **Firebase Storage** recebe a foto em `users/{uid}/profile`; o endereço de download é guardado junto ao perfil no Firestore e no perfil do Authentication.

O fluxo é: a tela de autenticação conversa com o Firebase Authentication; o roteador protege `/home` e aguarda a restauração da sessão; a área logada lê e grava o documento privado no Firestore e, quando há uma nova foto, envia o arquivo ao Storage. As regras em `firestore.rules` e `storage.rules` limitam o acesso direto ao proprietário autenticado. O endereço retornado por `getDownloadURL` inclui um token de acesso: trate-o como compartilhável por quem o possuir, não como um endereço privado.

## Configuração do Firebase

1. No Firebase Console, crie/seleciona um projeto e cadastre um aplicativo Web.
2. Ative **Authentication → Sign-in method → E-mail/senha**.
3. Crie o banco **Cloud Firestore** e habilite o **Storage**.
4. Copie `.env.example` para `.env.local` e preencha as configurações do aplicativo Web (`VITE_FIREBASE_*`). Essas configurações são obrigatórias e não ficam hardcoded no código versionado.
5. Publique as regras do projeto a partir da raiz:

   ```powershell
   firebase login
   firebase deploy --only firestore:rules,storage
   ```

   O Firebase CLI também requer que o projeto correto esteja selecionado (`firebase use --add`). Não deixe regras abertas de leitura/escrita em produção.

## Executar na web

```powershell
npm install
npm run dev
```

Para validar e gerar os arquivos web:

```powershell
npm run build
npm run test:unit
npm run test:e2e
```

## Executar em dispositivos

O projeto Android já está incluído na pasta `android/`. Abra-o no Android Studio com `npm run cap:open:android`. O build nativo para iOS exige macOS e Xcode.

```powershell
npm run cap:sync
```

No Android Studio, aguarde a sincronização do Gradle, selecione um emulador ou dispositivo conectado e pressione **Run**. Também é possível gerar o APK debug no terminal:

```powershell
cd android
.\gradlew.bat assembleDebug
```

O APK será salvo em `android/app/build/outputs/apk/debug/app-debug.apk`. Depois de mudanças na aplicação web, execute `npm run cap:sync` antes de abrir ou compilar o projeto nativo. O Android Studio usa o JDK embutido; para compilar pelo terminal, configure `JAVA_HOME` para o JDK incluído na instalação do Android Studio.

## Estrutura principal

- `src/views/AuthPage.vue`: login, cadastro e recuperação de senha.
- `src/views/HomePage.vue`: boas-vindas, resumo e edição do perfil.
- `src/firebase.ts`: inicialização do Firebase e restauração da sessão.
- `src/router/index.ts`: rotas públicas e proteção da área autenticada.
- `firestore.rules` / `storage.rules`: regras de acesso por UID e validação de uploads.
- `capacitor.config.ts`: configuração do aplicativo nativo.

As configurações `VITE_FIREBASE_*` são incluídas no aplicativo cliente. A chave de API Web do Firebase identifica o projeto, mas não substitui regras de segurança: mantenha as regras restritas e configure as cotas/restrições da chave no Google Cloud quando aplicável.
