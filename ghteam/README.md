# ghteam

**Print out metadata about Node.js GitHub Teams**

## Examples

```text
$ ghteam list nodejs
addon-api (nodejs/addon-api)
api (nodejs/api)
benchmarking (nodejs/benchmarking)
Bots (nodejs/bots)
build (nodejs/build)
CI (nodejs/ci)
codeandlearn (nodejs/codeandlearn)
collaboration (nodejs/collaboration)
Collaborators (nodejs/collaborators)
...
```

Supports 4 simple commands:

* `ghteam list <org>` - list all teams in `<org>`
* `ghteam get <org>/<team>` - show basic info for `<org>/<team>`
* `ghteam members <org>/<team>` - list GitHub id's for all team members
* `ghteam email <org>/<team>` - lookup email addresses for all team members based on Node.js' current list of Collaborators.
