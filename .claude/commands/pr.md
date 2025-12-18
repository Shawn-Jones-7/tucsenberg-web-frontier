# Create Pull Request

Automate the Git PR workflow: commit, push, and create PR.

## Execution Steps

1. **Verify Branch**: Ensure NOT on `main` branch. If on `main`, abort with error message.

2. **Check Changes**: Run `git status` to identify staged/unstaged changes.
   - If no changes, abort with "No changes to commit".

3. **Stage Changes**: Run `git add -A` to stage all changes.

4. **Generate Commit Message**: Analyze changes and generate a conventional commit message:
   - Format: `<type>(<scope>): <description>`
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`
   - Keep description concise (≤72 chars)

5. **Commit**: Execute `git commit -m "<message>"`.

6. **Push**: Execute `git push -u origin <current-branch>`.

7. **Create PR**: Execute `gh pr create --base main --fill` or with custom title/body.
   - If `--auto` flag requested, add `--auto` for auto-merge after CI passes.

8. **Return**: Output the PR URL for user reference.

## Options

- `--auto`: Enable auto-merge (requires CI to pass)
- `--draft`: Create as draft PR

## Example Usage

```
/pr                    # Standard PR flow
/pr --auto             # PR with auto-merge enabled
/pr --draft            # Create draft PR
```
