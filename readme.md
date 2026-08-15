# Imagjon 🚀

**Imagjon** is a powerful, developer-centric Image-to-JSON mock data generator driven by Artificial Intelligence. It eliminates the friction of hand-crafting JSON datasets by allowing developers to instantly extract, structure, and customize dynamic data fields directly from physical charts, prescriptions, forms, or mock data imagery.

---

## 💡 Why Imagjon?

When building real-world applications, developers often spend hours manually mapping image schemas or typing out static test fixtures.

**Imagjon** automates this flow:

1. **Drop it:** Ingest folders or individual images (PNG/JPG).
2. **Define it:** Customize your schema fields dynamically (Text, Numbers, Booleans, Dates) with dedicated system context clues.
3. **Generate it:** Let AI parse the imagery instantly into high-fidelity, clean JSON output ready for your seeds, tests, or front-end components.

---

## 🛠️ The Architecture

Imagjon leverages a lightweight, server-assisted client architecture prioritizing zero database footprint, speed, and privacy.

### Technical Stack

- **Backend Core:** Laravel (Session management, server-side queue coordination, and API isolation)
- **Frontend UI Layer:** React + TypeScript (Interactive single-page application experience)
- **The Bridge:** Inertia.js (Unified server-to-client props passing without API boilerplates or page hard reloads)
- **Styling & Components:** Radix UI / shadcn/ui primitives + Tailwind CSS

---

## 🌟 Key Features

- **Zero-DB Session Persistence:** Process mock schemas and custom context entirely in-memory and via secure Laravel session queues—no database setup required.
- **Dynamic Schema Field Builder:** Add, structure, and control multiple data fields inside an interactive Floating Offset Drawer UI before compiling.
- **Smart Context Injection:** Guide the underlying AI parsing model with technical context hints (e.g., _"Focus on tabular pricing rows and ignore logo metadata"_).
- **Lightweight Performance:** Single hidden input file handlers with optimized layout bounding grids to process image previews with minimal DOM overhead.

---

## 🧪 Development & Prototyping Status

> **Current Phase:** Active Prototyping / Zero-Configuration Mode

Imagjon is intentionally designed to be cloned and executed immediately with **zero infrastructure friction**.

- **Why no Database yet?** During this prototyping phase, all active schema configurations, file uploads, and generation context blocks are bound securely to the client runtime and isolated server sessions. This allows frontend developers to test layout flows and AI output instantly.

- **What's next?** As the core parsing engine stabilizes, a persistent layer will be introduced to support multiple AI agent compatibility, historical generation logs, and reusable schema templates.

---

## 💻 Getting Started

### Prerequisites

- PHP >= 8.2 & Composer
- Node.js & npm/pnpm

### Installation Steps

1. **Clone the repository**
    ```bash
    git clone https://github.com/JamesWithLeo/imagjon.git
    cd imagjon
    ```
