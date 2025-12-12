# **CivicLens**
**Bringing clarity to public services for everyone, globally. 🔎**

CivicLens is a Next.js-powered platform that helps users understand government schemes, public services, and civic information through natural language questions. It simplifies access to civic knowledge using AI-driven explanations, intuitive UI, and structured insights.

**Supports:** India, United States, United Kingdom, Canada, Australia, and more.

---

## 🚀 Features

- **AI-powered civic Q&A with Streaming**  
  Ask natural-language questions about schemes, public services, or government documents. Get real-time streaming responses powered by OpenAI. Supports multiple countries.

- **Multi-Country Support**  
  Get information about government schemes, benefits, and processes for India, USA, UK, Canada, Australia, and more.

- **Intelligent Insights**  
  Automatic entity extraction, query classification, and suggested actions from your queries.

- **Automated Workflows**  
  Kestra-powered workflows for weekly scheme updates, eligibility rule extraction, and autocomplete suggestions across multiple countries.

- **Fine-Tuned AI Model**  
  Custom model trained on civic queries from multiple countries using Oumi.

- **Authentication & User Management**  
  Integrated using Clerk with secure user sessions.

- **Clean & Modern UI**  
  Built using TailwindCSS + shadcn/ui with dark mode support.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16  
- **UI:** TailwindCSS, shadcn/ui  
- **Auth:** Clerk  
- **AI:** OpenAI (GPT-3.5-turbo)  
- **Workflows:** Kestra  
- **Fine-tuning:** Oumi  
- **Deployment:** Vercel  
- **Code Review:** CodeRabbit  
- **Development Agent:** Cline

---

## 🎯 Sponsor Technology Integrations

### 1. OpenAI — AI-Powered Civic Reasoning Engine
- **Streaming Chat**: Real-time AI responses using GPT-3.5-turbo
- **Multi-Country Support**: Handles queries for India, USA, UK, Canada, Australia
- **Query Classification**: Automatic categorization of civic queries
- **Entity Extraction**: Extract schemes, offices, documents from queries
- **Document Generation**: AI-powered RTI/FOIA requests, complaint letters, eligibility summaries
- **Location**: `lib/ai/openai.ts`, `app/api/ai/*`

### 2. Kestra — Automated Government Data Workflows
- **Weekly Scheme Updates**: Automated crawling and summarization of government portals (India, USA, UK)
- **Eligibility Rule Extractor**: PDF parsing and structured rule extraction
- **Autocomplete Suggestions**: Intelligent scheme suggestions based on user profiles
- **Location**: `kestra/workflows/*.yaml`

### 3. Cline — Autonomous Development Agent
- **Code Generation**: Automated boilerplate and component creation
- **Refactoring**: Code restructuring and optimization
- **Multi-step Development**: Complex feature implementation workflows
- **Location**: `.clinerules`, `CLINE_GUIDE.md`, `scripts/cline-workflow.sh`

### 4. Vercel — Production Deployment
- **Edge Functions**: Low-latency AI streaming responses
- **Global CDN**: Fast content delivery worldwide
- **Automatic Deployments**: GitHub integration for CI/CD

### 5. CodeRabbit — AI Code Review
- **Automated PR Reviews**: AI-powered code quality checks
- **Architecture Suggestions**: Best practices and improvements
- **Documentation**: Automatic documentation generation

### 6. Oumi — Fine-Tuned Civic Model
- **Custom Dataset**: 12 civic Q&A examples covering India, USA, UK, Canada, Australia
- **Fine-tuning Config**: `oumi/config.yaml` for LoRA fine-tuning
- **Domain Expertise**: Specialized for government schemes across multiple countries
- **Location**: `oumi/` directory

---

## 🚧 Development

### Prerequisites

- Node.js 18+ 
- MongoDB (or MongoDB Atlas)
- API key for OpenAI

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys and database URL
```

3. **Set up database:**
```bash
npx prisma generate
npx prisma db push
```

4. **Run the dev server:**
```bash
npm run dev
```

5. **Deploy Kestra workflows**:
   - Install Kestra: https://kestra.io/docs/getting-started
   - Deploy workflows from `kestra/workflows/` directory
   - Set `KESTRA_URL` and `KESTRA_AUTH` in `.env`

6. **Fine-tune with Oumi** (optional):
   ```bash
   pip install oumi[gpu]
   oumi train -c oumi/config.yaml
   ```

### Environment Variables

See `.env.example` for required variables:
- `OPENAI_API_KEY` - OpenAI API key (required)
- `DATABASE_URL` - MongoDB connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `KESTRA_URL` - Kestra instance URL (optional, for workflow automation)
- `KESTRA_AUTH` - Base64 encoded Kestra credentials (optional)

---

## 📋 Setup Checklist

See [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for detailed step-by-step instructions on:
- Setting up Kestra workflows
- Training Oumi model
- Deploying to production
- Demo preparation

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

## 🤝 Contributions

Contributions, issues, and feature requests are welcome!

---

## 📜 License

MIT License.
