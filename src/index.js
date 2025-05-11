import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import FirestoreService from './service/FirestoreService.js';
import { verificarToken } from './service/FirebaseAuthService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

    // Validação mínima
    if (!mensagem || !userKey) {
      return res.status(400).json({ erro: 'Campos "mensagem" e "userKey" são obrigatórios.' });
    }

    const usuarioDoc = await FirestoreService.buscarUsuarioPorUserKey(userKey);
    if (!usuarioDoc) {
      return res.status(404).json({ erro: 'Usuário não encontrado para a userKey informada.' });
    }

    // Monta o DTO com o nome do usuário
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

// app.post('/salas/:salaId/mensagens', verificarToken, async (req, res) => {
//   try {
//     const { texto } = req.body;
//     const usuario = req.user.name || req.user.email || 'Usuário Desconhecido';

//     const nova = await FirestoreService.adicionarMensagemNaSala(req.params.salaId, {
//       usuario,
//       texto
//     });

//     res.status(201).json(nova);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ erro: 'Erro ao adicionar mensagem' });
//   }
// });

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
