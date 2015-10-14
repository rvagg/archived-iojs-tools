# iojs-tools

**A collection of utilities I use to help with managing io.js business**

## tsc-meeting-agenda

A utility to collect the list of issues & PRs that have been labelled with `tsc-agenda` in each of the relevant repos: nodejs/io.js, nodejs/node, joyent/node. This list forms the agenda of TSC meetings.

## new-contrib-check

A work-in-progress tool to generate a list of new contributors to io.js, not currently used for anything yet but the plan is to use it to help with a welcoming procedure (finding the list being the automated bit, the human bit coming afterwards).

## v8-changelog

A tool to make V8 changelogs more easily accessible and grokkable, prints output in Markdown format, can trim meaningless releases and restrict the versions to a provided semver range.

## pr-metadata

Print out metadata that can be copied and pasted into a commit message, based on Node.js core repository practice

## _Also_

Projects graduating out of this repo include:

**[changelog-maker](https://github.com/rvagg/changelog-maker)** is also part of this collection but is published to npm and is maintained in a separate repo.

**[branch-diff](https://github.com/rvagg/branch-diff)** uses a lot of **changelog-maker** code to provide similar output but is for preparing a list of commits that are on one branch but not on another by smartly using Node.js core style metadata to remove duplicates (a smart `git log b1..b2`).

## License & Copyright

Code in this repository is Copyright (c) 2015 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.
