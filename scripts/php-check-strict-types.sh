#!/bin/bash

# ベースブランチと現在の HEAD 間で新規作成されたファイルのみを取得
new_files=$(git diff --name-status origin/"$BASE_BRANCH"..HEAD | awk '$1 == "A" { print $2 }')

# 新規作成されたPHPファイルに対して PHP-CS-Fixer を実行
for file in $new_files; do
    # テストファイルはチェックをスキップ
    if [[ $file == *Test.php ]]; then
        continue
    fi

    if [[ $file == *.php ]]; then
        php-cs-fixer fix --rules=declare_strict_types "$file"
    fi
done
