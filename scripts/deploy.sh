#!/bin/bash

echo "🚀 Deploying XML to Excel Converter..."

# Check if we're deploying to Vercel or Netlify
read -p "Deploy to (1) Vercel or (2) Netlify? Enter 1 or 2: " choice

case $choice in
  1)
    echo "📦 Deploying to Vercel..."
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    echo "✅ Deployed to Vercel!"
    echo "Your app should be available at the URL shown above."
    ;;
    
  2)
    echo "📦 Deploying to Netlify..."
    
    # Install Netlify CLI if not present
    if ! command -v netlify &> /dev/null; then
      echo "Installing Netlify CLI..."
      npm install -g netlify-cli
    fi
    
    # Build the project
    npm run build
    
    # Deploy to Netlify
    netlify deploy --prod --dir=.next
    
    echo "✅ Deployed to Netlify!"
    ;;
    
  *)
    echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test your deployed application"
echo "2. Set up custom domain (optional)"
echo "3. Configure environment variables if needed"
