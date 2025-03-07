#!/bin/bash

# Exit on error
set -e

# Build the site
npm run deploy

# Navigate to the build directory
cd build

# Initialize a new git repository
git init
git add .

# Commit the changes
git commit -m "Deploy to GitHub Pages"

# Force push to the gh-pages branch
git push -f git@github.com:yourusername/comentarios-site-svelte.git main:gh-pages

# Return to the project root
cd ..

echo "Successfully deployed to GitHub Pages!"
