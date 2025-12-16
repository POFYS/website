# Website

### Tech:
[![Astro](https://img.shields.io/badge/Astro-FF5A5F?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build) [![Strapi](https://img.shields.io/badge/Strapi-1E90FF?style=for-the-badge&logo=strapi&logoColor=white)](https://strapi.io) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org) [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com) [![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://www.nginx.com) [![Tor](https://img.shields.io/badge/Tor-4E2A8E?style=for-the-badge&logo=torproject&logoColor=white)](https://www.torproject.org)

# Description
Repository for Popular Organization of Free Yemeni Socialists (POFYS) website. The website is built using Astro for the frontend and Strapi as the headless CMS, with PostgreSQL as the database.

The website serves as a platform to share information about the organization's mission, activities, and publications.

# Features
### Content Management
- Manage articles, communiques, authors, categories, and media assets.
- Rich text editing and media uploads.
- Role-based access control for content editors and administrators.
### Static Site Generation
- Fast loading times with pre-rendered pages using Astro.
- Improved security with a static frontend.
### SEO Optimization
- SEO-friendly URLs, meta tags, and sitemaps.
### Responsive Design
- Mobile-friendly layout for optimal viewing on various devices.
### Webhooks
- Automatic frontend rebuilds on content updates via webhooks.
### Multi-language Support
- Content available in English and Arabic for broader reach.
### Onion Site
- Accessible via Tor network for enhanced privacy and censorship resistance.

# Links
## Production
- Clear Site: https://freeyemenis.org/
- Onion Site: http://pofys5jnmmdhmvtdt7ip6wq4fpe464tttk2eijw7tch3cnucdxnjwkyd.onion
- Strapi Admin Panel: https://freeyemenis.org/admin
## Local Development
- Frontend: http://localhost:4321
- Strapi Admin Panel: http://localhost:1337/admin

# Requirements
- Docker and Docker Compose

# Setup Instructions
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

# License
This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

# Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.