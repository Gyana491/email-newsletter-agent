# AI Discovery Digest - Newsletter Generator

A Node.js service that automatically generates and sends AI-focused newsletters by aggregating trending content from multiple sources.

## Features

- 🤖 Automated AI content aggregation from multiple sources:
  - GitHub Trending Repositories
  - GitHub Trending Developers
  - Hugging Face Research Papers
  - Hugging Face Trending Models/Datasets/Spaces
- 📝 AI-powered content summarization using OpenRouter API with Meta's Llama-4-Maverick model
- 📧 Automated newsletter generation with responsive HTML templates
- 💾 Intelligent caching system for API responses (10-minute TTL)
- 🔄 Automatic retry mechanism for reliable email delivery
- 📱 Mobile-friendly responsive email design
- 🎨 Professional styling with modern CSS

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager
- Environment variables configuration

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
API_KEY=your_openrouter_api_key
PORT=3000
```

Note: You can obtain an OpenRouter API key from https://openrouter.ai/

## Usage

Start the server:
```bash
npm run dev  # for development with auto-reload
npm start    # for production
```

The server will start on port 3000 by default (configurable via PORT environment variable).

### API Endpoints

- `GET /send-newsletter`: Generates and sends the newsletter
  - Aggregates content from multiple sources
  - Generates an AI-powered summary
  - Formats content into a responsive HTML email
  - Sends to all subscribers
  - Returns a JSON response with the status of the newsletter generation and sending process

## Project Structure

- `index.js` - Express server setup and main API endpoint
- `generate-newsletter.js` - Newsletter generation and sending logic
- `fetchApis.js` - Data fetching from various sources
- `utils/`
  - `cache.js` - Caching utility for API responses
  - `parseApiData.js` - Data parsing utilities

## Error Handling

- The service includes comprehensive error handling:
  - API request failures with detailed error messages
  - Content generation retries with OpenRouter API
  - Email sending retries (up to 3 attempts with 2-second delays)
  - Server error middleware
  - Invalid response handling

## Caching

- API responses are cached for 10 minutes to improve performance
- Individual endpoint responses are cached separately
- Newsletter summaries are cached to reduce API calls
- Cache can be cleared programmatically if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.