const express = require('express');
const router = express.Router();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Récupérer tous les pokemons
router.get('/pokemons-cards/', async (req, res) => {
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
router.get('/pokemons-cards/:id', async (req, res) => {
  try {
    const pokemon = await prisma.pokemonCard.findUnique(
      {
        where: {
          id: Number(req.params.id)
        }
      }
    )
    res.json(pokemon)
  } catch (error){
    res.status(500).json('Erreur')
  }
})

// Créer un nouveau pokémon
router.post('/pokemons-cards', async (req, res) => {
  const {id, name, pokedexId, type, lifePoints, size, weight, imageUrl} = req.body;

  // On vérifie que tous les champs soient remplis
  if (!name || !pokedexId || !type || !lifePoints){
    return res.status(400).json('Tous les champs doivent être remplis')
  }

  // On vérifie que le type existe
  const typeExists = await prisma.type.findUnique(
    {
      where: {
        id: type
      }
    }
  )
  if (!typeExists){
    return res.status(400).json("Le type n'existe pas")
  }

  // On vérifie que le pokémon existe
  const existingPokemon = await prisma.pokemonCard.findFirst(
    {
      where: {
        OR: [{id}, {pokedexId}]
      }
    }
  )
  if(existingPokemon){
    return res.status(400).json("Le pokemon existe déjà")
  }

  // On crée le nouveau pokémon
  const newPokemon = await prisma.pokemonCard.create(
    {
      data: {name, pokedexId, typeId: type, lifePoints, size, weight, imageUrl}
    }
  )
  res.status(201).json(newPokemon);
})

// Modifier une carte pokémon
router.patch('/pokemons-cards/:id', async (req, res) => {
  const pokemonCardId = Number(req.params.id);
  const {id, name, pokedexId, type, lifePoints, size, weight, imageUrl} = req.body;

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

router.delete('/pokemons-cards/:id', async (req, res) => {
  // On vérifie si le pokemon existe
  const existingPokemon = await prisma.pokemonCard.findUnique({
    where: {
      id: Number(req.params.id)
    }
  })
  if(!existingPokemon){
    return res.status(404).json({error: "Le pokemon n'existe pas"})
  }

  await prisma.pokemonCard.delete({
    where: {
      id: Number(req.params.id)
    }
  })

  res.status(200).json("Le pokemon a été supprimé")
})

module.exports = router;