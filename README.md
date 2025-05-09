# 🧠 Maind.ai - Backend Dev Environment (Docker)

Este repositório configura o ambiente de desenvolvimento backend para a POC da Sala de Diálogo do Maind.ai, utilizando Node.js com Docker e Firestore como banco de dados.

---

## 📦 Tecnologias utilizadas

- Node.js 20 (em ambiente containerizado)
- Docker + Docker Compose
- Firebase Admin SDK (Firestore)

---

## 🚀 Como rodar o projeto

### 1. Clone este repositório

```bash
git clone https://github.com/seu-usuario/maind-backend.git
cd maind-backend
```

---

## 🐳 Como iniciar o ambiente com Docker

### 2. Execute o container com Docker Compose

```bash
docker-compose up --build
```

Isso criará um ambiente interativo com todas as dependências instaladas.

---

## 🧪 Dentro do container

Depois que o terminal do container estiver aberto:

### 1. Inicialize um projeto Node.js

```bash
npm init -y
```

### 2. Instale as dependências necessárias

```bash
npm install express firebase-admin dotenv cors
```

Você pode adicionar outras bibliotecas conforme for desenvolvendo.

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` no seu diretório raiz com as seguintes variáveis:

```env
API_KEY=sua_chave_simples
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUACHAVEAQUI\n-----END PRIVATE KEY-----\n"
```

> **Importante:** Substitua as quebras de linha da chave por `\n`.

---

## 🛠️ Desenvolvimento

Você pode criar seus arquivos na pasta `src/` dentro do projeto. O volume já está montado com seu host, então qualquer edição no host será refletida dentro do container.

---

## ✅ Para rodar seu servidor

Depois que tiver seu `index.js`, rode:

```bash
npm start
```

---

## 🌐 Acesso

Se seu servidor rodar na porta 3000, você poderá acessá-lo em:

```
http://localhost:3000/
```

---

## ✨ Observações

- Este ambiente foi criado para facilitar o desenvolvimento local e posterior deploy no Railway.
- O backend ainda não possui lógica pronta — você tem liberdade para escrever o seu próprio código a partir da base.
