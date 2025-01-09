import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import { useState } from "react";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

async function geocodeCEP(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await response.json();
  if (data.erro) throw new Error("CEP não encontrado!");

  const address = `${data.logradouro}, ${data.localidade}, ${data.uf}`;
  const responseGeo = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`
  );
  const geoData = await responseGeo.json();
  if (geoData.length === 0)
    throw new Error("Coordenadas não encontradas para o CEP informado!");

  return [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
}

function Routing({ start, end }) {
  const map = useMap();

  useState(() => {
    if (!start || !end) return;
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: true,
    }).addTo(map);
    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
}

function ZoomControls() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div
      style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000 }}
    >
      <button
        onClick={handleZoomIn}
        style={{
          padding: "10px",
          marginBottom: "5px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        style={{
          padding: "10px",
          backgroundColor: "#F44336",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        -
      </button>
    </div>
  );
}

function LocateUser() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <button
      onClick={handleLocate}
      style={{
        position: "absolute",
        bottom: "10px",
        right: "10px",
        zIndex: 1000,
        padding: "10px",
        backgroundColor: "#2196F3",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Localizar Me
    </button>
  );
}

function App() {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [startCEP, setStartCEP] = useState("");
  const [endCEP, setEndCEP] = useState("");
  const [favorites, setFavorites] = useState([]);

  const handleCreateRoute = async () => {
    try {
      const startCoords = await geocodeCEP(startCEP);
      const endCoords = await geocodeCEP(endCEP);
      setStart(startCoords);
      setEnd(endCoords);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddToFavorites = () => {
    if (start && end) {
      setFavorites([...favorites, { startCEP, endCEP, start, end }]);
      alert("Rota adicionada aos favoritos!");
    } else {
      alert("Crie uma rota antes de adicionar aos favoritos.");
    }
  };

  const handleLoadFavorite = (favorite) => {
    setStart(favorite.start);
    setEnd(favorite.end);
    setStartCEP(favorite.startCEP);
    setEndCEP(favorite.endCEP);
  };

  const handleReset = () => {
    setStart(null);
    setEnd(null);
    setStartCEP("");
    setEndCEP("");
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#4CAF50" }}>Mapa de Rotas</h1>
        <p style={{ color: "#666" }}>
          Encontre a melhor rota inserindo os CEPs abaixo:
        </p>
      </header>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>
          <strong>CEP Inicial:</strong>
          <input
            type="text"
            value={startCEP}
            onChange={(e) => setStartCEP(e.target.value)}
            placeholder="Ex.: 01001-000"
            style={{
              marginLeft: "10px",
              padding: "10px",
              width: "300px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
          <strong>CEP Final:</strong>
          <input
            type="text"
            value={endCEP}
            onChange={(e) => setEndCEP(e.target.value)}
            placeholder="Ex.: 01310-200"
            style={{
              marginLeft: "10px",
              padding: "10px",
              width: "300px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
        </label>

        <button
          onClick={handleCreateRoute}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Criar Rota
        </button>
        <button
          onClick={handleAddToFavorites}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Adicionar aos Favoritos
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "10px 20px",
            backgroundColor: "#F44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Resetar
        </button>
      </div>

      {favorites.length > 0 && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h2 style={{ color: "#4CAF50" }}>Rotas Favoritas</h2>
          <ul style={{ listStyle: "none", padding: "0" }}>
            {favorites.map((favorite, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => handleLoadFavorite(favorite)}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#9E9E9E",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Carregar
                </button>
                <span style={{ color: "#333" }}>
                  {favorite.startCEP} → {favorite.endCEP}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <MapContainer
        center={[-23.55052, -46.633308]}
        zoom={13}
        scrollWheelZoom={true}
        style={{
          height: "600px",
          width: "100%",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {start && end && <Routing start={start} end={end} />}
        {start && (
          <Marker position={start}>
            <Popup>Ponto inicial: {startCEP}</Popup>
          </Marker>
        )}
        {end && (
          <Marker position={end}>
            <Popup>Ponto final: {endCEP}</Popup>
          </Marker>
        )}
        <ZoomControls />
        <LocateUser />
      </MapContainer>

      <footer
        style={{
          textAlign: "center",
          padding: "20px 0",
          backgroundColor: "#333",
          color: "#fff",
          borderRadius: "10px",
        }}
      >
        <p>Desenvolvimento para estudos usando React e Leaflet</p>
        <p>&copy; 2025 - Mapa de Rotas</p>
      </footer>
    </div>
  );
}

export default App;
