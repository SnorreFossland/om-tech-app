#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT_FILE="$ROOT_DIR/prompts/batch_processes_prompt.md"
PROCESS_FILE="$ROOT_DIR/prompts/processes_list.md"
SPECS_DIR="$ROOT_DIR/specs"
DATE_TAG=$(date +"%Y-%m-%d %H:%M:%S")

command -v specify >/dev/null 2>&1 || { echo "Error: 'specify' not installed."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Error: 'git' not found."; exit 1; }

mkdir -p "$SPECS_DIR"

echo "=== Running SpecKit incremental generation ==="
CHANGED_PROCESSES=()

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  DIFF=$(git diff --unified=0 -- "$PROCESS_FILE" | grep '^@@' || true)
  if [ -n "$DIFF" ]; then
    CHANGED_PROCESSES=($(git diff -- "$PROCESS_FILE" | grep '^###' | sed 's/^### //'))
    echo "Changed processes: ${CHANGED_PROCESSES[*]}"
  else
    echo "No process changes detected. Full generation."
  fi
else
  echo "No git context. Full generation."
fi

if [ ${#CHANGED_PROCESSES[@]} -eq 0 ]; then
  specify run -f "$PROMPT_FILE"
else
  TMP_PROMPT=$(mktemp)
  cp "$PROMPT_FILE" "$TMP_PROMPT"
  echo "" >> "$TMP_PROMPT"
  echo "## FILTERED PROCESSES" >> "$TMP_PROMPT"
  echo "Include only:" >> "$TMP_PROMPT"
  for p in "${CHANGED_PROCESSES[@]}"; do
    echo "- $p" >> "$TMP_PROMPT"
  done
  specify run -f "$TMP_PROMPT"
  rm -f "$TMP_PROMPT"
fi

git add "$SPECS_DIR"
git commit -m "Generated specs on $DATE_TAG" || echo "No new changes."
