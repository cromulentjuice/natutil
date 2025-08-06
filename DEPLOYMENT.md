# Deployment Guide

This guide covers deploying the XML to Excel Converter to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
Vercel provides excellent support for Next.js and Python functions.

1. **Install Vercel CLI**:
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

3. **Configure**:
   - The `vercel.json` file is already configured
   - Python dependencies will be automatically installed
   - Environment variables can be set in the Vercel dashboard

### Option 2: Netlify
Netlify supports static sites with serverless functions.

1. **Install Netlify CLI**:
   \`\`\`bash
   npm install -g netlify-cli
   \`\`\`

2. **Build and Deploy**:
   \`\`\`bash
   npm run build
   netlify deploy --prod --dir=.next
   \`\`\`

### Option 3: Docker
For containerized deployment on any platform.

1. **Build Docker Image**:
   \`\`\`bash
   docker build -t xml-converter .
   \`\`\`

2. **Run Container**:
   \`\`\`bash
   docker run -p 3000:3000 -p 5000:5000 xml-converter
   \`\`\`

## 🔧 Configuration

### Environment Variables
No environment variables are required for basic functionality.

### Custom Domain
- **Vercel**: Add domain in project settings
- **Netlify**: Configure in site settings
- **Docker**: Use reverse proxy (nginx/traefik)

### CORS Configuration
The Flask backend is configured with CORS enabled for all origins. In production, you may want to restrict this to your domain.

## 📊 Monitoring

### Vercel
- Built-in analytics and monitoring
- Function logs available in dashboard
- Performance insights included

### Netlify
- Function logs in dashboard
- Analytics available with paid plans
- Form handling and identity services

### Docker
- Use logging drivers for log management
- Monitor with tools like Prometheus/Grafana
- Health checks can be added to Dockerfile

## 🔒 Security Considerations

1. **File Upload Limits**: Configure appropriate file size limits
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Input Validation**: XML content is validated before processing
4. **CORS**: Restrict CORS origins in production
5. **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **Python Dependencies**: Ensure all dependencies are in requirements.txt
2. **File Size Limits**: Check platform limits for file uploads
3. **Memory Limits**: Large XML files may hit memory limits
4. **CORS Errors**: Check CORS configuration if frontend can't reach API

### Debug Mode
- Vercel: Check function logs in dashboard
- Netlify: Use `netlify dev` for local testing
- Docker: Use `docker logs` to view container logs

## 📈 Scaling

### Performance Optimization
- Implement caching for repeated conversions
- Use streaming for large files
- Add progress indicators for long operations
- Consider background job processing for large files

### Infrastructure Scaling
- **Vercel**: Automatic scaling included
- **Netlify**: Automatic scaling for functions
- **Docker**: Use orchestration tools (Kubernetes, Docker Swarm)
