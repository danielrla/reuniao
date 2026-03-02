# Gestão Integrada de Reuniões e Encaminhamentos

Sistema web completo para o gerenciamento de reuniões, contatos e tarefas (encaminhamentos). Desenvolvido com **Node.js, Express e Prisma** no Backend, e **React + Vite + Tailwind CSS** no Frontend.

## Principais Funcionalidades

- **Autenticação:** Login seguro via Google OAuth2.
- **Gestão de Reuniões:** Agendamento, edição, controle de status (Marcada, Realizada, Cancelada) e tipo (Online/Presencial).
- **Integração Google Agenda:** Sincronização automatizada e bidirecional. Reuniões marcadas no sistema atualizam a sua agenda oficial do Google, respeitando apenas o ano corrente e filtrando eventos válidos.
- **Contatos e Integração Google Contacts:** Cadastro, edição e deleção de contatos. Capacidade de puxar e unificar todos os seus contatos corporativos em poucos cliques através da People API. Busca instantânea (debounce search).
- **Módulo de Encaminhamentos (Tarefas):** Criação manual de tarefas alocadas à determinada Reunião. Organização visual entre *Pendentes* e *Concluídas*, forçando a inclusão de Data e Anotação quando o status é migrado para finalizada.
- **Cérebro IA & Transcrições:** Área dedicada para adicionar atas ou transcrições longas atreladas à Reunião original, permitindo extrair e gerar tarefas automaticamente.
- **Paginação Global Consistente:** Performance otimizada suportando grande escala (scroll na visualização interna das listagens com barra de navegação baseada em *paginação de limite de 10 itens*).

## Tecnologias

### Backend (`/src`)
- **Linguagem:** TypeScript + Node.js
- **Framework:** Express
- **Banco de Dados:** PostgreSQL via ORM Prisma (`schema.prisma`)
- **Autenticação e Serviços Externos:** Biblioteca Oficial `googleapis` para OAuth2, Google Calendar e Google People (Contatos).

### Frontend (`/web`)
- **Core:** React + Vite
- **Estilo:** Tailwind CSS + Componentes utilitários (Lucide React para ícones)
- **Roteamento:** React Router DOM

## Estrutura do Projeto

\`\`\`
├── prisma/
│   └── schema.prisma         # Modelagem do Banco (User, Meeting, Task, Contact)
├── src/
│   ├── application/          # Casos de Uso (regras de negócio isoladas)
│   ├── controllers/          # Controladores (Meeting, Contact, Task, Auth)
│   ├── domain/               # Entidades e Interfaces base
│   ├── infrastructure/       # Serviços externos (Google Calendar Service, Contacts Service)
│   ├── routes/               # Definição das Rotas da API baseadas no Express
│   └── server.ts             # Entrypoint da Aplicação Servidora
└── web/
    └── src/
        ├── components/       # Componentes React Compartilhados (Sidebar, Navigation)
        └── pages/            # Telas principais (Meetings, Tasks, Contacts, Settings)
\`\`\`

## Como Rodar Localmente

1. **Dependências:** Execute \`npm install\` tanto na raiz do projeto quanto dentro da pasta `/web`.
2. **Ambiente:** Configure um arquivo `.env` na raiz seguindo o modelo (contendo `DATABASE_URL` do seu Postgres Local e as envs do Google OAuth2).
3. **Banco de Dados:** Execute \`npx prisma db push\` para refletir as tabelas na sua base local.
4. **Subindo a Aplicação em Modo DEV:**
   - Para o Backend: \`npm run dev\` na raiz.
   - Para o Frontend: Navegue para `/web` e execute \`npm run dev\`.
5. Acesse seu navegador na porta revelada pelo Vite (geralmente `http://localhost:5173/`).
