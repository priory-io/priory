# Priory.io

## Status

The website is currently under development.

## Getting Started

### Prerequisites

- Node.js or Bun
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/priory-io/priory.git
   cd priory
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) (DEFAULT) to view the application.

## Build for Production

```bash
bun run build
bun run start
```

## Deployment

### Environment Variables

See `.env.example` for all available environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

We are licensed under MIT which includes any contributions and proposals
