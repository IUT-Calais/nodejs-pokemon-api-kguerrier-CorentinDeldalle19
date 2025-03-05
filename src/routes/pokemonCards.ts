import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Récupérer tous les pokemons
router.get('/pokemons-cards/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pokemonCards = await prisma.pokemonCard.findMany({
      include: { type: true }
    });
    res.json(pokemonCards);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des cartes Pokémon' });
  }
});

// Récupérer un pokemon spécifique
router.get('/pokemons-cards/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const pokemon = await prisma.pokemonCard.findUnique({
      where: { id: Number(req.params.id) },
      include: { type: true }
    });

    if (!pokemon) {
      res.status(404).json({ error: 'Pokémon non trouvé' });
      return;
    }

    res.json(pokemon);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du Pokémon' });
  }
});

// Créer une nouvelle carte pokémon
router.post('/pokemons-cards', async (req: Request, res: Response): Promise<void> => {
  const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;

  if (!name || !pokedexId || !type || !lifePoints) {
    res.status(400).json({ error: "Tous les champs doivent être remplis" });
    return;
  }

  try {
    let existingType = await prisma.type.findUnique({
      where: { name: String(type) },
    });

    if (!existingType) {
      existingType = await prisma.type.create({
        data: { name: String(type) },
      });
    }

    const existingPokemon = await prisma.pokemonCard.findFirst({
      where: { OR: [{ name }, { pokedexId }] },
    });

    if (existingPokemon) {
      res.status(400).json({ error: "Le Pokémon existe déjà" });
      return;
    }

    const newPokemon = await prisma.pokemonCard.create({
      data: {
        name,
        pokedexId,
        typeId: existingType.id,
        lifePoints,
        size,
        weight,
        imageUrl,
      },
    });

    res.status(201).json(newPokemon);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du Pokémon" });
  }
});

// Modifier une carte pokémon
router.patch('/pokemons-cards/:id', async (req: Request, res: Response): Promise<void> => {
  const pokemonCardId = Number(req.params.id);
  const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;

  try {
    const existingPokemon = await prisma.pokemonCard.findUnique({
      where: { id: pokemonCardId },
    });

    if (!existingPokemon) {
      res.status(404).json({ error: "Le Pokémon n'existe pas" });
      return;
    }

    let typeId = existingPokemon.typeId;

    if (type) {
      const typeExists = await prisma.type.findUnique({
        where: { name: String(type) },
      });

      if (!typeExists) {
        res.status(400).json({ error: "Le type n'existe pas" });
        return;
      }

      typeId = typeExists.id;
    }

    const duplicatePokemon = await prisma.pokemonCard.findFirst({
      where: {
        OR: [{ name }, { pokedexId }],
        NOT: { id: pokemonCardId },
      },
    });

    if (duplicatePokemon) {
      res.status(400).json({ error: "Un autre Pokémon possède déjà ce nom ou ce Pokedex ID" });
      return;
    }

    const updatedPokemon = await prisma.pokemonCard.update({
      where: { id: pokemonCardId },
      data: { name, pokedexId, typeId, lifePoints, size, weight, imageUrl },
    });

    res.status(200).json(updatedPokemon);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du Pokémon" });
  }
});

// Supprimer une carte pokémon
router.delete('/pokemons-cards/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const existingPokemon = await prisma.pokemonCard.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!existingPokemon) {
      res.status(404).json({ error: "Le Pokémon n'existe pas" });
      return;
    }

    await prisma.pokemonCard.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(200).json({ message: "Le Pokémon a été supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du Pokémon" });
  }
});

export default router;