# v8-changelog

**A tool to make V8 changelogs more easily accessible and grokkable**

Prints output in Markdown format, can trim meaningless releases and restrict the versions to a provided semver range.

## Usage

**`v8-changelog [--trim] [--range <semver-range>]`**

* `--trim`: a lot of V8 "releases" have very little useful information, often just containing `Performance and stability improvements on all platforms.`. This option will remove all releases (except for the latest in the range) from the output where they don't contain anything interesting.

* `--range`: provide a semver range specifier (of the [node-semver](https://github.com/npm/node-semver) variety, like in package.json dependencies) to limit the output to only versions within that range.

## Example:

```
$ v8-changelog --range '>=4.2 <4.5' --trim
```

```
## 4.4.65 (2015-05-13)

  * Deprecate Isolate::New.
  * Factor out core of Array.forEach and .every, for use in TypedArrays
    (issue 3578).

## 4.4.63 (2015-05-11)

  * Let Runtime_GrowArrayElements accept non-Smi numbers as |key| (Chromium
    issue 485410).
  * Make one copy for all TypedArray methods (issue 4085).

## 4.4.62 (2015-05-09)

  * [turbofan] Fix handling of OsrLoopEntry in ControlReducer::ConnectNTL()
    (Chromium issue 485908).

...
```

## License

**v8-changelog** is Copyright (c) 2015 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.
