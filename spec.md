---
layout: article
permalink: /spec/index.html
title: JMAP Specifications
description: >-
    The specifications for the core JMAP protocol and access to mail and
    contacts stores using JMAP have been finalised and published.
hero:
    eyebrow: Specs
    title: JMAP RFC
    sub: >-
        The specifications for the core JMAP protocol and access to mail and
        contacts stores using JMAP have been finalised and published. The JMAP 
        working group is currently working on the calendars specs.
    links:
        - href: https://datatracker.ietf.org/wg/jmap/about/
          label: JMAP working group
specs:
    - label: Calendars
      href: /spec/calendars/
    - label: Contacts
      href: /spec/contacts/
    - label: Keywords
      href: /spec/keywords/
    - label: OAuth
      href: /spec/oauth/
    - label: RFC 8620
      href: /spec/rfc8620/
    - label: RFC 8621
      href: /spec/rfc8621/
    - label: RFC 9610
      href: /spec/rfc9610/
    - label: RFC 9670
      href: /spec/rfc9670/
    - label: Sharing
      href: /spec/sharing/
---

## Generated from XML

<ul>
{%- for item in page.specs -%}
<li><a href="{{ item.href | relative_url }}">{{ item.label }}</a></li>
{% endfor %}
</ul>

## Core

These specifications define the core sync protocol and extensions that are
useful no matter what data type you might be syncing.

- [The core JMAP protocol (RFC 8620)](https://www.rfc-editor.org/rfc/rfc8620.html)
- [VAPID for JMAP Push (RFC 9749)](https://www.rfc-editor.org/rfc/rfc9749.html)
- [JMAP Sharing (RFC 9670)](https://www.rfc-editor.org/rfc/rfc9670.html)
- [JMAP via WebSocket (RFC 8887)](https://www.rfc-editor.org/rfc/rfc8887.html)
- [JMAP Quotas (RFC 9425)](https://www.rfc-editor.org/rfc/rfc9425.html)
- [JMAP Blob Management (RFC 9404)](https://www.rfc-editor.org/rfc/rfc9404.html)

## Mail

- [JMAP Mail (RFC 8621)](https://www.rfc-editor.org/rfc/rfc8621.html)
- [JMAP Sieve Scripts Management (RFC 9661)](https://www.rfc-editor.org/rfc/rfc9661.html)
- [JMAP MDN Handling (RFC 9007)](https://www.rfc-editor.org/rfc/rfc9007.html)
- [JMAP S/MIME Signature Verification (RFC 9219)](https://www.rfc-editor.org/rfc/rfc9219.html)

## Contacts

- [JMAP Contacts (RFC 9610)](https://www.rfc-editor.org/rfc/rfc9610.html)

## Calendars

This spec is not yet final and may change before publication. If you find any
issues, please email [jmap@ietf.org](mailto:jmap@ietf.org) or make a pull
request on GitHub if you have a proposed fix.

- [JMAP Calendars (in progress)](https://www.ietf.org/archive/id/draft-ietf-jmap-calendars-26.html)

## Data formats

JMAP was designed in conjunction with new JSON-based file formats for contacts
and calendars, which can also be used standalone or in other protocols.

JMAP Contacts uses
[JSContact (RFC9553)](https://www.rfc-editor.org/rfc/rfc9553.html) as the data
format for contacts.

JMAP Calendars uses
[JSCalendar 2.0 (in progress)](https://www.ietf.org/archive/id/draft-ietf-calext-jscalendarbis-15.html)
as the data format for events.
