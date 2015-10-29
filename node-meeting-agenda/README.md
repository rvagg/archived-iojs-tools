# node-meeting-agenda

**Generate an agenda for a Node.js working group based on GitHub issue labels**

Given a GitHub label name, generate a Markdown formatted agenda for a meeting where each issue tagged with the label represents an agenda item.

## Example

```text
$ node-meeting-agenda lts-agenda
### nodejs/node-v0.x-archive

* Deprecate Array#values() in 0.12.x [#25877](https://github.com/nodejs/node-v0.x-archive/issues/25877)
* Deprecate smalloc in v0.12 [#25784](https://github.com/nodejs/node-v0.x-archive/issues/25784)

### nodejs/LTS

* tls: make server not use DHE in less than 1014 bits [#49](https://github.com/nodejs/LTS/issues/49)
* Charter this [#48](https://github.com/nodejs/LTS/issues/48)
* npm in 0.10 LTS [#37](https://github.com/nodejs/LTS/issues/37)
* npm LTS [#14](https://github.com/nodejs/LTS/issues/14)
* Breaking changes between v0.12.x and next LTS releases cycle [#10](https://github.com/nodejs/LTS/issues/10)
```

## License

**node-meeting-agenda** is Copyright (c) 2015 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.