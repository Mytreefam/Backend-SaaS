import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await AuthService.login({
      email,
      password,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
    if (!result) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Set refresh token cookie (httpOnly)
    res.cookie('refresh_token', result.refreshToken, result.refreshCookieOptions);

    return res.json({
      id: result.user.id,
      nombre: result.user.nombre,
      email: result.user.email,
      role: result.user.role,
      token: result.accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error en login' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const result = await AuthService.refresh({
      refreshToken: token,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.cookie('refresh_token', result.refreshToken, result.refreshCookieOptions);
    return res.json({ token: result.accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await AuthService.logout({ refreshToken: token });
    }
  } finally {
    // Clear cookie regardless
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
    });
    return res.status(200).json({ ok: true });
  }
};
