# Frontend Deployment Guide

## Vercel Deployment

Your frontend is now configured for deployment on Vercel. Here are the deployment options:

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and login
2. Click "New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Set the **Root Directory** to `frontend`
5. Vercel will automatically detect it's a React app
6. Click "Deploy"

### Option 3: Deploy from this directory

If you want to deploy directly from the frontend folder:

1. **Initialize a new Git repository in the frontend folder**:
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial frontend commit"
   ```

2. **Push to a new repository** (GitHub/GitLab):
   - Create a new repository on GitHub called `da-tog-frontend`
   - Push your code:
     ```bash
     git remote add origin https://github.com/yourusername/da-tog-frontend.git
     git push -u origin main
     ```

3. **Connect to Vercel** and deploy

## Configuration Details

### Environment Variables
- **Production API URL**: `https://da-tog-updated-backend.onrender.com/api`
- **Build settings**: Optimized for production with source maps disabled

### Files Created/Modified:
- `vercel.json` - Vercel deployment configuration
- `.env.production` - Production environment variables
- `package.json` - Build scripts already configured

### API Integration
The frontend is configured to automatically use your deployed backend:
- **Backend URL**: `https://da-tog-updated-backend.onrender.com`
- **Swagger Docs**: `https://da-tog-updated-backend.onrender.com/api-docs`

## Testing the Deployment

After deployment, test these key features:
1. Login functionality
2. Dashboard loading
3. API calls (create customers, orders, etc.)
4. Notification system

## Build Verification

The production build has been tested and is ready for deployment:
- ✅ Build completed successfully
- ✅ Bundle size optimized (142.1 kB main bundle)
- ✅ CSS properly bundled (23.55 kB)
- ⚠️ Minor TypeScript warnings (non-breaking)

## Next Steps

1. Choose one of the deployment options above
2. Your frontend will be available at a URL like: `https://your-project-name.vercel.app`
3. Update your backend CORS settings if needed to allow the new frontend domain

## Support

If you encounter any issues:
- Check the Vercel deployment logs
- Ensure your backend is running at `https://da-tog-updated-backend.onrender.com`
- Verify the API endpoints are accessible