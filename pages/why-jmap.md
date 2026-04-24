---
layout: why-jmap
permalink: /why-jmap/index.html
title: Why JMAP?
description:
    'The technical and practical argument for replacing IMAP with JMAP, grounded
    in benchmarks and real implementation experience.'
hero:
    eyebrow: The case for JMAP
    eyebrow_icon: presentation-chart-line
    title: Why JMAP?
    sub: >-
        IMAP is not ageing well. It is slow and inefficient, and expensive and 
        difficult to implement and deploy. JMAP makes it vastly easier to build
        and deploy modern email apps, reduce server costs, and increase
        performance and battery life.
faq:
    - question: What is JMAP?
      answer: |
          JMAP (JSON Meta Application Protocol) is an open IETF standard for
          synchronising mail, calendars, and contacts between a client and
          server. It replaces IMAP, CardDAV, and CalDAV with a single consistent
          protocol built on HTTPS and JSON, with efficient batch requests and
          real-time push updates built in.
    - question: Is JMAP a replacement for IMAP?
      answer: |
          Yes. JMAP covers everything IMAP does — reading, searching, moving,
          flagging, and even sending email — with a much cleaner and more
          efficient API. JMAP also replaces POP3, client-side SMTP, CardDAV,
          and CalDAV.

          JMAP does not replace server-to-server SMTP. Email servers still use
          SMTP to route messages between domains.
    - question: Which email providers support JMAP?
      answer: |
          **[Fastmail](https://www.fastmail.com)** is the largest JMAP provider
          and was instrumental in developing the standard — their web, desktop,
          and mobile clients all run on JMAP.

          **Stalwart Mail Server** is a modern open-source server with complete
          JMAP support. **Apache James** and **Cyrus IMAP** also both
          support JMAP.
    - question: Is JMAP stable enough to build on?
      answer: |
          Yes. RFC 8620 (Core), RFC 8621 (Mail), and RFC 9610 (Contacts) are
          published IETF standards and will not change in backwards-incompatible
          ways. Fastmail has been running their entire production email service
          on JMAP since 2019.
    - question: How does JMAP handle authentication?
      answer: |
          JMAP deliberately does not define its own authentication mechanism, it
          just uses standard HTTP authentication. In practice, that's often
          OAuth 2.0 with Bearer tokens. This means JMAP works with your existing
          identity infrastructure without any changes.
    - question: How does JMAP perform compared to IMAP?
      answer: |
          JMAP performs as well or better than IMAP in all tested scenarios.

          Modern IMAP with all extensions enabled can get a lot closer to JMAP's
          efficiency, but this requires both the client and server to implement
          the right extensions — which is rarely the case in practice.
---

## JMAP is simpler than IMAP

JMAP's layered design delegates complexity to existing components:

- **HTTP** handles transport security, compression, multiplexing, and
  authorisation via standard headers
- **JSON** handles encoding, eliminating the need for a custom parser (IMAP and
  SMTP both require complex bespoke parsers, CardDAV and CalDAV require this
  _and also_ wrap it in XML…)
- **Core JMAP** defines a small standard set of methods — `/get`, `/set`,
  `/query`, `/changes` — that work consistently across all data types
- **Application specs** (e.g., JMAP for Mail) define only the data types and
  semantics

The JMAP core and mail specifications together total just 51,000 words — less
than one fifth the size of the IMAP specification set. A simpler protocol that
uses existing infrastructure means software development is easier and cheaper,
and more attention can be spent on performance, security, and bug fixing.

During testing, a large number of bugs were encountered in every major IMAP
client. Many of these bugs would likely have been prevented with a simpler
protocol.

## Easier to deploy and manage

Because JMAP is based on HTTP, deploying, securing, and scaling JMAP is much
simpler than traditional email service endpoints. JMAP deployments can use all
existing HTTP infrastructure:

- **TLS termination** via NGINX, Caddy, or any reverse proxy — no special
  IMAP-aware configuration
- **Load balancing** at the HTTP request level (impossible with IMAP’s stateful
  TCP connections)
- **DDoS protection** via Cloudflare and similar services
- **Monitoring and logging** using the same tools as the rest of your HTTP
  infrastructure
- **Compression** via your HTTP proxy — no mail server code changes needed. IMAP
  requires explicit RFC 4978 support in the server, and doesn't support modern,
  more performant compression algorithms.

Many organisations also deploy corporate proxies and firewalls that block
outgoing TCP connections on unexpected ports. HTTP is almost always allowed.
JMAP works anywhere HTTP works.

## More features, built in

JMAP adds support for many features that are either missing or require fragile
extension support in IMAP. Every conformant JMAP server must support all of
these:

| Feature                   | JMAP                       | IMAP                                                                                      |
| ------------------------- | -------------------------- | ----------------------------------------------------------------------------------------- |
| Server push               | Built in (EventSource/SSE) | IDLE extension — single mailbox only. NOTIFY not supported by any large provider.         |
| Efficient sync            | State strings, built in    | CONDSTORE + QRESYNC — not supported by Gmail, Yahoo, or MS365.                            |
| Threads                   | Built in                   | THREAD extension. Not supported by any large provider. Gmail uses proprietary X-GM-THRID. |
| Labels / tags             | Built in                   | Not supported. Gmail uses proprietary X-GM-LABELS.                                        |
| Mobile push notifications | Built in                   | Proprietary Apple XAPPLEPUSHSERVICE. Not widely deployed.                                 |
| Move messages             | Built in                   | MOVE extension. Without it, clients need COPY + STORE + EXPUNGE, losing the UID.          |
| Method batching           | Built in                   | Not supported. Requires multiple round-trips.                                             |
| Vacation / Out of Office  | Built in                   | Not supported.                                                                            |

With IMAP, clients must support many different code paths depending on which
extensions a server happens to support. With JMAP, all users get the same
complete feature set.

## Better performance

JMAP is more efficient than IMAP, sometimes drastically so, particularly in
common scenarios where IMAP clients and servers don’t implement the necessary
IMAP extensions.

### Resync after restart

When a mail client is closed and reopened, it must synchronise with the server.
This test measured bandwidth consumed when restarting the mail client with
28,234 messages in the account:

| Client      | Average TCP connections | Traffic |
| ----------- | ----------------------- | ------- |
| JMAP        | 1                       | 13 KB   |
| Thunderbird | 2.4                     | 2100 KB |

Without CONDSTORE and QRESYNC support, IMAP clients must query the read/unread
flags on every message in the user’s entire mailbox at startup. This scales
linearly with inbox size. Thunderbird repeats this query every time the selected
mailbox changes.

### Attachment handling

IMAP and SMTP have a significant write amplification problem when sending email
with attachments. In testing, composing and sending a 20 MB attachment in
Outlook required **155 MB** of total bandwidth — the attachment was uploaded to
the server 5 separate times (draft auto-save, subject line edit, send, copy to
Sent, SMTP delivery). If the draft had been edited for longer, with more
auto-saves, it would have been even worse.

With JMAP, attachments are uploaded once. Forwarding an email with an attachment
requires no download at all — the blob ID is simply copied into the new message.

## Improved battery life

Battery testing showed a **2–3× reduction in battery usage** when switching to
JMAP. The dominant factor is push notifications: IMAP without proper push
support requires the device radio to wake periodically to poll the server, which
is a significant battery drain.

## Webmail support

IMAP cannot be used for webmail — it runs on raw TCP sockets not available to
browsers. Every webmail provider (e.g., Gmail, iCloud Mail, Outlook.com)
maintains a bespoke HTTP API service alongside their IMAP infrastructure. This
is expensive to design, build, and maintain.

Because JMAP runs over HTTP, JMAP can be used directly by webmail clients. The
Fastmail web client is built directly on Fastmail’s public JMAP API — including
full offline support, keeping the local database up to date via JMAP’s standard
`/changes` feed.

In an experiment, Claude Code (Opus 4.6) was prompted to write a generic
standalone JMAP webmail client — able to work with any JMAP server — with access
only to the JMAP Core and Mail specifications. In about 30 minutes of prompting,
it generated a working JMAP client in 2,100 lines of Rust with inbox, thread
view, multiple mailboxes, compose, and send.

## Simpler setup

One protocol for sending and receiving mail (not to mention syncing contacts and
calendars) is a huge win for usability. Email providers see a lot of support
tickets where users can receive but not send, or vice versa, because one of
these is misconfigured. This is always very confusing for regular users.
