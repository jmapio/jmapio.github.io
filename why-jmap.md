---
layout: why-jmap
permalink: /why-jmap/index.html
title: Why JMAP?
description:
    'The technical and practical argument for replacing IMAP with JMAP, grounded
    in benchmarks and real implementation experience.'
---

# It is time to replace IMAP with JMAP

<p class="author">Joseph Gentle & Neil Jenkins — Fastmail</p>

Email is essential to modern life. In 2025, an estimated 376 billion emails were
sent and received every day. Yet email is still regularly delivered to end user
devices over IMAP — a protocol from 1986.

IMAP is not aging well. Modern IMAP clients are fiendishly complex, navigating
77 official IMAP extensions across 58 RFCs that together total 272,000 words —
about as long as Harry Potter and the Order of the Phoenix. Server support for
many of these extensions is spotty even amongst large email providers. Despite
all this work, IMAP still lacks support for important features like labels and
push notifications.

> **The chicken-and-egg problem:** JMAP adoption has been slow because server
> operators wait for popular mail clients to support JMAP, while mail clients
> wait for mail servers. This paper presents the case for pushing through.

## JMAP is simpler than IMAP

JMAP's layered design delegates complexity to existing components:

- **HTTP** handles transport security, compression, multiplexing, and
  authorisation via standard headers
- **JSON** handles encoding, eliminating the need for a custom parser (IMAP and
  SMTP both require complex bespoke parsers)
- **Core JMAP** defines a small standard set of methods — `/get`, `/set`,
  `/query`, `/changes` — that work consistently across all data types
- **Application specs** (e.g., JMAP for Mail) define only the data types and
  semantics

The JMAP core and mail specifications together total just 51,000 words — less
than one fifth the size of the IMAP specification set. A simpler protocol means
software development is easier and cheaper, and more attention can be spent on
performance, security, and bug fixing.

During testing, a large number of bugs were encountered in production IMAP
clients. Many of these bugs would likely have been prevented with a simpler
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
- **Compression** via NGINX proxy config — no mail server code changes needed.
  IMAP requires explicit RFC 4978 support in the server.

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

## Performance benchmarks

JMAP is often more efficient than IMAP — particularly in common scenarios where
IMAP clients and servers don’t implement the necessary extensions.

### Resync after restart

When a mail client is closed and reopened, it must synchronise with the server.
This test measured bandwidth consumed when restarting the mail client with
28,234 messages in the account:

| Client           | Time  | TCP connections | Traffic  |
| ---------------- | ----- | --------------- | -------- |
| JMAP (lite)      | 0.8s  | 2               | 58 KB    |
| JMAP (full sync) | 1.1s  | 3               | 162 KB   |
| Outlook          | 7.4s  | 2               | 1,024 KB |
| Thunderbird      | 35.0s | 7               | 2,048 KB |

Without CONDSTORE and QRESYNC support, IMAP clients must query the read/unread
flags on every message in the user’s entire mailbox at startup. This scales
linearly with inbox size. Thunderbird repeats this query every time the selected
mailbox changes.

### Attachment handling

IMAP and SMTP have a significant write amplification problem when sending email
with attachments. In testing, composing and sending a 20 MB attachment in
Outlook required **155 MB** of total bandwidth — the attachment was uploaded to
the server 5 separate times (drafts auto-save, subject line edit, send, copy to
Sent, SMTP delivery).

With JMAP, attachments are uploaded once. Forwarding an email with an attachment
requires no download at all — the blob ID is simply copied into the new message.

## iOS battery life

Battery testing compared three configurations using a corpus of real mail from
an inactive Gmail account, with new messages arriving once per hour:

- **JMAP** — Fastmail (Cyrus) server with Fastmail for iOS
- **IMAP+** — Fastmail (Cyrus) with maximal feature set including push
  notifications, with Apple Mail
- **IMAP–** — Stalwart with features disabled (no compression, CONDSTORE, or
  QRESYNC), with Apple Mail

Results showed a **2–3× reduction in battery usage** when switching to JMAP. The
dominant factor is push notifications: IMAP without proper push support requires
the device radio to wake periodically to poll the server, which is a significant
battery drain.

## Webmail support

IMAP cannot be used for webmail — it runs on raw TCP sockets not available to
browsers. Every webmail provider (Gmail, iCloud Mail, Outlook.com) maintains a
bespoke HTTP API service alongside their IMAP infrastructure. This is expensive
to design, build, and maintain.

Because JMAP runs over HTTP, JMAP can be used directly by webmail clients. The
Fastmail web client is built directly on Fastmail’s public JMAP API — including
full offline support, keeping the local database up to date via JMAP’s standard
`/changes` feed.

In an experiment, Claude Code (Opus 4.6) was prompted to write a generic
standalone JMAP webmail client — able to work with any JMAP server — with access
only to the JMAP Core and Mail specifications. In about 30 minutes of prompting,
it generated a working JMAP client in 2,100 lines of Rust with inbox, thread
view, multiple mailboxes, compose, and send.

## Conclusion

Microsoft and Google have already reached the same conclusion through their
product decisions. Microsoft has replaced IMAP with the Microsoft Graph API in
modern Outlook. The Gmail app on iOS and Android has also ditched IMAP for a
proprietary protocol when speaking with Google’s servers.

If IMAP is to be replaced, the industry should not fragment into proprietary,
mutually incompatible protocols. Email is great because it is an open platform.
JMAP carries this torch.

JMAP performs as well or better than IMAP in all cases — and with JMAP, everyone
gets the ultimate edition. The benefits only materialise if the ecosystem builds
it together.
