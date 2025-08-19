# Priory.io

## Status

Under development

## Getting Started

### Prerequisites

- Node.js
- NPM (or other)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/priory-io/priory.git
   cd priory
   ```

2. Install dependencies:
   ```bash
   bun install # or npm
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit the variables
   ```bash
   vim .env
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) (DEFAULT) to view the application.

## Build for Production

```bash
bun run build
bun run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

The organisation `priory-io` and all its public projects are licensed under the terms of the [MIT License](./LICENSE) and any contributions or discussions underneath its name are considered to be beholden to this license.
