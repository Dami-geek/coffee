## 1. Architecture Design

```mermaid
flowchart TB
  U["User Browser"] --> FE["Frontend: React SPA"]
  FE --> S["Storage Layer"]
  S --> LS["LocalStorage (MVP)"]
  S --> SEED["Bundled Seed JSON (Default Dataset)"]
```

## 2. Technology Description
- Frontend: React@18 + TypeScript + tailwindcss@3 + vite
- Rendering: SVG map with d3-geo + topojson-client
- Projection: Robinson (d3-geo-projection)
- State: React state + lightweight store (context or zustand if already needed; default: context)
- Data: Seed JSON shipped with app; persisted edits stored in LocalStorage (MVP)
- Admin security: Passcode gate stored as hash in env at build time (MVP), not production-grade authentication

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | Interactive world map + country focus detail panel |
| /admin | Admin CMS for editing/export/import of country and production area data |

## 4. API Definitions
No backend APIs in MVP.

## 5. Server Architecture Diagram
Not applicable (no backend in MVP).

## 6. Data Model
### 6.1 Data Model Definition

```mermaid
erDiagram
  COUNTRY ||--o{ PRODUCTION_AREA : contains
  COUNTRY {
    string id
    string iso2
    string name
    string description
    string[] harvestMonths
    string[] typicalFlavors
    string[] links
  }
  PRODUCTION_AREA {
    string id
    string countryId
    string name
    number altitudeMin
    number altitudeMax
    string[] varieties
    string[] processes
    string[] tastingNotes
    string seasonality
    string notes
  }
```

### 6.2 Data Definition Language
No DDL in MVP (LocalStorage + JSON).
