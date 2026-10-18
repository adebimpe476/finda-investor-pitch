#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail

REPO_NAME="finda-investor-pitch"
EXPECTED_GITHUB="adebimpe476"
ZIP_FILE="$HOME/storage/downloads/FINDA-Cinematic-Investor-Pitch.zip"
ALT_ZIP="$HOME/Downloads/FINDA-Cinematic-Investor-Pitch.zip"
PUBLISH_HOME="$HOME/finda-investor-pitch-publish"

say() { printf '\n\033[1;32mFINDA PITCH\033[0m %s\n' "$*"; }
fail() { printf '\n\033[1;31mSTOP\033[0m %s\n' "$*" >&2; exit 1; }

say "Creating a brand-new GitHub website. No changes will be made to your GitLab showroom or existing FINDA repository."
if [ ! -f "$ZIP_FILE" ] && [ -f "$ALT_ZIP" ]; then ZIP_FILE="$ALT_ZIP"; fi
[ -f "$ZIP_FILE" ] || fail "Download FINDA-Cinematic-Investor-Pitch.zip into your Android Downloads folder first."
command -v pkg >/dev/null 2>&1 || fail "This installer is for Termux on Android."

say "Checking required packages (GitHub CLI, git, unzip)..."
for package in git unzip gh; do
  if ! command -v "$package" >/dev/null 2>&1; then
    say "Installing $package through Termux package manager..."
    pkg install -y "$package" || fail "Could not install $package. Check your connection and Termux package repository."
  fi
done

if [ -e "$PUBLISH_HOME" ]; then
  fail "The safe temporary folder $PUBLISH_HOME already exists. This script will not overwrite it. Move or rename it yourself if you intend to start again."
fi

say "Signing in to GitHub (browser-based device login if necessary)."
if ! gh auth status -h github.com >/dev/null 2>&1; then
  gh auth login -h github.com --web -p https || fail "GitHub authentication was not completed."
fi
OWNER="$(gh api user --jq .login 2>/dev/null || true)"
[ "$OWNER" = "$EXPECTED_GITHUB" ] || fail "You are signed into GitHub as '$OWNER', but the FINDA GitHub account is '$EXPECTED_GITHUB'. Switch to the correct GitHub account before continuing."

if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  fail "A repository with this name already exists. No existing repository was changed. Check https://github.com/$OWNER/$REPO_NAME first."
fi

mkdir -p "$PUBLISH_HOME"
unzip -q "$ZIP_FILE" -d "$PUBLISH_HOME"
WORKDIR="$PUBLISH_HOME/FINDA-Cinematic-Investor-Pitch"
[ -f "$WORKDIR/index.html" ] && [ -f "$WORKDIR/styles.css" ] && [ -f "$WORKDIR/script.js" ] && [ -f "$WORKDIR/.github/workflows/deploy.yml" ] || fail "Pitch ZIP content is incomplete. Download the correct ZIP and try again after removing the incomplete temporary folder."

say "Preparing independent source and deployment workflow."
cd "$WORKDIR"
git init -q -b main
git config user.name "Akeem Adebimpe"
git config user.email "adebimpe476@gmail.com"
git add -A
git commit -qm "Build cinematic FINDA investor presentation"
gh auth setup-git >/dev/null 2>&1 || true

say "Publishing new public GitHub repository: $OWNER/$REPO_NAME"
gh repo create "$OWNER/$REPO_NAME" --public --source=. --remote=origin --push \
  || fail "GitHub could not create/push the repository. The source is saved in $WORKDIR; your other FINDA projects are unchanged."

say "Enabling GitHub Pages for this NEW repository."
if gh api -X POST "repos/$OWNER/$REPO_NAME/pages" -f 'build_type=workflow' >/dev/null 2>&1; then
  say "GitHub Pages configured."
else
  say "Automatic Pages setup could not be confirmed. Open https://github.com/$OWNER/$REPO_NAME/settings/pages and choose 'GitHub Actions' under Build and deployment."
fi

# Trigger the workflow after Pages is enabled; first push may have run before configuration.
if gh workflow run deploy.yml --repo "$OWNER/$REPO_NAME" --ref main >/dev/null 2>&1; then
  say "Started the GitHub Pages deployment workflow."
else
  say "The push succeeded. If the site does not become available, open Actions and click 'Run workflow'."
fi

say "Source: https://github.com/$OWNER/$REPO_NAME"
say "Expected public investor URL once Actions succeeds: https://$OWNER.github.io/$REPO_NAME/"
say "Verify the new URL from a Chrome incognito window before sending it to investors."
