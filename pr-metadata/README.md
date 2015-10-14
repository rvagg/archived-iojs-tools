# pr-metadata

**Print out metadata that can be copied and pasted into a commit message, based on Node.js core repository practice**

Provides a `PR-URL` and `Reviewed-By` lines as required by Node.js core.

## Examples

```text
$ pr-metadata https://github.com/nodejs/node/pull/3353
PR-URL: https://github.com/nodejs/node/pull/3353
Reviewed-By: Colin Ihrig <cjihrig@gmail.com>
Reviewed-By: Rich Trott <rtrott@gmail.com>
```

In this example, the full pull request URL is given to the `pr-metadata` command, it decodes it and provides 3 lines that can be copied into a commit message. The URL is obvious and the reviewers are pulled from the comments in the PR where an `LGTM` is given (case insensitive).

You can provide only the PR number:

```
$ pr-metadata 3353
PR-URL: https://github.com/nodejs/node/pull/3353
Reviewed-By: Colin Ihrig <cjihrig@gmail.com>
Reviewed-By: Rich Trott <rtrott@gmail.com>
```

Or, if you provide nothing at all, it'll make assumptions based on the current branch of your current repository (in the working directory) and look for pull requests for that branch on the upstream repository:

```
# Currently on the 'tsc-meeting-minutes-2015-09-30' branch for which I have a PR active from my fork to upstream
$ pr-metadata
PR-URL: https://github.com/nodejs/node/pull/3235
Reviewed-By: Sakthipriyan Vairamani <thechargingvolcano@gmail.com>
```

Reviewers are translated from GitHub usernames to full details by using the Node.js README, this doesn't scale beyond Node.js core and where it can't determine full details it'll just use the GitHub username.
