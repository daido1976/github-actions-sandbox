#!/bin/bash

# ベースブランチと現在の HEAD 間で新規作成されたファイルのみを取得
new_files=$(git diff --name-status origin/"$BASE_BRANCH"..HEAD | awk '$1 == "A" { print $2 }')

# 新規作成されたPHPファイルがdeclare(strict_types=1);を含んでいるか確認
for file in $new_files; do
    # テストファイルはチェックをスキップ
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
