import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import FirestoreService, { db } from './service/FirestoreService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const idSalaPrincipal = process.env.ID_SALA_PRINCIPAL;

app.use(cors());
app.use(express.json());

const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  }
}));

app.use((req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== process.env.API_KEY) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }
  next();
});

// ROTAS HTTP
app.get('/salas', async (req, res) => {
  try {
    const salas = await FirestoreService.listarTodasAsSalas();
    res.json(salas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar salas' });
  }
});

app.get('/salas/:salaId/mensagens', async (req, res) => {
  try {
    const mensagens = await FirestoreService.listarMensagensDaSala(req.params.salaId);
    res.json(mensagens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar mensagens' });
  }
});

app.post('/salas/:salaId/mensagens', async (req, res) => {
  try {
    const { mensagem, userKey } = req.body;

    if (!mensagem || !userKey) {
      return res.status(400).json({ erro: 'Campos "mensagem" e "userKey" são obrigatórios.' });
    }

    const usuarioDoc = await FirestoreService.buscarUsuarioPorUserKey(userKey);
    if (!usuarioDoc) {
      return res.status(404).json({ erro: 'Usuário não encontrado para a userKey informada.' });
    }

    const dto = {
      autor: usuarioDoc.nome,
      texto: mensagem.trim()
    };

    const nova = await FirestoreService.adicionarMensagemNaSala(req.params.salaId, dto);
    res.status(201).json(nova);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao adicionar mensagem' });
  }
});

// WEBSOCKET CONFIG
const wss = new WebSocketServer({ server });
const clientes = new Set();

wss.on('connection', (ws) => {
  console.log("Cliente conectado via WebSocket");
  clientes.add(ws);

  ws.on('close', () => {
    clientes.delete(ws);
    console.log("Cliente desconectado");
  });
});

// ESCUTA FIRESTORE (sala fixa)
const mensagensRef = db
  .collection("sala")
  .doc(idSalaPrincipal)
  .collection("mensagens")
  .orderBy("data_envio");

mensagensRef.onSnapshot((snapshot) => {
  const mensagens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const payload = JSON.stringify({
    type: 'mensagens',
    salaId: idSalaPrincipal,
    mensagens,
  });

  clientes.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(payload);
    }
  });
});

// INICIAR SERVIDOR
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});