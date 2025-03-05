import { readFile } from "node:fs/promises";
import path from "node:path";
import semver from "semver";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

async function checkTypesVersions(): Promise<void> {
  const packageJsonPath = path.resolve(import.meta.dirname, "../package.json");

  try {
    const fileContent = await readFile(packageJsonPath, "utf-8");
    const packageJson: PackageJson = JSON.parse(fileContent);

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const allDeps = {
      ...dependencies,
      ...devDependencies,
    };

    const typePackages = Object.entries(allDeps)
      .filter(([pkg]) => pkg.startsWith("@types/"))
      .map(([pkg, version]) => {
        const basePackage = pkg.replace("@types/", "");
        return {
          pkg,
          version,
          basePackage,
          baseVersion: allDeps[basePackage],
        };
      });

    for (const { pkg, version, basePackage, baseVersion } of typePackages) {
      if (!baseVersion) {
        console.warn(
          `⚠️ Warning: ${pkg} (${version}) の本体パッケージ ${basePackage} が見つかりません。スキップします。`
        );
        continue;
      }

      console.log(
        `🔍 Checking ${pkg} (${version}) against ${basePackage} (${baseVersion})`
      );

      const coercedVersion = semver.coerce(version);
      const coercedBaseVersion = semver.coerce(baseVersion);

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

    console.log("✅ @types のバージョンチェックを通過しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

checkTypesVersions();
