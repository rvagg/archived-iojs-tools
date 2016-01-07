# iojs-tools

**A collection of utilities I use to help with managing io.js business**

## v8-changelog

A tool to make V8 changelogs more easily accessible and grokkable, prints output in Markdown format, can trim meaningless releases and restrict the versions to a provided semver range.

## pr-metadata

Print out metadata that can be copied and pasted into a commit message, based on Node.js core repository practice

## _Also_

Projects graduating out of this repo include:

**[changelog-maker](https://github.com/rvagg/changelog-maker)** is also part of this collection but is published to npm and is maintained in a separate repo.

**[branch-diff](https://github.com/rvagg/branch-diff)** uses a lot of **changelog-maker** code to provide similar output but is for preparing a list of commits that are on one branch but not on another by smartly using Node.js core style metadata to remove duplicates (a smart `git log b1..b2`).

**[new-contributors](https://github.com/rvagg/new-contributors)** generates a list of recent (possible) new contributors to a GitHub project. Built for nodejs/node but can be used against any GitHub repository to look for new contributors so you can serve them cake and tea.

**[node-meeting-agenda](https://github.com/rvagg/node-meeting-agenda)** is a utility to collect the list of issues & PRs that have been labelled with a specific label in each of repos across the nodejs GitHub org for the purpose of building a group meeting agenda.

**[make-node-meeting](https://github.com/rvagg/make-node-meeting)** is a utility that generates a text for a GitHub issue announcing a Node.js working group meeting. Can be configured for different working group needs.

## License & Copyright

Code in this repository is Copyright (c) 2016 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.
