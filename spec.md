---
layout: default
permalink: /spec.html
title: JMAP Specifications
custom: true
---

# JMAP: The Specs

The specifications for the core JMAP protocol and access to mail and contacts stores using JMAP have been finalised and published. The [JMAP working group](https://datatracker.ietf.org/wg/jmap/about/) is currently working on the calendars specs.

## Core

These specifications define the core sync protocol and extensions that are useful no matter what data type you might be syncing.

* [The core JMAP protocol (RFC 8620)](https://www.rfc-editor.org/rfc/rfc8620.html)
* [VAPID for JMAP Push (RFC 9749)](https://www.rfc-editor.org/rfc/rfc9749.html)
* [JMAP Sharing (RFC 9670)](https://www.rfc-editor.org/rfc/rfc9670.html)
* [JMAP via WebSocket (RFC 8887)](https://www.rfc-editor.org/rfc/rfc8887.html)
* [JMAP Quotas (RFC 9425)](https://www.rfc-editor.org/rfc/rfc9425.html)
* [JMAP Blob Management (RFC 9404)](https://www.rfc-editor.org/rfc/rfc9404.html)

## Mail

* [JMAP Mail (RFC 8621)](https://www.rfc-editor.org/rfc/rfc8621.html)
* [JMAP Sieve Scripts Management (RFC 9661)](https://www.rfc-editor.org/rfc/rfc9661.html)
* [JMAP MDN Handling (RFC 9007)](https://www.rfc-editor.org/rfc/rfc9007.html)
* [JMAP S/MIME Signature Verification (RFC 9219)](https://www.rfc-editor.org/rfc/rfc9219.html)

## Contacts

* [JMAP Contacts (RFC 9610)](https://www.rfc-editor.org/rfc/rfc9610.html)

## Calendars

This spec is not yet final and may change before publication. If you find any issues, please email [jmap@ietf.org](mailto:jmap@ietf.org) or make a pull request on GitHub if you have a proposed fix.

* [JMAP Calendars (in progress)](https://www.ietf.org/archive/id/draft-ietf-jmap-calendars-26.html)

## Data formats

JMAP was designed in conjunction with new JSON-based file formats for contacts and calendars, which can also be used standalone or in other protocols.

JMAP Contacts uses [JSContact (RFC9553)](https://www.rfc-editor.org/rfc/rfc9553.html) as the data format for contacts.

JMAP Calendars uses [JSCalendar 2.0 (in progress)](https://www.ietf.org/archive/id/draft-ietf-calext-jscalendarbis-15.html) as the data format for events.
