# **CivicLens**
**Bringing clarity to public services for everyone. 🔎**

CivicLens is a Next.js-powered platform that helps users understand government schemes, public services, and civic information through natural language questions. It simplifies access to civic knowledge using AI-driven explanations, intuitive UI, and structured insights.

---

## 🚀 Features

- **AI-powered civic Q&A**  
  Ask natural-language questions about schemes, public services, or government documents.

- **Authentication & User Management**  
  Integrated using Clerk.

- **Searchable Civic Knowledge Base**  
  Browse and explore public schemes and essential civic information.

- **Clean & Modern UI**  
  Built using TailwindCSS + shadcn/ui.

- **Easy Configuration**  
  All core app metadata (name, description, etc.) is stored inside a single `config/index.ts` file for instant updates.

---

## 🛠️ Tech Stack

- **Framework:** Next.js  
- **UI:** TailwindCSS, shadcn/ui  
- **Auth:** Clerk  
- **AI:** OpenAI  
- **Deployment:** Vercel

---

## 📁 Project Structure

```
civiclens/
├── app/
├── components/
├── config/
├── hooks/
├── lib/
├── prisma/
├── public/
├── scripts/
```

---

## 🧠 Cline Integration

This project integrates **Cline CLI** to automate coding workflows and accelerate development.

### 🔧 How Cline Was Used
- **Autonomous Code Generation** – Generated boilerplate for components, API routes, and UI sections.
- **Refactoring Assistance** – Restructured files, renamed components, reorganized codebase.
- **Automated Documentation Updates** – Helped generate and maintain README and config files.
- **Code Planning** – Multi-step task execution for features like knowledge base and Q&A flow.
- **Developer Productivity** – On-demand coding agent during hackathon for rapid changes.

### 🛠️ Cline Script Included
To demonstrate usage for hackathon evaluation, the repository includes a sample Cline workflow script: at [cline-workflow.sh](./scripts/cline-workflow.sh)

---

## 🔮 Tools & Roles:

### 1. Cline — Autonomous coding agent
- Generated multi-file edits, boilerplate components, MCP helper templates.
- Codebase: `scripts/civiclens-cline-workflow.sh`, `.clinerules`, `CLINE_GUIDE.md`

---

## 🚧 Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Trigger Cline workflow (requires Cline CLI configured):

```bash
chmod +x scripts/civiclens-cline-workflow.sh
./scripts/civiclens-cline-workflow.sh
```

---

## 🤝 Contributions

Contributions, issues, and feature requests are welcome!

---

## 📜 License

MIT License.
