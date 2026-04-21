---
layout: article-toc
permalink: /server/index.html
redirect_from:
    - /server.html
title: JMAP Server Implementation Guide
hero:
    title: Advice for JMAP implementors
    eyebrow: Implementation guide
    eyebrow_icon: wrench-screwdriver
    sub: >-
        This document describes a recommended set of database tables and
        algorithms for efficiently implementing JMAP Mail. It is intended to
        serve as suggestions only; there may well be better ways to do it.
        RFC8620 and RFC8621 are the authoritative guide on what constitutes a
        conformant JMAP Mail implementation.
---

## Modification sequences

A modification sequence, or **modseq**, is a 64-bit unsigned monotonically
incrementing counter. Each data type has its own modseq counter for each account
(in IMAP it's originally per-mailbox, but per user is backwards compatible with
this). Every time a change occurs to data within the user, the modseq for that
data type is incremented by one and the new value is associated with the
changes. This is used in a number of data structures and algorithms below to
efficiently calculate changes.

## Data structures

As ever in programming, get your data structures right and the server will
practically write itself. The tables below are deliberately split so that
each common query can be answered with a single index range scan.

### 1. EmailMetadata

This contains all the properties of the Email that are not derived from the
RFC5322 content itself. This includes all mutable data for the Email. The raw
message and derived full content live in a separate table (and typically a
separate, slower store).

Properties below have the values as specified in the **Email** object in the
JMAP Mail spec.

- **id**: `Id`
- **threadId**: `Id`
- **mailboxIds**: `Id[Boolean]` (Mutable)
- **keywords**: `Id[Boolean]` (Mutable)
- **receivedAt**: `UTCDate`
- **blobId**: `Id`
- **size**: `UnsignedInt`

Data sync properties:

- **createdModSeq**: `UnsignedInt` The modseq when the Email was created.
- **updatedModSeq**: `UnsignedInt` The modseq when the Email was last modified.
- **deleted**: `Date|null` The timestamp when the Email was deleted (a
  tombstone kept around long enough for _Email/changes_ to see it).

Indexes:

- `byModSeq` on `updatedModSeq` — for _Email/changes_.
- `byThreadId` on `threadId` — for thread construction and for
  thread-keyword/size evaluation during _Email/query_.

Splitting the metadata from the full content keeps the hot table narrow:
the common case of filtering and sorting for a message list walks only a
few dozen bytes per record instead of dragging the body through the cursor.

### 2. EmailContent

The parsed immutable content of each message: headers, body structure, body
values, and any derived text you want to keep addressable. Keyed by the
same id as _EmailMetadata_.

- **from / to / cc / bcc / deliveredTo / sender / replyTo**:
  `Emailer[]|null`
- **subject**: `String`
- **preview**: `String`
- **messageId / inReplyTo / references**: `String[]|null`
- **sentAt**: `Date|null`
- **bodyStructure**: `EmailBodyPart`
- **bodyValues**: `String[EmailBodyValue]`
- **header:`*` pseudo-properties** that callers may request by name.

### 3. EmailSearch

An inverted index from normalised text tokens to messages, supporting
freetext and address filters.

- **id**: `(token, emailId)` where
    - `token`: the search term, normalised to NFKD, case-folded, with
      zero-width and combining code points stripped. Addresses store the
      domain reversed (e.g. `com.example@john`) so domain-prefix search
      falls out of a cheap range scan. Freetext tokens are typically
      short hashes (e.g., FNV-1a, truncated) to keep the index keys uniform
      and small.
    - `emailId`: the same Id used as the primary key on _EmailMetadata_.
- **fields**: `UnsignedInt|Int16Array` — a bitmask over a field-bit enum
  (`FROM=1`, `TO=2`, `CC=4`, `BCC=8`, `DELIVERED_TO=16`, `SUBJECT=32`,
  `BODY=64`, `ATTACHMENT_NAME=128`, `ATTACHMENT_TYPE=256`, `LIST_ID=512`,
  `MESSAGE_ID=1024`) encoding which fields the token appears in. An
  `Int16Array` of token positions can be used in place of the scalar when
  phrase-adjacency queries need to be supported.

A single key order serves freetext, address, list-id, and message-id
filters; the field bitmask lets one row contribute to any filter that
includes its field. At query time a phrase is tokenised the same way and
matched by bitmask AND against each token's row for the candidate
message.

### 4. MailboxEmailList

A per-mailbox list of message memberships, including historical add/remove
pairs. This is the equivalent of IMAP's message sequence and powers the
fast path for the most common _Email/query_ and _Email/queryChanges_
calls — a single `inMailbox` filter, sorted by date.

- **id**: `(mailboxUid, removedModSeq, addedModSeq)` where
    - `mailboxUid`: `UnsignedInt` — a compact sequential integer assigned per
      account, rather than the full mailbox id string. The `$flagged`
      keyword is treated as a virtual mailbox with its own uid, so
      "pinned on top" and "pinned only" queries can use the same fast
      path as a real mailbox.
    - `removedModSeq`: `UnsignedInt` — `0` while the message is still in the
      mailbox; set to the modseq of the removal otherwise.
    - `addedModSeq`: `UnsignedInt` — the modseq at which the message was
      added to the mailbox.
- **value**: `(emailId, threadId, receviedAt, isUnread)`
  Denormalising these four fields lets the whole mailbox be slurped with a
  single range scan and filtered/sorted in memory without touching
  _EmailMetadata_.

Note, the `removedModSeq` is set on the existing row when the message is
removed from the mailbox, but not then updated even if the message is
changed again. If the message is added back to the mailbox, a new row is
inserted with a fresh `addedModSeq`.

### 5. MailboxEmailIndex

A secondary index over live (non-removed) _MailboxEmailList_ rows,
allowing a mailbox-plus-email lookup without scanning the mailbox.

- **id**: `(mailboxUid, emailId)`
- **value**: `addedModSeq`

When a message moves mailbox or is destroyed, this is what lets you
rewrite its _MailboxEmailList_ row from `(uid, 0, addedModSeq)` to
`(uid, removedModSeq, addedModSeq)` in O(1).

### 5. Mailboxes

- **id**: `Id` (The mailbox id; UUID suggested)
- **name**: `String`
- **parentId**: `Id|null`
- **role**: `String|null`
- **sortOrder**: `Number`
- **mayReadItems**: `Boolean`
- **mayAddItems**: `Boolean`
- **mayRemoveItems**: `Boolean`
- **mayCreateChild**: `Boolean`
- **mayRename**: `Boolean`
- **mayDelete**: `Boolean`
- **totalEmails**: `UnsignedInt`
- **unreadEmails**: `UnsignedInt`
- **totalThreads**: `UnsignedInt`
- **unreadThreads**: `UnsignedInt`

Data sync properties:

- **createdModSeq**: `UnsignedInt` The modseq when the mailbox was created.
- **updatedModSeq**: `UnsignedInt` The modseq when the mailbox was last
  modified.
- **updatedNotCountsModSeq**: `UnsignedInt` The modseq when any property
  other than the email/thread counts was last modified.
- **deleted**: `Date|null` The timestamp when the mailbox was deleted.

- **mailboxUid**: `UnsignedInt` The compact sequential integer used in
  _MailboxEmailList_ keys.
- **emailHighestModSeq**: `UnsignedInt` The highest modseq of any Email in
  the mailbox.
- **emailListLowModSeq**: `UnsignedInt` The lowest modseq we can calculate
  _MailboxEmailList_ updates from — i.e. the highest `removedModSeq`
  we have purged. Below this, _Email/queryChanges_ for this mailbox
  must fall back to the generic path.

Note that you can compute `totalEmails`/`unreadEmails`/`totalThreads`/
`unreadThreads` on the fly from _MailboxEmailList_ (grouped by thread,
with a special case for Trash — an unread message in Trash must not
flag the thread unread in non-Trash mailboxes, and vice versa). Whether
you keep these fields on the Mailbox record or reconstruct them into a
separate in-memory map is an engineering choice; either way they should
be recomputed incrementally — walk only the _MailboxEmailList_ rows
added or removed since the counts were last reconciled, and for each
affected thread re-derive that thread's contribution from its current
and pre-state email set.

### 6. Refs to Thread

This is solely used to look up the conversation to assign to a message on
creation/import/delivery. Maps the RFC5322 message ids found in the
`Message-ID`, `In-Reply-To` and `References` headers of each message
received to the thread id assigned to that message.

- **id**: `hash(rfc822id) . hash(subject)` The id is a concatenation of
  a secure hash of the RFC5322 message id and a secure hash of the
  subject of the message after stripping:
    - Anything in square brackets
    - All words followed by a colon from the beginning of the message
    - All white space
- **threadId**: `Id` The thread id assigned to this message.
- **lastSeen**: `UTCDate` The date of the last time this id was seen in a
  new message. This is used to clean up older entries after a while.

If two messages share a common RFC5322 message id in the set of such ids
within each message, and the messages have the same `Subject` header
hash, then they should belong in the same thread. Otherwise they should
belong in different threads.

### 7. Raw messages

The set of full raw messages, typically in a blob store addressable by
blob id. Clients fetch these via the standard JMAP blob endpoints, so they need
not be in the primary database.

## Algorithms

The `state` property to return with getter calls to each type is a string
encoding the highest modseq for that data type.

### Email/changes

If the modseq given == the current highest modseq value, there are no
changes.

If there are changes, range-scan _EmailMetadata_ by the `byModSeq` index from
the given modseq, bucketing each hit into created/updated/destroyed by its
`createdModSeq` and `deleted` fields.

### Thread/changes

You can range-scan _EmailMetadata_ `byModSeq` index to find emails that have
changed. For each one, use the `byThreadId` index to find the metadata of all
emails in the thread, and work out if the thread is new (created), or has had
emails added/removed (updated), or all emails have been destroyed.

### Mailbox/changes

If the modseq given == the current highest modseq value, there are
no changes.

If there are changes, iterate through the set of Mailboxes comparing
their `updatedModSeq` to the client modseq. If higher, the mailbox has
changed (if `deleted` is not `null` it has been deleted, otherwise it
was created or updated). If the `updatedNotCountsModSeq` is _not_
higher, only counts have changed.

### Email/query

Check the current state string as would be returned for _Email/query_
with the same arguments. If it is the same as the state given, nothing
has changed so you can return a response immediately. Otherwise…

Before scanning, classify the query. You will typically have three
strategies; pick the cheapest that applies.

**Fast mailbox path** — applies when the filter reduces to `AND(inMailbox:
X, <other conditions answerable from (emailId, threadId, date, isUnread)>)`
and the sort can also be answered from the same tuple (e.g. `receivedAt`).

Steps:

1. `getAll` from _MailboxEmailList_ where `mailboxUid = uid(X)` and
   `removedModSeq = 0`.
2. If the filter or sort references thread keywords or thread size,
   walk the `byThreadId` index of _EmailMetadata_ for each distinct
   `threadId` in the result to build per-thread caches.
3. Apply the remaining filter components against the mailbox tuple,
   without ever touching _EmailMetadata_.
4. Sort in place.
5. Collapse threads by `threadId` if requested.

This is the path almost every folder view will take. It's typically
O(messages-in-mailbox), reading a single narrow range.

**Fast search path** — applies when the filter reduces to a single
streamable _EmailSearch_ token and the sort is `receivedAt` descending
(or anything your id scheme makes index order for). Advance a cursor
over _EmailSearch_ for that token, hydrate each hit's metadata, apply
the matcher, and stop as soon as `limit` matches have been collected.
If you assign email ids with a time-descending prefix (see the note
below) the inverted index is already approximately the right order and
you rarely need to over-read.

**Generic path** — fallback for anything else. If the filter has a
search component that covers the filter (so the candidate set is just
the union of the index hits), and the candidate set is meaningfully
smaller than a full scan, hydrate only those candidates. Otherwise scan
_EmailMetadata_ in its entirety, match, and sort.

Once you have the complete message list, you can find the requested
section to return to the client. Since a client is likely to fetch a
different portion of the same message list soon after, it is beneficial
if the server can keep the last list requested by the user in a cache
for a short time.

    let collapseThreads = args.collapseThreads
    let position = args.position
    let anchor = args.anchor
    let anchorOffset = args.anchorOffset
    let limit = args.limit
    let total = 0
    let emailIds = [] # NB Max size of array is limit

    # If not collapsing threads, we can just jump to the required section
    if !collapseThreads {
      total = messageList.length
      for i = position; i < total; i = i + 1 {
        emailIds.push( msg.id )
      }
    } else {
      # Optimisation for the common case
      let totalIsKnown = filter is just mailbox
      let SeenThread = new Set()
      let numFound = 0
      foreach msg in sortedFilteredList {
        if !SeenThread{ msg.threadId } {
          SeenThread.add( msg.threadId )
          total += 1
          if position >= total && numFound < limit {
            emailIds.push( msg.id )
            numFound += 1
            if numFound == limit && totalIsKnown {
              break;
            }
          }
        }
      }
      if totalIsKnown {
        total = mailbox.totalThreads
      }
    }

### Email/queryChanges

For the common case of a mailbox filter sorted by `receivedAt` , use
_MailboxEmailList_ directly. Take the live rows plus every row whose
`removedModSeq > sinceModSeq` (i.e. all rows removed from the mailbox since the
client's state), annotate each with its `addedModSeq` and `removedModSeq`, sort
by the query sort, then run the exemplar diff:

    let index = -1
    let total = 0
    let added = []
    let removed = []
    let collapseThreads = args.collapseThreads
    let uptoHasBeenFound = false
    let lastEmailId = null

    let SeenExemplar    = collapseThreads ? new Set() : null
    let SeenOldExemplar = collapseThreads ? new Set() : null

    foreach listMsg in messageList {
      let isDeleted = listMsg.removedModSeq > 0
      let isNew     = listMsg.addedModSeq > args.sinceModSeq

      # Added *and* removed since the previous state — invisible on
      # either side; skip.
      if isNew && isDeleted { continue }

      let isNewExemplar = false
      let isOldExemplar = false

      # Is this the current exemplar?
      if !isDeleted &&
          ( !collapseThreads || !SeenExemplar{ listMsg.threadId } ) {
        isNewExemplar = true
        index += 1
        total += 1
        if collapseThreads { SeenExemplar.add( listMsg.threadId ) }
      }

      # Was this the old exemplar?
      # 1. Must have existed in the mailbox at the client's state.
      # 2. Must not have already found the old exemplar for this thread.
      if !isNew &&
          ( !collapseThreads || !SeenOldExemplar{ listMsg.threadId } ) {
        isOldExemplar = true
        if collapseThreads { SeenOldExemplar.add( listMsg.threadId ) }
      }

      if isOldExemplar && !isNewExemplar {
        removed.push( listMsg.emailId )
      }
      else if !isOldExemplar && isNewExemplar {
        # A message moved out and back in shows up as two adjacent rows
        # after sorting (one removed, one added). Collapse.
        if lastEmailId == listMsg.emailId &&
            removed.last() == listMsg.emailId {
          removed.pop()
        } else {
          added.push({ index, id: listMsg.emailId })
        }
      }

      # If this is the last message the client cares about, we can stop
      # here and just return what we've calculated so far. The total
      # count for the mailbox is already known from the cached counts
      # on the Mailbox record.
      if !isNew && listMsg.emailId == args.upto {
        uptoHasBeenFound = true
        break
      }
      lastEmailId = listMsg.emailId
    }

    if uptoHasBeenFound {
      total = getTotal( mailbox, collapseThreads )
    }

For other filters, run the current query (reusing any query-result cache)
and reconstruct `added` / `removed` by scanning the `byModSeq` index
of _EmailMetadata_ from `sinceModSeq` forward. Queries that collapse
threads or depend on thread-level properties must expand each changed
message to all messages in its thread (via `byThreadId`) so that old
exemplars displaced by a thread change end up in `removed`.

### Email/set

Every metadata mutation should go through a single choke point that:

1. Writes the new _EmailMetadata_ record (or the tombstone).
2. Diffs `mailboxIds`, together with the `$flagged` virtual mailbox if
   `keywords.$flagged` is set, old vs. new, and rewrites
   _MailboxEmailList_ via _MailboxEmailIndex_:
    - For each mailbox still present: nothing to do.
    - For each mailbox removed: look up the live row via
      _MailboxEmailIndex_, delete it, and insert a companion row with
      the `removedModSeq` set to the new modseq.
    - For each mailbox added: insert a fresh `(uid, 0, newModSeq)`
      row in _MailboxEmailList_ and the matching entry in
      _MailboxEmailIndex_.
3. Bumps `highModSeqThread` if mailbox membership changed.
4. Bumps `highModSeqCounts` if either membership or unread state
   changed.
5. Writes the immutable content fields to _EmailContent_ and the
   corresponding token rows to _EmailSearch_.

### Id assignment

When you assign server-side email ids, consider encoding a time-reversed
prefix. This gives date-descending order for free on any index that walks ids
ascending — _EmailSearch_ cursors can then stream results without a
separate sort step.

## Conversion between RFC5322 messages and JMAP Email objects

Extra advice on conversion:

- When encoding the _name_ property for an EmailBodyPart (i.e. an
  attachment's file name), for the most compatibility with existing
  clients you should RFC2231 encode the name as the _filename_ parameter
  of the _Content-Disposition_ MIME header, and also RFC2047 encode it
  as the _name_ parameter of the _Content-Type_ header (despite the
  latter being technically invalid).

## Vacation

As mentioned in
[RFC-5230 Sieve Vacation extension](https://tools.ietf.org/html/rfc5230),
implementations should avoid sending vacation responses to mailing lists.
Implementations should also avoid sending responses to well-known
addresses like "MAILER-DAEMON", "LISTSERV", "majordomo", and other
addresses typically used only by automated systems. Additionally,
addresses ending in "-request" or beginning in "owner-", i.e., reserved
for mailing list software, should also not receive vacation responses.
Implementations should not respond to any message that contains a
"List-Id" [RFC-2919](https://www.ietf.org/rfc/rfc2919.txt), "List-Help",
"List-Subscribe", "List-Unsubscribe", "List-Post", "List-Owner", or
"List-Archive" [RFC-2369](https://www.ietf.org/rfc/rfc2369.txt) header
field.

Also, be careful about infinite loops. Vacation responses should not be
sent in response to another vacation response. To avoid doing so, as
specified in [RFC-5230](https://tools.ietf.org/html/rfc5230), an
Auto-Submitted header with a value of "auto-replied" should be included
in any vacation message sent. Implementations should not send responses
to email with an Auto-Submitted header with a value of "auto-replied".

The server must keep track of sent notifications, in order to avoid
sending notifications twice to the same recipient during the duration of
a given vacation. Implementers must take care that if the vacation is
modified, previous tracking information should be discarded.

Finally, implementations are encouraged to comply with
[RFC-3824](https://tools.ietf.org/html/rfc3834), which defines a
personal responder. To do so:

- The Date field should be set to the date and time when the vacation
  response was generated. Note that this may not be the same as the
  time the message was delivered to the user.
- The From field should be set to the address of the given account.
- The To field should be set to the address of the recipient of the
  response.
- An Auto-Submitted field with a value of "auto-replied" should be
  included in the message header of any vacation message sent.
- Replies must have the In-Reply-To field set to the Message-ID of the
  original message, and the References field should be updated with
  the Message-ID of the original message.

If the original message lacks a Message-ID, an In-Reply-To need not be
generated, and References need not be changed.
[RFC-2822 section 3.6.4](https://tools.ietf.org/html/rfc2822#section-3.6.4)
provides a complete description of how References fields should be
generated.

## Binary upload error response codes

The upload handler is a standard HTTP resource, so must conform with the
HTTP standard. For reference, here are some of the appropriate HTTP
responses to return for client errors:

### 400: Bad request

The request was malformed (this includes the case where an
`X-JMAP-AccountId` header is sent with a value that does not exist).

### 401: Unauthorized

The `Authorization` header was missing or did not contain a valid
token. Reauthenticate and then retry the request. As per the HTTP spec,
the response MUST have a `WWW-Authenticate` header listing the
available authentication schemes.

### 413: Request Entity Too Large

The file is larger than the maximum size the server is willing to
accept for a single file.

### 415: Unsupported Media Type

An unacceptable type is uploaded. The server MAY choose to not allow
certain content types to be uploaded, such as executable files.

### 429: Rate limited

The client has made too many upload requests recently, or has too many
concurrent uploads currently in progress. The response MAY include a
`Retry-After` header indicating how long to wait before making a new
request.
