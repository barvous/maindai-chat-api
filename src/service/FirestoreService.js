import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

const app = initializeApp({
	credential: cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
	}),
});

const db = getFirestore(app);

const FirestoreService = {
	// Lista mensagens da subcoleção 'mensagens' de uma sala específica
	async listarMensagensDaSala(salaId) {
		const mensagensRef = db
			.collection("sala")
			.doc(salaId)
			.collection("mensagens");
		const snapshot = await mensagensRef.orderBy("data_envio").get();
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
	},

	async buscarSalaPorAssunto(assunto) {
		const snapshot = await db
			.collection("sala")
			.where("assunto", "==", assunto)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return null;
		}

		const doc = snapshot.docs[0];
		return {
			id: doc.id,
			...doc.data(),
		};
	},

	// Adiciona uma nova mensagem em uma sala específica
	async adicionarMensagemNaSala(salaId, { autor, texto, data_envio }) {
		const novaMensagem = {
			autor,
			texto,
			data_envio: data_envio || new Date().toISOString(),
		};
		const ref = await db
			.collection("sala")
			.doc(salaId)
			.collection("mensagens")
			.add(novaMensagem);
		return { id: ref.id, ...novaMensagem };
	},

	async listarTodasAsSalas() {
		const snapshot = await db.collection("sala").get();
		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
	},

	/**
	 * Busca um usuário na coleção raiz 'usuarios' pelo campo userKey.
	 * @param {string} userKey – chave única do usuário
	 * @returns {Promise<{ id: string, nome: string, userKey: string }|null>}
	 */
	async buscarUsuarioPorUserKey(userKey) {
		const usuariosRef = db.collection("usuarios");
		const snapshot = await usuariosRef
			.where("userKey", "==", userKey)
			.limit(1)
			.get();

		if (snapshot.empty) {
			return null;
		}

		const doc = snapshot.docs[0];
		return { id: doc.id, ...doc.data() };
	},
};

export default FirestoreService;
