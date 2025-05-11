import { getAuth } from 'firebase-admin/auth';

/**
 * Middleware que valida o ID token JWT enviado no header Authorization.
 * Só permite acesso à rota se o token for válido e decodificado com sucesso.
 */
export async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }
}

/**
 * Função utilitária (opcional) para verificar o token fora do middleware.
 */
export async function validarToken(token) {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (err) {
    throw new Error('Token inválido ou expirado');
  }
}
