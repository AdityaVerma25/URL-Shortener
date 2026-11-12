# Full-Stack URL Shortener (React + Tailwind CSS + Spring Boot 3)

## Architecture & Tech Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons
  - Minimal centered URL Paste Bar + immediate Output Bar below
  - Top Taskbar with Logo on the left and Profile Menu (`My Account` & `Logout`) on the right
  - Initial Login / Signup screen with **Google** & **GitHub** OAuth2 buttons + Email/Password
- **Backend**: Java 17+, Spring Boot 3.3+
  - **Redis (`@Cacheable`)**: Read-through caching for sub-millisecond short URL resolution (7-day TTL)
  - **Spring Security + OAuth2 + JWT**: Stateless authentication with Google & GitHub OAuth2 login and **7-day JWT session expiration** (`604800000` ms)
  - **Apache Kafka**: Asynchronous click event streaming (`url-click-events` topic) to decouple analytics writes from redirects
  - **MySQL**: Persistent relational storage for `url_mappings` and `users`

---

## Quick Start

### 1. Start Infrastructure (MySQL, Redis, Kafka)
```bash
docker-compose up -d
```

### 2. Run Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`.

### 3. Run React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.
