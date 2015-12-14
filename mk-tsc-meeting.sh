#!/bin/bash

# only works on Linux or OSX with coreutils installed

# if running OSX with coreutils installed
PATH="/usr/local/opt/coreutils/libexec/gnubin:$PATH"
__dirname="$(CDPATH= cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
meeting_date=$(TZ=UTC date --date="Wednesday 8pm" --rfc-3339=seconds)
common_fmt="%a %d-%b-%Y %R"
utc_short=$(TZ=UTC date --date="$meeting_date" +"%F")

echo -n "Previous Meeting Google Docs URL: "
read prev_doc_url
echo -n "This Meeting Google Docs URL: "
read curr_doc_url

cat << EOF

Node Foundation CTC Meeting $utc_short

--------------------------------------

## Time

**UTC $(TZ=UTC date --date="$meeting_date" +"$common_fmt")**:

* San Francisco: $(TZ=America/Los_Angeles date --date="$meeting_date" +"$common_fmt")
* New York: $(TZ=America/New_York date --date="$meeting_date" +"$common_fmt")
* Amsterdam: $(TZ=Europe/Amsterdam date --date="$meeting_date" +"$common_fmt")
* Moscow: $(TZ=Europe/Moscow date --date="$meeting_date" +"$common_fmt")
* Sydney: $(TZ=Australia/Sydney date --date="$meeting_date" +"$common_fmt")
* Tokyo: $(TZ=Asia/Tokyo date --date="$meeting_date" +"$common_fmt")

Or in your local time:
* http://www.timeanddate.com/worldclock/fixedtime.html?msg=Node+Foundation+CTC+Meeting+${utc_short}&iso=$(TZ=UTC date --date="$meeting_date" +"%Y%m%dT20")
* or http://www.wolframalpha.com/input/?i=8pm+UTC%2C+$(TZ=UTC date --date="$meeting_date" +"%b+%d%%2C+%Y")+in+local+time

## Links

* **Minutes Google Doc**: <${curr_doc_url}>
* _Previous Minutes Google Doc: <${prev_doc_url}>_

## Agenda

Extracted from **ctc-agenda** labelled issues and pull requests from the **nodejs org** prior to the meeting.

$(cd ${__dirname}/node-meeting-agenda/ && node . ctc-agenda)

## Invited

* @bnoordhuis (CTC)
* @chrisdickinson (CTC)
* @cjihrig (CTC)
* @domenic (observer)
* @Fishrock123 (CTC)
* @indutny (CTC)
* @jasnell (CTC)
* @mhdawson (observer)
* @misterdjules (CTC)
* @mikeal (observer)
* @mscdex (CTC)
* @orangemocha (CTC)
* @piscisaureus (CTC)
* @rvagg (CTC)
* @shigeki (CTC)
* @srl295 (observer)
* @trevnorris (CTC)

## Notes

The agenda comes from issues labelled with \`ctc-agenda\` across **all of the repositories in the nodejs org**. Please label any additional issues that should be on the agenda before the meeting starts. I'm using a [tool](https://github.com/rvagg/iojs-tools/tree/master/meeting-agenda) to fetch the list so it's not a big deal to collate.

## Joining the meeting

Uberconference; participants should have the link & numbers, contact me if you don't.

EOF
