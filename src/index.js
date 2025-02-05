"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
exports.stopServer = stopServer;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
exports.app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const prisma = new client_1.PrismaClient();
exports.app.use(express_1.default.json());
exports.server = exports.app.listen(port);
function stopServer() {
    exports.server.close();
}
// Récupérer tous les pokemons
exports.app.get('/pokemons-cards', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pokemonCards = yield prisma.pokemonCard.findMany({
            include: { type: true }
        });
        res.json(pokemonCards);
    }
    catch (error) {
        res.status(500).json('Erreur');
    }
}));
// Récupérer un pokemon spécifique
exports.app.get('/pokemons-cards/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pokemon = yield prisma.pokemonCard.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });
        res.json(pokemon);
    }
    catch (error) {
        res.status(500).json('Erreur');
    }
}));
// Créer un nouveau pokémon
exports.app.post("/pokemons-cards", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
    // On vérifie que tous les champs soient remplis
    if (!name || !pokedexId || !type || !lifePoints) {
        return res.status(400).json('Tous les champs doivent être remplis');
    }
    // On vérifie que le type existe
    const typeExists = yield prisma.type.findUnique({
        where: {
            id: type
        }
    });
    if (!typeExists) {
        return res.status(400).json("Le type n'existe pas");
    }
    // On vérifie que le pokémon existe
    const existingPokemon = yield prisma.pokemonCard.findFirst({
        where: {
            OR: [{ id }, { pokedexId }]
        }
    });
    if (existingPokemon) {
        return res.status(400).json("Le pokemon existe déjà");
    }
    // On crée le nouveau pokémon
    const newPokemon = yield prisma.pokemonCard.create({
        data: { name, pokedexId, typeId: type, lifePoints, size, weight, imageUrl }
    });
    res.status(201).json(newPokemon);
}));
// Modifier une carte pokémon
exports.app.patch("/pokemons-cards/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pokemonCardId = Number(req.params.id);
    const { id, name, pokedexId, type, lifePoints, size, weight, imageUrl } = req.body;
    // On vérifie que le pokémon existe
    const existingPokemon = yield prisma.pokemonCard.findUnique({
        where: {
            id: Number(pokemonCardId)
        }
    });
    if (!existingPokemon) {
        return res.status(404).json({ error: "Le pokemon n'existe pas" });
    }
    // On vérifie que le type existe
    if (type) {
        const typeExists = yield prisma.type.findUnique({
            where: {
                id: type
            }
        });
        if (!typeExists) {
            return res.status(400).json({ error: "Le type n'existe pas" });
        }
    }
    // On vérifie qu'un autre pokemon ne possède pas le même nom ou pokedexId
    if (name || pokedexId) {
        const pokemon = yield prisma.pokemonCard.findFirst({
            where: {
                OR: [{ name }, { pokedexId }],
                NOT: { id: Number(pokemonCardId) }
            }
        });
        if (pokemon) {
            return res.status(400).json({ error: "Un autre Pokémon possède déjà ce nom ou cet pokedexId" });
        }
    }
    const updatedPokemon = yield prisma.pokemonCard.update({
        where: { id: Number(pokemonCardId) },
        data: { name, pokedexId, typeId: type, lifePoints, size, weight, imageUrl },
    });
    res.status(200).json(updatedPokemon);
}));
exports.app.delete("/pokemons-cards/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // On vérifie si le pokemon existe
    const existingPokemon = yield prisma.pokemonCard.findUnique({
        where: {
            id: Number(req.params.id)
        }
    });
    if (!existingPokemon) {
        return res.status(404).json({ error: "Le pokemon n'existe pas" });
    }
    yield prisma.pokemonCard.delete({
        where: {
            id: Number(req.params.id)
        }
    });
    res.status(200).json("Le pokemon a été supprimé");
}));
