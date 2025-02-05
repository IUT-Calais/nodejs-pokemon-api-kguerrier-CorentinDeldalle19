import express, {Request, Response} from 'express';
import { PrismaClient } from "@prisma/client";

export const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(express.json());

export const server = app.listen(port);

export function stopServer() {
  server.close();
}

// Récupérer tous les pokemons
app.get('/pokemons-cards', async (req: Request, res: Response) => {
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
app.get('/pokemons-cards/:id', async (req: Request, res: Response) => {
  try {
    const pokemon = await prisma.pokemonCard.findUnique(
      {
        where: {
          id: Number(req.params)
        }
      }
    )
    res.json(pokemon)
  } catch (error){
    res.status(500).json('Erreur')
  }
})

// Créer un nouveau pokémon
app.post("/pokemons-cards", async (req: Request, res: Response) => {
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
app.patch("/pokemons-cards/:id", async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
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

app.delete("/pokemons-cards/:id", async (req: Request, res: Response) => {
  // On vérifie si le pokemon existe
  const existingPokemon = await prisma.pokemonCard.findUnique({
    where: {
      id: Number(req.params)
    }
  })
  if(!existingPokemon){
    return res.status(404).json({error: "Le pokemon n'existe pas"})
  }

  await prisma.pokemonCard.delete({
    where: {
      id: Number(req.params)
    }
  })

  res.status(200).json("Le pokemon a été supprimé")
})