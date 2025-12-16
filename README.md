# POFYS Website

[![Test Docker Compose Dev](https://github.com/POFYS/website/actions/workflows/test-docker-compose.yml/badge.svg)](https://github.com/POFYS/website/actions/workflows/test-docker-compose.yml)

### Tech:

[![Astro](https://img.shields.io/badge/Astro-FF5A5F?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build) [![Strapi](https://img.shields.io/badge/Strapi-1E90FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org) [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com) [![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://www.nginx.com) [![Tor](https://img.shields.io/badge/Tor-4E2A8E?style=for-the-badge&logo=torproject&logoColor=white)](https://www.torproject.org)

## Description

The repository for the Popular Organization of Free Yemeni Socialists (POFYS) website. This website serves as a platform to share information about the organization's mission, activities, and publications.

## Features

This project combines a headless CMS (Strapi) with a static-first frontend (Astro) to deliver a fast, secure, and content-driven website. Key capabilities:

- Content management
  - Manage articles, communiques, authors, categories and media from Strapi.
  - Rich-text editing, image uploads, and role-based access for editors and administrators.

- Static-first frontend
  - Pre-rendered pages with Astro for fast performance and reduced server attack surface.
  - Incremental rebuilds triggered by Strapi webhooks for near-real-time updates.

- SEO & accessibility
  - SEO-friendly URLs, meta tags, XML sitemaps and RSS feeds.
  - Responsive, semantic markup to support mobile devices and assistive technologies.

- Internationalization
  - Built-in support for English and Arabic content with localized routes and metadata.

- Security & privacy
  - HTTPS-ready deployment and Tor (onion) mirror for censorship-resistant access.
  - Backend role-based access control and hardened containerized deployment.

- Media & assets
  - Centralized media uploads with public asset hosting and optional image optimization.

- Deployment & developer experience
  - Docker Compose for local development and production deployment.
  - Webhook-driven CI-friendly rebuilds and helper scripts to streamline operations.

- Extensibility
  - Strapi plugins and custom APIs make it easy to extend content models and integrations.

## Links

### Production

- Public site: https://freeyemenis.org/
- Onion (Tor) mirror: http://pofys5jnmmdhmvtdt7ip6wq4fpe464tttk2eijw7tch3cnucdxnjwkyd.onion
- Strapi admin panel: https://freeyemenis.org/admin

### Local development (default)

- Frontend: http://localhost:4321
- Strapi admin panel: http://localhost:1337/admin

Notes

- Local ports above assume the development Docker Compose configuration (`docker-compose.dev.yml`). If you customize ports in your environment, update the `.env.dev`/`.env` files accordingly.
- For production the project expects TLS certificate files at `.keys/freeyemenis.org.pem` and `.keys/freeyemenis.org.key` (see Setup Instructions).

## Requirements

- Docker Engine and Docker Compose (Compose V2 recommended)
- Recommended for local development only: Node.js (18+) and npm or yarn — required if you run frontend or CMS outside Docker or want to run local build scripts directly.
- Disk space and network access sufficient for Docker images and pulling dependencies.
- (Production) Valid TLS certificate and key files placed at `.keys/` when running the production compose stack.

If you prefer to avoid installing Node locally, the project is fully runnable via Docker Compose (see Setup Instructions).

## Setup Instructions
### 1. Clone the repository and navigate to the project directory:
  ```bash
  git clone https://github.com/POFYS/website.git
  cd website
  ```
### 2. Create environment files:
  #### Development
  ```bash
  cp frontend/.env.example frontend/.env.dev
  cp cms/.env.example cms/.env.dev
  ```
  #### Production
  ```bash
  cp frontend/.env.example frontend/.env
  cp cms/.env.example cms/.env
  ```
  Populate the `.env` files with appropriate production environment variables as needed.
### 2.1 Create SSL certificate files (Production only):
  ```bash
  touch .keys/freeyemenis.org.pem
  touch .keys/freeyemenis.org.key
  ```
  Update the `.keys/freeyemenis.org.pem` and `.keys/freeyemenis.org.key` files with your SSL certificate.

### 3. Build and start the Docker containers:
  #### Development
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```
   #### Production
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```
### 4. Configure Strapi CMS:
- a) Access Strapi admin panel at `http://localhost:1337/admin` or `https://freeyemenis.org/admin` for production.
- b) Create an admin user for Strapi when prompted.
- c) Navigate to `Settings > API Tokens` in the Strapi admin panel to create a new API token for the frontend to access the CMS data.
- d) Configure the frontend to use the created API token by updating the appropriate environment variable in the `frontend/.env.dev` or `frontend/.env` file.
- e) Rebuild and restart the Docker containers to apply the changes:
  #### Development
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```
  #### Production
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```
### 5. Configure Webhooks:
- a) Navigate to `Settings > Webhooks` in the Strapi admin panel to set up webhooks for content updates.
- b) Add a new webhook with the URL pointing to the rebuild endpoint: `http://webhook:9000/webhooks/strapi` for development or `https://freeyemenis.org/webhooks/strapi` for production.
- c) Select the events that should trigger the webhook, such as "Entry Create", "Entry Update", and "Entry Delete" for relevant content types.
- d) Save the webhook configuration.
- e) Click on "Test the webhook" to test the setup and generate the frontend.
### 6. Access the Website:
- Open your web browser and navigate to `http://localhost:4321` or `https://freeyemenis.org` to view the website.
- Create and manage content through the Content Manager in the Strapi admin panel at `http://localhost:1337/admin` or `https://freeyemenis.org/admin`.
### 7. Stop the Docker containers when done:
  #### Development
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```
  #### Production
   ```bash
   docker compose -f docker-compose.yml down
   ```

## License
This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.