import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();
const prisma = new PrismaClient();

// Créer un utilisateur
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Vérification des champs obligatoires
  if (!email || !password) {
    res.status(400).json({ error: 'Tous les champs doivent être remplis' });
    return;
  }

  try {
    // Normalisation de l'email
    const normalizedEmail = String(email).toLowerCase();

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(400).json({ error: "L'email est déjà utilisé" });
      return;
    }

    // Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: { email: normalizedEmail, password: hashedPassword },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Se connecter
router.post('/users/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Vérification des champs obligatoires
  if (!email || !password) {
    res.status(400).json({ error: 'Tous les champs doivent être remplis' });
    return;
  }

  try {
    // Normalisation de l'email
    const normalizedEmail = String(email).toLowerCase();

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: 'Mot de passe incorrect' });
      return;
    }

    // Vérifier que la clé JWT_SECRET est bien définie
    if (!process.env.JWT_SECRET) {
      console.error('Erreur: La clé JWT_SECRET est manquante dans les variables d\'environnement.');
      res.status(500).json({ error: 'Erreur interne du serveur' });
      return;
    }

    // Définir une expiration par défaut si non définie dans les variables d'environnement
    const expiresIn = process.env.JWT_EXPIRATION || '1h';

    // Créer le JWT
    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

export default router;