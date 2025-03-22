from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app, origins=["*"])

MONGO_URI = "mongodb+srv://admin:1234@cluster0.1w4mept.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["pokemon"]
collection = db.pokemonLista2

@app.route("/pokemon/<nombre>", methods=["GET"])
def get_pokemon_by_name(nombre):
    try:
        # Hacer búsqueda insensible a mayúsculas y minúsculas
        pokemon = collection.find_one(
            {"nombrePokemon": {"$regex": f"^{nombre}$", "$options": "i"}},
            {"_id": 0}
        )
        if pokemon:
            return jsonify(pokemon), 200
        else:
            pokemon_list = list(collection.find({}, {"_id": 0, "nombrePokemon": 1}))
            return jsonify({"error": "Pokémon no encontrado", "availablePokemons": pokemon_list}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Ruta adicional para obtener todos los Pokémon
@app.route("/pokemon/list", methods=["GET"])
def get_all_pokemon():
    try:
        pokemon_list = list(collection.find({}, {"_id": 0, "nombrePokemon": 1}))
        return jsonify(pokemon_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
