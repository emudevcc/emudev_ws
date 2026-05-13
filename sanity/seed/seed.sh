#!/usr/bin/env bash
# Import all seed NDJSON files into a Sanity dataset.
# Skills must be first so experience/project/cert references resolve.
#
# Usage:
#   bash sanity/seed/seed.sh            # imports into 'production'
#   bash sanity/seed/seed.sh staging    # imports into 'staging'

set -euo pipefail

DATASET="${1:-production}"
SEED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MERGED="$SEED_DIR/merged-seed.ndjson"

echo "==> Merging seed files (skills first)..."
cat \
  "$SEED_DIR/04-skills.ndjson" \
  "$SEED_DIR/01-site-settings.ndjson" \
  "$SEED_DIR/02-about.ndjson" \
  "$SEED_DIR/03-experience.ndjson" \
  "$SEED_DIR/05-certifications.ndjson" \
  "$SEED_DIR/05-education.ndjson" \
  "$SEED_DIR/05-languages.ndjson" \
  "$SEED_DIR/06-strengths.ndjson" \
  "$SEED_DIR/07-projects.ndjson" \
  > "$MERGED"

TOTAL=$(wc -l < "$MERGED" | tr -d ' ')
echo "==> Importing $TOTAL documents into dataset: $DATASET"

npx sanity dataset import "$MERGED" "$DATASET" --replace

echo "==> Cleaning up..."
rm "$MERGED"

echo ""
echo "Done. Open Sanity Studio to verify all content types are populated."
