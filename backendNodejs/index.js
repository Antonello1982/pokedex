const http = require("http");
const { MongoClient } = require("mongodb");
const url = require("url");

const MONGO_URI = "mongodb+srv://admin:1234@cluster0.1w4mept.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(MONGO_URI);
let collection;

async function connectDB() {
  await client.connect();
  collection = client.db("pokemon").collection("pokemonLista1");
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (method === "GET" && path.startsWith("/pokemon/")) {
    const pokemonName = decodeURIComponent(path.split("/")[2]);
    try {
      const pokemon = await collection.findOne({ nombrePokemon: pokemonName }, { projection: { _id: 0 } });

      if (pokemon) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(pokemon));
      } else {
        const pokemonList = await collection.find({}, { projection: { _id: 0, nombrePokemon: 1 } }).toArray();
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Pokémon no encontrado", availablePokemons: pokemonList }));
      }
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // ✅ Nueva ruta para devolver la lista de Pokémon cuando se solicita `/pokemon/list`
  if (method === "GET" && path === "/pokemon/list") {
    try {
      const pokemonList = await collection.find({}, { projection: { _id: 0, nombrePokemon: 1 } }).toArray();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(pokemonList));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

connectDB().then(() => {
  server.listen(3000, "0.0.0.0", () => {
    console.log("Servidor Node.js corriendo en http://localhost:3000");
  });
});
