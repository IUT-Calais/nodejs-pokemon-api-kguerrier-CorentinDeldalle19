const express = require('express');
const router = express.Router();
import { PrismaClient } from "@prisma/client";
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Récupérer tous les pokemons
router.get('/pokemons-cards/', async (_req: Request, res: Response) => {
  try {
    const pokemonCards = await prisma.pokemonCard.findMany(
      {
        include : { type: true }
      }
    )
    res.json(pokemonCards)
  } catch (error){
    res.status(500).json('Erreur')
  }
})

// Récupérer un pokemon spécifique
router.get('/pokemons-cards/:id', async (_req: Request, res: Response) => {
  try {
    const pokemon = await prisma.pokemonCard.findUnique(
      {
        where: {
          id: Number(_req.params.id)
        }
      }
    )
    res.json(pokemon)
  } catch (error){
    res.status(500).json('Erreur')
  }
})

router.post('/pokemons-cards', async (req: Request, res: Response) => {
  const { name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;

  // Vérification des champs obligatoires
  if (!name || !pokedexId || !type || !lifePoints) {
    return res.status(400).json({ error: "Tous les champs doivent être remplis" });
  }

  // Vérifier si le type existe par son `name`, sinon le créer
  let existingType = await prisma.type.findUnique({
    where: { name: type },
  });

  if (!existingType) {
    existingType = await prisma.type.create({
      data: { name: type },
    });
  }

  // Vérifier si le Pokémon existe déjà
  const existingPokemon = await prisma.pokemonCard.findFirst({
    where: { OR: [{ name }, { pokedexId }] },
  });

  if (existingPokemon) {
    return res.status(200).json({ error: "Le Pokémon existe déjà" });
  }

  // Créer le Pokémon avec le `typeId` du type existant ou nouvellement créé
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

  return res.status(201).json(newPokemon);
}); 

// Modifier une carte pokémon
router.patch('/pokemons-cards/:id', async (_req: Request, res: Response) => {
  const pokemonCardId = Number(_req.params.id);
  const {id, name, pokedexId, type, lifePoints, size, weight, imageUrl} = _req.body;

  // On vérifie que le pokémon existe
  const existingPokemon = await prisma.pokemonCard.findUnique(
    {
      where: {
        id: Number(pokemonCardId)
      }
    }
  )
  if(!existingPokemon){
    return res.status(404).json({error: "Le pokemon n'existe pas"})
  }

  // On vérifie que le type existe
  if(type){
    const typeExists = await prisma.type.findUnique(
      {
        where: {
          id: type
        }
      }
    )
    if (!typeExists){
      return res.status(400).json({ error: "Le type n'existe pas"})
    }
  }

  // On vérifie qu'un autre pokemon ne possède pas le même nom ou pokedexId
  if (name || pokedexId){
    const pokemon = await prisma.pokemonCard.findFirst(
      {
        where: {
          OR: [{name}, {pokedexId}],
          NOT: {id: Number(pokemonCardId)}
        }
      }
    )
    if(pokemon){
      return res.status(400).json({ error: "Un autre Pokémon possède déjà ce nom ou cet pokedexId" });
    }
  }

  const updatedPokemon = await prisma.pokemonCard.update({
    where: { id: Number(pokemonCardId) },
    data: { name, pokedexId, typeId: type, lifePoints, size, weight, imageUrl },
  });

  res.status(200).json(updatedPokemon);
})

router.delete('/pokemons-cards/:id', async (_req: Request, res: Response) => {
  // On vérifie si le pokemon existe
  const existingPokemon = await prisma.pokemonCard.findUnique({
    where: {
      id: Number(_req.params.id)
    }
  })
  if(!existingPokemon){
    return res.status(404).json({error: "Le pokemon n'existe pas"})
  }

  await prisma.pokemonCard.delete({
    where: {
      id: Number(_req.params.id)
    }
  })

  res.status(200).json("Le pokemon a été supprimé")
})

module.exports = router;