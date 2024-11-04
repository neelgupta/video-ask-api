// swagger/authDocs.js
/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Signup
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: ""
 *               password:
 *                 type: string
 *                 default: ""
 *               first_name:
 *                 type: string
 *                 default: ""
 *               last_name:
 *                 type: string
 *                 default: ""
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Registered successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ODYzZGRiNmYyMWMyZTcxZjgwNTAyNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzIwMDczNjkyfQ.rdxJvQDjObSvQoTMRT20DSq20RGwOOJ7V4fDKc59IAI"
 * @swagger
 * /api/v1/auth/signing:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: ""
 *               password:
 *                 type: string
 *                 default: ""
 *     responses:
 *       200:
 *         description: User login successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "user"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ODYzZGRiNmYyMWMyZTcxZjgwNTAyNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzIwMDczNjkyfQ.rdxJvQDjObSvQoTMRT20DSq20RGwOOJ7V4fDKc59IAI"
 * @swagger
 * /api/v1/auth/admin-signing:
 *   post:
 *     summary: Admin Login
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: ""
 *               password:
 *                 type: string
 *                 default: ""
 *     responses:
 *       200:
 *         description: Admin login successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Login successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ODYzZGRiNmYyMWMyZTcxZjgwNTAyNCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzIwMDczNjkyfQ.rdxJvQDjObSvQoTMRT20DSq20RGwOOJ7V4fDKc59IAI"
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Forgot
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 default: ""
 *     responses:
 *       200:
 *         description: Admin login successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Please check your mail and click on the link to reset your password"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 default: ""
 *               resetPasswordToken:
 *                 type: string
 *                 default: ""
 *     responses:
 *       200:
 *         description: Password reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Password Reset successfully.."
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
*/ 