import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { executeBounded, worktreeCommandEnvironment, sandboxProfile, sourceSnapshot, SANDBOX_PROBE } from "./integration.ts";

// Run explicitly on the macOS host, not inside another sandbox. This starts no
// model processes and uses only a disposable, uncommitted scratch Git repo.
test("native Git works with local temp/cache while metadata and network remain protected", { skip: process.platform !== "darwin" }, async () => {
  const parent = await mkdtemp(join(tmpdir(), "integration-git-regression-"));
  const repo = join(parent, "scratch"); await mkdir(repo);
  const run = async (command, args, options = {}) => {
    const result = await executeBounded({ command, args, cwd: repo, timeoutMs: 10000, maxOutputBytes: 1048576, ...options });
    console.log(JSON.stringify({ command, args, exitCode: result.exitCode, reason: result.reason }));
    assert.equal(result.reason, null, result.stderr);
    assert.equal(result.exitCode, 0, result.stderr);
    return result;
  };
  const located = await run("/usr/bin/xcrun", ["--no-cache", "--find", "git"]);
  const nativeGit = located.stdout.trim(); assert.notEqual(nativeGit, "/usr/bin/git");
  await run(nativeGit, ["init", "--quiet"]);
  await mkdir(join(repo, ".integration-tmp"));
  const env = await worktreeCommandEnvironment(repo, nativeGit);
  const profilePath = join(parent, "validation.sb");
  await writeFile(profilePath, sandboxProfile(repo, [join(repo, ".git")]));
  const metadataBefore = await sourceSnapshot(join(repo, ".git"));
  const sandboxed = (command, args) => run("/usr/bin/sandbox-exec", ["-f", profilePath, command, ...args], { env });
  await sandboxed(process.execPath, ["-e", SANDBOX_PROBE, join(env.TMPDIR, "allowed.txt"), join(parent, "outside-write-denied.txt"), join(repo, ".git/write-denied.txt")]);
  const shellPath = await sandboxed("/bin/zsh", ["-c", "command -v git"]);
  assert.equal(shellPath.stdout.trim(), nativeGit);
  const environment = await sandboxed(process.execPath, ["-e", "console.log(JSON.stringify([process.env.TMPDIR,process.env.TMP,process.env.TEMP,process.env.XDG_CACHE_HOME,process.env.GIT_OPTIONAL_LOCKS]))"]);
  assert.deepEqual(JSON.parse(environment.stdout), [env.TMPDIR, env.TMP, env.TEMP, env.XDG_CACHE_HOME, "0"]);
  for (let round = 0; round < 2; round++) {
    const status = await sandboxed(nativeGit, ["--no-optional-locks", "status", "--porcelain"]);
    assert.equal(status.stderr, "", "Native Git must not emit xcrun/temp-cache diagnostics");
    const diff = await sandboxed(nativeGit, ["--no-optional-locks", "diff", "--no-ext-diff", "--no-textconv", "--"]);
    assert.equal(diff.stderr, "");
  }
  assert.deepEqual(await sourceSnapshot(join(repo, ".git")), metadataBefore, "Read-only Git commands changed metadata");
  // No initial commit, index staging, configuration/security changes or cleanup
  // of the failed real worktree is performed by this regression.
  assert.ok((await readFile(join(repo, ".git/HEAD"), "utf8")).startsWith("ref:"));
});
