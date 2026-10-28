import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/invalid-email': 'Informe um endereço de e-mail válido.',
  'auth/invalid-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento antes de tentar novamente.',
  'auth/user-not-found': 'Não existe uma conta com este e-mail.',
  'auth/weak-password': 'Escolha uma senha com pelo menos 6 caracteres.',
  'auth/wrong-password': 'E-mail ou senha inválidos.',
  'storage/unauthorized': 'Sem permissão para enviar a foto. Verifique as regras do Firebase Storage.',
};

export function firebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return messages[error.code] ?? 'Não foi possível concluir a operação. Tente novamente.';
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}
