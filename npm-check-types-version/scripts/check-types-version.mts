import { readFileSync } from "node:fs";
import semver from "semver";

async function checkTypesVersions(): Promise<void> {
  const packageJsonPath = "./package.json";

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const allDeps = { ...dependencies, ...devDependencies };

    for (const [pkg, version] of Object.entries(allDeps)) {
      if (pkg.startsWith("@types/")) {
        const basePackage = pkg.replace("@types/", "");
        const baseVersion = allDeps[basePackage];

        if (!baseVersion) {
          console.warn(
            `⚠️ Warning: ${pkg} (${version}) の本体パッケージ ${basePackage} が見つかりません。スキップします。`
          );
          continue;
        }

        console.log(
          `🔍 Checking ${pkg} (${version}) against ${basePackage} (${baseVersion})`
        );

        // `semver.coerce` を使ってバージョン比較
        const coercedVersion = semver.coerce(version as string);
        const coercedBaseVersion = semver.coerce(baseVersion as string);

        if (!coercedVersion || !coercedBaseVersion) {
          console.warn(
            `⚠️ Warning: ${pkg} (${version}) または ${basePackage} (${baseVersion}) のバージョンが解析できません。スキップします。`
          );
          continue;
        }

        if (semver.gt(coercedVersion, coercedBaseVersion)) {
          console.error(
            `❌ @types パッケージ (${pkg}: ${version}) が本体 (${basePackage}: ${baseVersion}) より新しいためエラー`
          );
          process.exit(1);
        }
      }
    }

    console.log("✅ @types のバージョンチェックを通過しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

checkTypesVersions();
