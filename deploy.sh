#!/bin/bash
git init
npm install
git add .
git commit -m "Initial commit"
gh repo create Letify-Realty --public --source=. --remote=origin
git push -u origin main
