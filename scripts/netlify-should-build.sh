#!/usr/bin/env bash
#
# Netlify build gate — decides whether a push deserves a deploy.
#
# Netlify runs this as the [build] "ignore" command and reads the exit code:
#   exit 0  ->  SKIP the build. Nothing deploys, the live site is untouched.
#   exit 1  ->  BUILD. The current main deploys.
#
# Why this exists: the site editor at /admin commits to main on every single
# save. Without this gate, editing six pages costs six deploys. With it, those
# saves pile up in GitHub and cost nothing, and one "Publish Site" save at the
# end deploys all of them together.
#
# Two paths count as "editor work": content/ holds the page text, and
# images/uploads/ is where the editor's photo uploads land (media_folder in
# admin/config.yml). Decap commits an uploaded photo separately from the entry
# that references it, so both have to be skippable or every photo costs a
# deploy on its own.
#
# The rules, in order:
#   1. Anything changed outside those two  ->  BUILD.
#      That's HTML, CSS, JS, config — developer work, always deploy it.
#   2. content/publish.json changed        ->  BUILD.
#      That's the editor pressing Publish.
#   3. Only editor work changed            ->  SKIP.
#      Saved text and photos, waiting to be published.
#
# Anything unexpected (no commit range, git failure) falls through to BUILD.
# A wasted deploy is a far smaller problem than a change that silently never
# ships.

set -uo pipefail

build()  { echo "BUILD: $1"; exit 1; }
skip()   { echo "SKIP: $1";  exit 0; }

: "${CACHED_COMMIT_REF:=}"
: "${COMMIT_REF:=}"

# First deploy, cleared cache, or a manual "Trigger deploy" from the Netlify
# dashboard — there's no previous commit to compare against.
if [ -z "$CACHED_COMMIT_REF" ] || [ -z "$COMMIT_REF" ]; then
  build "no previous deploy to compare against"
fi

if [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ]; then
  build "redeploy of the same commit"
fi

# Netlify clones shallowly, so the older commit may not be present. Deepen the
# history rather than guessing; if that fails, build.
if ! git cat-file -e "${CACHED_COMMIT_REF}^{commit}" 2>/dev/null; then
  git fetch --unshallow origin 2>/dev/null || git fetch --depth=100 origin 2>/dev/null || true
fi

CHANGED=$(git diff --name-only "$CACHED_COMMIT_REF" "$COMMIT_REF" 2>/dev/null)
if [ $? -ne 0 ] || [ -z "$CHANGED" ]; then
  build "could not read the list of changed files"
fi

echo "Changed since last deploy:"
echo "$CHANGED" | sed 's/^/  /'

# Rule 2 — the Publish button.
if echo "$CHANGED" | grep -qx 'content/publish\.json'; then
  build "content/publish.json changed — editor pressed Publish"
fi

# Rule 1 — anything that isn't editor content.
if echo "$CHANGED" | grep -qvE '^(content/|images/uploads/)'; then
  build "files changed outside content/ and images/uploads/"
fi

# Rule 3 — saved editor work, not published yet.
skip "only unpublished editor content changed — waiting for a Publish Site save"
