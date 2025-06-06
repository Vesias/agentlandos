#!/bin/bash
set -e

# Merge all markdown files into docs/ALL_DOCS_MERGED.md sorted alphabetically
output_file="docs/ALL_DOCS_MERGED.md"
mkdir -p docs

# Create or truncate the output file
: > "$output_file"

while read -r filepath; do
  echo "# File: $filepath" >> "$output_file"
  echo >> "$output_file"
  cat "$filepath" >> "$output_file"
  echo -e "\n\n" >> "$output_file"
  echo "Merged $filepath"
done < <(find . -name '*.md' ! -path "./docs/ALL_DOCS_MERGED.md" | sort)

echo "All markdown files merged into $output_file"
