# Social Media Share Images

This directory contains social media sharing images for SEO optimization.

## Required Images

### og-image.svg
- **Size**: 1200x630px (artboard)
- **Format**: SVG (current default)
- **Purpose**: Open Graph image for social media sharing
- **Content**: Should include:
  - Tucsenberg Web Frontier logo/branding
  - Key messaging: "Modern B2B Enterprise Web Platform"
  - Technology stack highlights: "Next.js 16 + React 19 + TypeScript"
  - Clean, professional design matching brand colors

> Note: Some social platforms have limited support for SVG Open Graph images.
> For production, consider exporting an optimized `og-image.jpg` (or PNG) and
> updating the SEO config to point to the raster image.

### twitter-image.jpg (Optional)
- **Size**: 1200x600px  
- **Format**: JPEG
- **Purpose**: Twitter Cards specific image
- **Content**: Similar to og-image but optimized for Twitter's aspect ratio

## Design Guidelines

1. **Brand Consistency**: Use project's color scheme and typography
2. **Readability**: Ensure text is legible at small sizes
3. **Professional**: Maintain B2B enterprise aesthetic
4. **Technology Focus**: Highlight modern tech stack
5. **Call to Action**: Include subtle CTA or value proposition

## Current Status

- ✅ SEO configuration updated to reference `/images/og-image.svg`
- ⏳ For production: Export an optimized raster image (1200x630px, <200KB) and update SEO config if needed

## Testing

After adding images, test social sharing on:
- Facebook Sharing Debugger
- Twitter Card Validator  
- LinkedIn Post Inspector
- WhatsApp link preview
