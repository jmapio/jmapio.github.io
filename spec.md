---
layout: default
permalink: /spec.html
title: JMAP Specifications
custom: true
---

# JMAP: The Specs

The specifications for the core JMAP protocol and access to mail stores using JMAP have been finalised and published. The [JMAP working group](https://datatracker.ietf.org/wg/jmap/about/) is currently working on the calendars and sharing specs, with tasks and contacts expected to follow.

## Finished

* [The core protocol](spec-core.html) [[RFC 8620](https://tools.ietf.org/html/rfc8620)]
* [JMAP Mail](spec-mail.html) [[RFC 8621](https://tools.ietf.org/html/rfc8621)]
* A JMAP Subprotocol for WebSocket [[RFC8887](https://www.rfc-editor.org/rfc/rfc8887.html)]
* JMAP Blob Management Extension [[RFC9404](https://www.rfc-editor.org/rfc/rfc9404.html)]

## In development

These specs are not yet final and will change before publication. There are undoubtably edge cases that are not yet covered. If you find one, please email [jmap@ietf.org](mailto:jmap@ietf.org) or make a pull request on GitHub if you have a proposed fix.

* [JMAP Calendars](spec-calendars.html)
* [JMAP Sharing](spec-sharing.html)
* [JMAP Contacts](spec-contacts.html)
* [JMAP Tasks](spec-tasks.html)
* [JMAP Quotas](spec-quotas.html)

## Data formats

JMAP was designed in conjunction with new JSON-based file formats for contacts and calendars, which can also be used standalone or in other protocols.

JMAP Calendars uses [JSCalendar (RFC 8984)](https://tools.ietf.org/html/rfc8984) as the data format for events.

JMAP Contacts will use [JSContact (currently under development)](https://datatracker.ietf.org/doc/draft-ietf-jmap-jscontact/) as the data format for contacts.
