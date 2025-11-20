# DIPA Document Chat - React Frontend

A modern React-based frontend for the DIPA RAG (Retrieval Augmented Generation) document chat application. This application provides a clean, simple UI for querying documents using AI with support for multiple data sources, document corpus management, and user authentication.

## Features

- 🔐 **Firebase Authentication** - Email/password authentication with MFA support
- 💬 **Dual Chat Modes** - Direct AI chat and RAG-powered agent mode (admin only)
- 📁 **Data Source Management** - Manage Google Cloud Storage, Google Drive, and web crawler sources
- 📚 **Document Corpus Management** - View and manage document corpora
- ⚙️ **User Settings** - Account settings and MFA configuration
- 📱 **Responsive Design** - Mobile-friendly with collapsible sidebar
- 🎨 **Modern UI** - Clean, minimal design with Tailwind CSS

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Firebase SDK** - Authentication
- **Axios** - HTTP client
- **Zustand** - State management (available, using Context API)
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase project with Authentication enabled
- Backend API running (default: http://localhost:8002)

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8002
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   You can copy `.env.example` and fill in your Firebase credentials.

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   The application will be available at `http://localhost:5173` (or the port Vite assigns).

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Chat/           # Chat interface components
│   ├── Common/         # Shared components (Header, Modal, etc.)
│   ├── Corpus/         # Corpus management components
│   ├── DataSources/    # Data source management components
│   ├── Settings/       # Settings components
│   └── Sidebar/        # Sidebar navigation
├── contexts/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── ChatContext.tsx # Chat state
├── services/           # API and service layers
│   ├── api.ts         # API service (axios)
│   └── firebase.ts    # Firebase configuration
├── App.tsx            # Main app component with routing
└── main.tsx          # Entry point
```

## Usage

### Authentication

1. **Sign Up/Login:**
   - Navigate to `/login` (or you'll be redirected if not authenticated)
   - Create an account or sign in with existing credentials

2. **Multi-Factor Authentication (MFA):**
   - Go to Settings tab
   - Click "Setup MFA"
   - Enter your phone number with country code
   - Verify the code sent to your phone

### Chat Interface

1. **Chat Mode:**
   - Default mode for all users
   - Direct AI conversation using Gemini models
   - No document retrieval

2. **Agent Mode (Admin Only):**
   - RAG-powered document querying
   - Select a data source (optional) or use all sources
   - Responses include document citations

3. **Sending Messages:**
   - Type your message in the input area
   - Press Enter to send (Shift+Enter for new line)
   - Upload files (PDF, DOCX, TXT) using the paperclip icon

### Data Source Management

1. **View Data Sources:**
   - Navigate to "Data Sources" tab
   - See all configured sources with their status

2. **Add Data Source:**
   - Click "Add Data Source"
   - Select type (GCS, Drive, or Web)
   - Fill in required configuration
   - Submit

3. **Enable/Disable Sources:**
   - Click the power icon on any data source card
   - Toggle between enabled/disabled states

4. **Delete Sources:**
   - Click the trash icon
   - Confirm deletion

### Document Corpus Management

1. **View Corpora:**
   - Navigate to "Data Sources" tab (corpora are listed there)
   - See document count for each corpus

2. **View Corpus Info:**
   - Click the info icon on a corpus card
   - View detailed information and metadata

3. **Delete Corpus:**
   - Click the trash icon
   - Confirm deletion (irreversible)

### Settings

1. **Account Settings:**
   - View your account information
   - Display name, email, and user ID

2. **MFA Settings:**
   - Setup or view MFA status
   - Manage phone number

## API Integration

The application expects the following backend endpoints:

### Authentication
- `GET /auth/user` - Get user information
- `GET /auth/mfa/status` - Get MFA status
- `POST /auth/mfa/setup` - Setup MFA
- `POST /auth/mfa/verify` - Verify MFA code

### Chat
- `POST /chat` - Send chat message (direct AI)
- `POST /adk-chat` - Send agent message (RAG)

### Data Sources
- `GET /data-sources` - List data sources
- `POST /data-sources` - Add data source
- `DELETE /data-sources/{name}` - Delete data source
- `PATCH /data-sources/{name}` - Update data source (toggle enabled)

### Corpora
- `GET /corpora` - List corpora
- `GET /corpus/{name}/info` - Get corpus info
- `DELETE /corpus/{name}` - Delete corpus
- `POST /sync-drive-to-gcs` - Sync Google Drive to GCS

All API requests include Firebase ID token in the `Authorization: Bearer {token}` header.

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The production build will be in the `dist/` directory.

## Development

- **Linting:** `npm run lint`
- **Type checking:** TypeScript is configured with strict mode
- **Hot reload:** Vite provides instant HMR during development

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8002` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Required |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Required |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Required |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Required |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Required |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Required |

## Troubleshooting

### Firebase Authentication Issues
- Ensure Firebase Authentication is enabled in your Firebase project
- Verify all environment variables are set correctly
- Check browser console for Firebase errors

### API Connection Issues
- Verify the backend API is running
- Check `VITE_API_BASE_URL` matches your backend URL
- Ensure CORS is configured on the backend

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

## License

[Add your license here]

## Contributing

[Add contributing guidelines if applicable]



