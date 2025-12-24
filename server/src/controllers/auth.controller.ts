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
    const cliente = await AuthService.login(email, password);
    if (!cliente) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Puedes agregar JWT aquí si lo necesitas
    return res.json({
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      role: cliente.role
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error en login' });
  }
};
