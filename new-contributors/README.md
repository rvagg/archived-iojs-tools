new-contributors
================

**Generate a list of recent (possible) new contributors to a GitHub project**

_(Extracted from http://github.com/rvagg/iojs-tools)_

## Usage: `new-contributors [--days|-d <days>] [org/repo]

The default number of days of history to inspect is `7`, this can be changed with the `--days` (or `-d`) argument.

The default organisation and repository pair is `node/nodejs` but this can be overridden by supplying the pair as an argument, e.g: `new-contributors Level/level`.

`new-contributors` will load the git history of the repository in the current working directory, collecting email addresses of contributors up to `<days>` ago. It will also attempt to load a `.mailmap` file as it existed `<days>` ago, if it exists. Pull requests created since `<days>` ago are then analysed and the git email addresses of each of the contributors are compared to the existing contributors as per the git log and and `.mailmap` entries. Any addresses that are new indicate a possible new contributor. The output consists of a list of pull requests and the names and addresses of the authors.

## Example

```
$ new-contributors --days 4
Loaded 4 days old /Users/rvagg/git/nodejs/node/.mailmap with 159 entries...
Found 884 email addresses in git log up to 4 days ago for /Users/rvagg/git/nodejs/node...
Checking 21 pull requests for nodejs/node...

New contributors for the last 4 days:

NUMBER CONTACT                           TITLE                                                           URL
#4269  Martin von Gagern <re@dact.ed>    Fix deprecation message for ErrnoException                      https://github.com/nodejs/node/pull/4269
#4263  Hideki Yamamura <re@dact.ed>      doc: fix improper http.get sample code in http.markdown         https://github.com/nodejs/node/pull/4263
#4234  Vitor Cortez <re@dact.ed>         doc: clarify explanation of first stream section                https://github.com/nodejs/node/pull/4234
#4231  Vladimir Krivosheev <re@dact.ed>  v8 remote debug: export BreakEvent, BreakPoint and CompileEvent https://github.com/nodejs/node/pull/4231
```


## License

**new-contributors** is Copyright (c) 2015 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.