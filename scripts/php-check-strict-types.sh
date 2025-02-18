#!/bin/bash

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Get the list of new files created between BASE_BRANCH and the current branch
new_files=$(git diff --name-only --diff-filter=A origin/"$BASE_BRANCH" "$CURRENT_BRANCH")

# Check if each new PHP file starts with 'declare(strict_types=1);'
for file in $new_files; do
    # Skip test files
    if [[ $file == *Test.php ]]; then
        continue
    fi

    if [[ $file == *.php ]]; then
        if ! grep -qs '^declare(strict_types=1);' "$file"; then
            echo "Error: New PHP file $file does not start with 'declare(strict_types=1);'."
            exit 1
        fi
    fi
done
