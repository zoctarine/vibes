# MemPortVault - Simple Document Storage for MemoryPort

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## The Idea
Inspired by Calude Desktop projects feature, NotebookLM, a unified store for LLM resurces, client agnostic

## The result
MemPortVault is a document management system built with React, Supabase, and ChackraUI. It allows users to create projects, store documents, and manage them through API (used by [Memory Port Mcp](./../memory-port/README.md))

[![Deployed to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://candid-hotteok-3ce691.netlify.app)

## AI Tools

- ![bolt.new](https://img.shields.io/badge/bolt.new-85%25-blue?style=social)
- ![GithubCopilot](https://img.shields.io/badge/Junie-10%25-blue?style=social)
- Written in TypeScript

## Features

*   User authentication and authorization
*   Project creation and management
*   Document creation, editing, and deletion
*   Tagging and searching for documents
*   API key generation and management
*   User profile management

## Technologies Used

*   React
*   Supabase
*   ChakraUI
*   Lucide React
*   Vite

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (version 18 or higher)
*   npm (Node Package Manager)
*   A Supabase account and project

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd document-management-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root directory of the project and add the following environment variables:

    ```
    VITE_SUPABASE_URL=<your-supabase-url>
    VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
    ```

    Replace `<your-supabase-url>` and `<your-supabase-anon-key>` with your Supabase project URL and anon key, respectively. You can find these values in your Supabase project settings.

4.  **Set up Supabase:**

    *   Create a Supabase project.
    *   Run the SQL migrations located in the `supabase/migrations` directory to set up the database schema. You can use the Supabase CLI for this:

        ```bash
        #First install the supabase CLI
        npm install -g supabase

        #Login into supabase
        supabase login

        #Initialize supabase
        supabase init

        #Point to your supabase project
        supabase link --project-id <your-project-id>

        #Apply the migrations
        supabase db push
        ```

        Replace `<your-project-id>` with your Supabase project ID.
    *   Enable Row Level Security (RLS) on all tables.
    *   Create storage bucket with name `documents` and set up storage policies for authenticated users.
    *   Set the `siteUrl` variable in `src/supabase/supabase.ts` to your application URL.

## Development

The project consists of two main parts that need to be run simultaneously:

1. **Web UI Development Server**

   In your first terminal, start the Vite development server:

   ```bash
   npm run dev
   ```

   The web UI will be available at `http://localhost:5173`

2. **Supabase Edge Functions**

   In a second terminal, start the Edge Functions development server:

   ```bash
   npm run dev:functions
   ```

   The Edge Functions will be available at:
   - API: `http://localhost:54321/functions/v1/api`
   - Fetch URL: `http://localhost:54321/functions/v1/fetch-url`

### Development Notes

- The web UI will automatically reload when you make changes to the frontend code
- Edge Functions will automatically reload when you modify files in `supabase/functions/`
- You can test Edge Functions locally using tools like cURL or Postman
- The development servers support hot module replacement (HMR)
- Browser developer tools can be used to debug both frontend and API calls

### Local Testing

1. **Web UI Testing**
   - Use the application through the browser
   - Test all CRUD operations
   - Verify authentication flows
   - Check responsive design

2. **Edge Functions Testing**
   - Test API endpoints using cURL or Postman
   - Verify CORS headers
   - Check error handling
   - Test rate limiting

3. **Integration Testing**
   - Test document creation with URL fetching
   - Verify API key authentication
   - Check storage operations
   - Test search functionality

## Build

To create a production build, run:

```bash
npm run build
```

This will generate optimized static files in the `dist` directory, ready for deployment.

## Deployment

### Netlify Deployment

1. **Deploy with Netlify Button**
   
   Click the "Deploy to Netlify" button above to automatically:
   - Create a new site
   - Set up continuous deployment
   - Configure build settings

2. **Manual Deployment**

   a. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

   b. Build your site:
   ```bash
   npm run build
   ```

   c. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

3. **Environment Variables**

   Set the following environment variables in your Netlify site settings:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Build Settings**

   If deploying through Netlify UI, use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` or higher

### Deployment Checklist

Before deploying to production:

### Edge Functions Deployment

The application uses Supabase Edge Functions for API endpoints and URL fetching. To deploy:

1. **Deploy Functions**
   
   Edge Functions are automatically deployed when linked to your Supabase project:

   ```bash
   # Link to your Supabase project
   supabase link --project-ref your-project-ref

   # Deploy all functions
   supabase functions deploy
   ```

   Functions are located in:
   ```
   /supabase/functions/

   Current functions:
   - `api`: Main API endpoint for document operations
   - `fetch-url`: URL content fetching service
   ```

2. **Function Configuration**

   Each function has its own configuration and environment variables:

   ```bash
   # API Function Environment Variables
   - SUPABASE_URL: Set automatically
   - SUPABASE_ANON_KEY: Set automatically
   - SUPABASE_SERVICE_ROLE_KEY: Set automatically

   # Fetch URL Function Environment Variables
   No additional configuration required
   ```

3. **Testing Functions**

   Test deployed functions using these endpoints:
   ```
   # API Function
   ${SUPABASE_URL}/functions/v1/api
   # Example:
   curl -X POST "${SUPABASE_URL}/functions/v1/api/documents" \
     -H "Authorization: Bearer ${ANON_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Document"}'

   # Fetch URL Function
   ${SUPABASE_URL}/functions/v1/fetch-url
   # Example:
   curl -X POST "${SUPABASE_URL}/functions/v1/fetch-url" \
     -H "Authorization: Bearer ${ANON_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com"}'
   ```

4. **Security**
   - Functions use proper CORS headers
   - API function requires authentication
   - Rate limiting is implemented
   - Error handling is in place
   - Request validation
   - Input sanitization

5. **Monitoring**
   - Check function logs in Supabase Dashboard
   - Monitor function invocations and errors
   - Set up alerts for function failures
   - Track rate limit violations
   - Monitor response times


1. **Environment Configuration**
   - Set up all required environment variables
   - Configure Supabase authentication settings
   - Set the correct site URL in Supabase dashboard

2. **Security**
   - Ensure all tables have RLS policies enabled
   - Verify API key permissions
   - Check storage bucket policies

3. **Performance**
   - Run `npm run build` locally to check for any build issues
   - Test the production build using `npm run preview`

4. **Post-Deployment**
   - Verify authentication flow works
   - Test document creation and storage
   - Confirm API key functionality
   - Check all CRUD operations

### Continuous Deployment

For automated deployments:

1. **Connect Your Repository**
   - Link your Git repository to Netlify
   - Configure branch deployments

2. **Build Settings**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [build.environment]
     NODE_VERSION = "18"
   ```

3. **Deploy Contexts**
   - Production: Main/Master branch
   - Preview: Pull requests
   - Branch: Feature branches

### Troubleshooting

Common deployment issues and solutions:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Ensure environment variables are set

2. **Runtime Errors**
   - Check browser console for errors
   - Verify Supabase connection
   - Confirm API endpoints are accessible

3. **Authentication Issues**
   - Verify Supabase URL and anon key
   - Check authentication redirect URLs
   - Confirm RLS policies are correct
   - Verify Edge Functions are deployed and accessible

For additional help, check the [Netlify Docs](https://docs.netlify.com/) or [Supabase Docs](https://supabase.com/docs).
