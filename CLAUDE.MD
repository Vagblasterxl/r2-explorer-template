# R2-Explorer Template - Project Guide

## Project Overview

This is a **Cloudflare R2-Explorer template** that provides a Google Drive-like web interface for managing Cloudflare R2 storage buckets. It's a Cloudflare Workers application that combines R2 storage with a modern file management UI.

**Key Purpose**: Enable intuitive file management in R2 buckets through a familiar drag-and-drop interface, with features like file preview, editing, and organization.

## Technology Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Storage**: Cloudflare R2 (object storage)
- **Framework**: `r2-explorer` npm package (v1.1.5)
- **Build Tool**: Wrangler (Cloudflare's CLI)
- **Configuration**: JSON-based wrangler configuration

## Project Structure

```
r2-explorer-template/
├── src/
│   └── index.ts           # Main worker entry point
├── wrangler.json          # Cloudflare Workers configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── worker-configuration.d.ts  # Type definitions for Workers
├── README.md              # User-facing documentation
└── CLAUDE.MD              # This file - AI assistant guide
```

## Key Files Explained

### `src/index.ts`
- **Purpose**: Main entry point for the Cloudflare Worker
- **Current State**: Imports and exports R2Explorer with configuration
- **Key Settings**:
  - `readonly: true` - Prevents file uploads/modifications (security default)
  - `cfAccessTeamName` - (Commented) Cloudflare Access integration for authentication
- **Important**: This is currently in read-only mode and requires explicit changes to enable write operations

### `wrangler.json`
- **Purpose**: Cloudflare Workers deployment and runtime configuration
- **Key Bindings**:
  - `r2_buckets`: Binds R2 bucket named "r2-explorer-bucket" to the worker
  - `assets`: Serves the dashboard UI from the r2-explorer package
- **Features Enabled**:
  - Source map uploads for debugging
  - Observability (logging and analytics)
  - Single-page application routing

## Development Workflow

### Initial Setup
```bash
# Install dependencies
npm install

# Create R2 bucket (required before deployment)
npx wrangler r2 bucket create r2-explorer-bucket
```

### Available Commands
```bash
# Local development with hot reload
npm run dev

# Deploy to Cloudflare
npm run deploy

# Monitor worker logs in real-time
npx wrangler tail

# Generate TypeScript types for Workers environment
npm run cf-typegen
```

### Local Development
- Run `npm run dev` to start local development server
- The dev server provides a local R2 bucket for testing
- Changes are hot-reloaded automatically

## Security Considerations

### Current State
- ⚠️ **Read-only mode is enabled by default** - this is intentional for security
- No authentication is configured out of the box
- Application is self-hosted on the user's Cloudflare account

### Enabling Write Operations
To allow file uploads and modifications:
1. Update `readonly: false` in `src/index.ts`
2. **Strongly recommended**: Set up authentication FIRST
3. Options for authentication:
   - Cloudflare Access (uncomment and configure `cfAccessTeamName`)
   - Basic Authentication
   - Custom authentication logic

### Security Best Practices
- Never enable write operations without authentication
- Use Cloudflare Access for team-based access control
- Keep the application self-hosted to maintain data control
- Monitor worker logs regularly with `wrangler tail`

## Features

### File Management
- Drag-and-drop file upload (when readonly is disabled)
- Folder creation and organization
- Multi-part upload for large files
- Right-click context menu
- HTTP/Custom metadata editing

### File Viewing
Supports in-browser preview for:
- PDF documents
- Images
- Text files
- Markdown
- CSV
- Logpush files
- In-browser file editing

### Email Integration
- Can receive emails via Cloudflare Email Routing
- View email attachments directly in the interface

## Deployment

### Requirements
1. Cloudflare account
2. R2 bucket created (`r2-explorer-bucket` by default)
3. Wrangler CLI configured and authenticated

### Deployment Process
```bash
# One-time: Create the R2 bucket
npx wrangler r2 bucket create r2-explorer-bucket

# Deploy the worker
npx wrangler deploy
```

### Post-Deployment
- Access the deployed URL provided by Wrangler
- Configure custom domain (optional)
- Set up Cloudflare Access for authentication (recommended)
- Monitor with `npx wrangler tail`

## Common Development Tasks

### Changing the Bucket Name
1. Update `bucket_name` and `preview_bucket_name` in `wrangler.json`
2. Create the new bucket: `npx wrangler r2 bucket create <new-name>`
3. Redeploy: `npm run deploy`

### Enabling File Uploads
1. Update `src/index.ts`: change `readonly: true` to `readonly: false`
2. Set up authentication (see Security section)
3. Redeploy: `npm run deploy`

### Adding Cloudflare Access
1. Create a Cloudflare Access application for your team
2. Uncomment `cfAccessTeamName` in `src/index.ts`
3. Set the value to your team name
4. Redeploy: `npm run deploy`

## Dependencies

### Production
- `r2-explorer@1.1.5` - The core R2 explorer library providing UI and API

### Development
- `typescript@5.8.3` - TypeScript compiler
- `wrangler@4.21.x` - Cloudflare Workers CLI and dev server

## Troubleshooting

### Deployment fails
- Ensure you're authenticated: `npx wrangler login`
- Verify R2 bucket exists: `npx wrangler r2 bucket list`
- Check wrangler.json configuration is valid

### Local dev not working
- Run `npm install` to ensure dependencies are installed
- Clear Wrangler cache: `npx wrangler dev --local`
- Check Node.js version compatibility

### Can't upload files
- Verify `readonly: false` in `src/index.ts`
- Check authentication is properly configured
- Ensure R2 bucket permissions are correct

## Additional Resources

- [R2 Explorer Documentation](https://r2explorer.com/)
- [R2 Explorer Security Guide](https://r2explorer.com/getting-started/security/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Live Demo](https://demo.r2explorer.com)

## Notes for AI Assistants

When working with this codebase:
1. **Always respect the security model** - don't suggest enabling write operations without authentication
2. **The main logic is in the r2-explorer package** - this repo is just configuration
3. **Test locally first** with `npm run dev` before deploying
4. **wrangler.json is the primary configuration** - changes there require redeploy
5. **Read-only by default is intentional** - this is a security feature, not a bug
