# Image Upload Setup

## GitHub Token Configuration

To enable image uploads through the admin panel, you need to configure a GitHub Personal Access Token on Render.

### Step 1: Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Set token name: `Portfolio Upload Token`
4. Set expiration: `No expiration` or choose your preference
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token** (you won't be able to see it again!)

### Step 2: Add Token to Render

1. Go to your Render dashboard
2. Select your Portfolio backend service
3. Go to "Environment" tab
4. Add environment variable:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: `<paste your token here>`
5. Click "Save Changes"

### Step 3: Optional Environment Variables

You can also configure these (defaults are shown):

```
GITHUB_OWNER=Aksenod
GITHUB_REPO=Portfolio
GITHUB_PAGES_BASE=https://aksenod.github.io
```

## How It Works

1. User uploads image in admin panel
2. Image is sent to `/admin/upload` endpoint
3. Backend validates image (type, size max 5MB)
4. Backend generates unique filename using MD5 hash
5. Backend uploads to GitHub via API to `docs/assets/uploads/`
6. GitHub automatically publishes to GitHub Pages
7. Backend returns GitHub Pages URL
8. Admin panel uses the URL for cover/gallery images

## File Storage

- **Location**: `/docs/assets/uploads/`
- **Naming**: `{md5_hash}.{extension}` (e.g., `a1b2c3d4e5f6.jpg`)
- **Max Size**: 5MB per file
- **Allowed**: All image types (jpg, png, gif, webp, svg, etc.)

## Security

- Uploads require admin authentication (JWT token)
- Only image files are accepted
- File size is limited to 5MB
- Files are stored in public GitHub repository
- Old files with same hash are automatically replaced

## Troubleshooting

### Error: "GitHub token not configured"
- Make sure you added `GITHUB_TOKEN` environment variable on Render
- Restart your Render service after adding the variable

### Error: "GitHub upload failed"
- Check that your token has `repo` scope
- Verify token hasn't expired
- Check Render logs for detailed error message

### Upload is slow
- GitHub API can take 5-30 seconds to process
- This is normal for first-time uploads
- Subsequent uploads of same file are faster (update vs create)
