#!/bin/bash
# Download Space Grotesk font from Google Fonts

set -e

FONT_DIR="$(dirname "$0")/../static/fonts"
mkdir -p "$FONT_DIR"

echo "Downloading Space Grotesk font..."

# Download from Google Fonts CDN
curl -L -o "$FONT_DIR/space-grotesk-latin.woff2" \
  "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUXskPMBBSSJLm2E.woff2"

echo "Font downloaded to $FONT_DIR/space-grotesk-latin.woff2"
