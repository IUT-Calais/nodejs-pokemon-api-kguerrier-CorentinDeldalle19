import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pokemonCardsRoutes from './routes/pokemonCards';
import usersRoutes from './routes/users'

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use('/api', pokemonCardsRoutes);
app.use('/api', usersRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
