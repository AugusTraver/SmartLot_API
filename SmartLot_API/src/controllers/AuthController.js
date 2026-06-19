import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../services/supabaseAdminClient.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';

const router = Router();
const repo = new UsuarioRepository();

function throwError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/+$/, '') || 'http://localhost:5173';
const SUPABASE_PROJECT_URL = process.env.SUPABASE_URL;

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const REFRESH_COOKIE_OPTIONS = {
  ...AUTH_COOKIE_OPTIONS,
  path: '/api/usuario/refresh',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function setAuthCookies(res, accessToken, refreshSessionId) {
  res.cookie('access_token', accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_session_id', refreshSessionId, REFRESH_COOKIE_OPTIONS);
}

function signTokens(usuario) {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    id_rol: usuario.id_rol,
    id_empresa: usuario.id_empresa,
    id_sede: usuario.id_sede,
    token_version: usuario.token_version,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(
    { id: usuario.id, token_version: usuario.token_version, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' },
  );

  return { accessToken, refreshToken };
}

async function createSession(usuario) {
  const { refreshToken } = signTokens(usuario);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sessionId = await repo.createSessionAsync(
    usuario.id,
    usuario.token_version,
    refreshToken,
    expiresAt
  );
  return { sessionId, accessToken: jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      id_rol: usuario.id_rol,
      id_empresa: usuario.id_empresa,
      id_sede: usuario.id_sede,
      token_version: usuario.token_version,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
  ) };
}

router.get('/google', (req, res) => {
  const redirectTo = `${FRONTEND_URL}/auth/callback`;

  const authUrl =
    `${SUPABASE_PROJECT_URL}/auth/v1/authorize` +
    `?provider=google` +
    `&redirect_to=${encodeURIComponent(redirectTo)}` +
    `&scopes=openid+email+profile`;

  res.json({ url: authUrl });
});

router.post('/google/callback', async (req, res, next) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      throwError('El token de acceso es requerido.', 400);
    }

    const { data, error } = await supabaseAdmin.auth.getUser(access_token);

    if (error || !data?.user) {
      console.error('[Google Auth] supabaseAdmin.auth.getUser failed:', error?.message);
      throwError('Token de Google inválido o expirado.', 401);
    }

    const googleEmail = data.user.email || data.user.user_metadata?.email;

    if (!googleEmail) {
      throwError('No se pudo obtener el email de la cuenta de Google.', 400);
    }

    const usuario = await repo.getByEmailAsync(googleEmail);

    if (!usuario) {
      throwError('No existe una cuenta con este email.', 401);
    }

    if (usuario.activo === false) {
      throwError('Cuenta desactivada.', 403);
    }

    const { sessionId, accessToken } = await createSession(usuario);

    setAuthCookies(res, accessToken, sessionId);

    const { contraseña, ...usuarioSinContraseña } = usuario;

    res.status(200).json({
      usuario: usuarioSinContraseña,
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
