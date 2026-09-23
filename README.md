# 🟢 Giro — App de Vendas para Representantes

App mobile para vendedores externos no segmento de distribuição de alimentos.
**100% offline | Dados locais | Sem login | Sem backend**

---

## 🚀 Como Gerar o APK

### Opção 1: EAS Build (Recomendado — roda na nuvem da Expo)

```bash
# 1. Instale o EAS CLI (se não tiver)
npm install -g eas-cli

# 2. Faça login na sua conta Expo (gratuito em expo.dev)
eas login

# 3. Configure o projeto (apenas na primeira vez)
eas build:configure

# 4. Gere o APK para Android
eas build -p android --profile preview

# O APK será gerado na nuvem e você receberá o link para download.
```

### Opção 2: Build Local (requer Android SDK)

```bash
# 1. Instale as dependências
npm install

# 2. Gere o projeto nativo
npx expo prebuild --platform android

# 3. Build do APK (requer ANDROID_HOME configurado)
cd android && ./gradlew assembleRelease

# O APK estará em: android/app/build/outputs/apk/release/app-release.apk
```

### Opção 3: Expo Go (para testar rapidamente)

```bash
# 1. Instale o Expo Go no Android (Play Store)
# 2. Rode o servidor de desenvolvimento
npx expo start

# 3. Escaneie o QR code com o Expo Go
```

---

## 📁 Estrutura do Projeto

```
giro_app/
├── app/                    # Telas (Expo Router)
│   ├── index.tsx           # Redireciona para onboarding ou tabs
│   ├── onboarding/         # 3 telas de boas-vindas (carrossel)
│   ├── setup/              # Configuração inicial (sem login)
│   ├── tabs/               # Navegação principal (Bottom Tabs)
│   │   ├── home.tsx        # Dashboard com gráficos e metas
│   │   ├── clients/        # Lista e ficha de clientes
│   │   ├── sell.tsx        # Atalho para Nova Venda
│   │   ├── orders/         # Lista de pedidos
│   │   └── more.tsx        # Módulos secundários
│   ├── new-sale/           # Fluxo de Nova Venda (6 passos)
│   ├── client/             # Ficha detalhada do cliente
│   ├── product/            # Detalhe do produto
│   ├── order/              # Detalhe do pedido + PDF
│   ├── financial.tsx       # Contas a receber
│   ├── expenses.tsx        # Despesas de campo
│   ├── routes.tsx          # Rotas e visitas
│   ├── reports.tsx         # Relatórios com gráficos
│   ├── assistant.tsx       # Assistente local
│   └── settings.tsx        # Configurações + backup
│
├── src/
│   ├── database/
│   │   └── database.ts     # [LOCAL] SQLite: schema + queries
│   ├── contexts/
│   │   ├── ThemeContext.tsx # Tema claro/escuro
│   │   └── AppStateContext.tsx # Estado global do app
│   ├── components/         # Componentes reutilizáveis
│   ├── constants/
│   │   └── theme.ts        # Cores, tipografia, espaçamento
│   ├── types/              # TypeScript types
│   └── utils/              # Helpers (PDF, formatação, etc.)
│
├── assets/                 # Ícones, splash screen
├── app.json               # Configuração Expo
├── eas.json               # Configuração EAS Build
└── package.json
```

---

## 🏗️ Arquitetura de Dados (100% Local)

**SQLite via expo-sqlite** — todos os dados ficam no aparelho.

- `config` — configurações do vendedor/empresa
- `clients` — cadastro de clientes
- `products` — catálogo de produtos e estoque
- `sales` — pedidos/vendas
- `sale_items` — itens de cada venda
- `installments` — parcelas a receber
- `visits` — histórico de visitas/check-ins
- `expenses` — despesas de campo

---

## 🎨 Design System

**Paleta Principal:**
- 🟢 Verde Primário: `#00C853`
- 🌿 Verde Escuro: `#00952B`
- 🍃 Verde Suave: `#E8F9EE`
- 🌑 Fundo Escuro: `#0D1F12`
- 🔶 Laranja Alerta: `#FF6B35`

---

## 📱 Módulos

| Módulo | Status | Offline |
|--------|--------|---------|
| Onboarding | ✅ | ✅ |
| Configuração inicial | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| Clientes (CRUD + ficha) | ✅ | ✅ |
| Produtos + Estoque | ✅ | ✅ |
| Nova Venda (6 passos) | ✅ | ✅ |
| Geração de PDF | ✅ | ✅ |
| Pedidos | ✅ | ✅ |
| Financeiro / Recebimentos | ✅ | ✅ |
| Despesas de campo | ✅ | ✅ |
| Rotas e Visitas | ✅ | ✅ |
| Relatórios + Gráficos | ✅ | ✅ |
| Assistente (regras locais) | ✅ | ✅ |
| [IA Online — OPCIONAL] | ⬜ | N/A |
| Backup/Restauração JSON | ✅ | ✅ |
| Modo Escuro | ✅ | ✅ |

---

## 🔒 Privacidade e Segurança

Todos os dados ficam **exclusivamente no celular do vendedor**.
Nenhuma informação é enviada para servidores ou nuvem.
