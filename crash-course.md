---
layout: default
permalink: /crash-course.html
title: JMAP Crash Course
---

# JMAP Crash Course

This document will guide you through understanding the basics of JMAP and
writing your first program using it.  The examples in this document are written
in Perl, but they should be simple enough to translate into any language you
like.

First, we strongly suggest you read the core and mail specifications.  They’re
clear and precise, and will cover lots of material that you’ll need to know.
What we’re including here is just enough to get you started.

## Core Concept: Request and Response

JMAP is built on HTTPS and JSON.  Every time you want to interact with your
data on the JMAP server, you’ll use HTTPS to post a request to the server.
You’ll express that request in JSON and, unless something goes wrong, you’ll
get a corresponding response in JSON.

A JMAP request looks like this:

```
Content-Type: application/json; charset=utf-8
Authorization: ...

{
  "using": [ "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail" ],
  "methodCalls": [
    [ "Type1/method1", { "arg1": "data1", "arg2": "data2" }, "c1" ],
    [ "Type2/method2", { "arg3": "data3", "arg4": "data4" }, "c2" ]
  ]
}
```

(We’ll come back to authentication later.)

There are two key properties to talk about here:  `using` and `methodCalls`.
The using key declares what JMAP capabilities you’re going to use.
Capabilities tell the server what standards you want to rely on, and the server
is required to adhere to those standards.  If you don’t ask for some extension,
the server won’t provide it.  In our example above, we show the capabilities
for managing mail and core behaviors.  That's what we'll be using in the rest
of these examples, but other capabilities exist.  You can look for those in
[the specs](/spec.html) or in your JMAP server's documentation.

When we say “what standards you want to rely on,” we really mean “which methods
you can call and what arguments you can pass them.”  That’s all the stuff in
the `methodCalls` entry, and what you’ll get back in the response.  Think of
the method calls as a list of operations you want the server to perform, in
order.  Each one is represented as an array with three elements:

* the name of the method to call, in the form `datatype/operation`
* a JSON Object with the arguments to the method
* a string, unique to this JMAP request, identifying this method call

The responses will look very much like the requests:

```
Content-Type: application/json; charset=utf-8

{
  "methodResponses": [
    [ "Type1/method1", { "arg1": "data1", "arg2": "data2" }, "c1" ],
    [ "error", { "type": "invalidArguments" }, "c2" ]
  ],
  "sessionState": "04dd62da-ef92-11e9-aa08-33a0ad9d9dc4"
}
```

Every response starts with the type of the response.  Generally, this will
either be identical to the method that was called or will be `error`.  The next
entry is an Object containing the data returned by the method.  Last is the
same string you passed for this method call in the original request.  (This is
called the method call id.)

## Core Concept: Authentication

Above, we put off describing authentication.  In part, that’s because JMAP
doesn’t mandate a standard authentication mechanism.  Most likely you'll need
to use bearer token, either via OAuth or configured via your service.  Check
with your server provider!

You'll also need to know how to reach your JMAP server.  *Probably* your
service will tell you that, but you're meant to be able to find out through DNS
autodiscovery by looking up the record `_jmap._tcp.example.com`.  Let's
consider an example account, `example@example.fm`.  We can perform (manual)
autodiscovery using `dig`:

```
$ dig +short srv _jmap._tcp.example.fm
0 1 443 api.fastmail.com.
```

The first two numbers in the response are priority and weight, used to pick
between multiple options.  With only one option, we don't need to worry about
those.  We only need to know that we'll be talking to `api.fastmail.com` on
port 443.

Finally, you need to know the account ids you'll be looking at.  Each account
represets a set of data available to you, maybe yours or maybe shared with you.
To see the accounts you can access, you can GET the well-known JMAP session
URL.  That's always `/.well-known/jmap` at the host named in autodiscovery.

Making a (properly authenticated request) for our example account, here's the
response we get, just slightly trimmed down:

```
{
  "capabilities": {
    "urn:ietf:params:jmap:core": { ... }
    "urn:ietf:params:jmap:submission": {},
    "urn:ietf:params:jmap:mail": {}
  },
  "accounts": {
    "u2321401a": {
      "name": "example@example.fm",
      "isReadOnly": false,
      "isArchiveUser": false,
      "isPersonal": true,
      "accountCapabilities": {
        "urn:ietf:params:jmap:submission": {
          "submissionExtensions": [],
          "maxDelayedSend": 44236800
        },
        "urn:ietf:params:jmap:core": {},
        "urn:ietf:params:jmap:mail": {
          "emailQuerySortOptions": [ ... ]
          "maxSizeMailboxName": 490,
          "maxMailboxDepth": null,
          "mayCreateTopLevelMailbox": true,
          "maxMailboxesPerEmail": 1000,
          "maxSizeAttachmentsPerEmail": 50000000
        }
      },
    }
  },
  "primaryAccounts": {
    "urn:ietf:params:jmap:submission": "u2321401a",
    "urn:ietf:params:jmap:core": "u2321401a",
    "urn:ietf:params:jmap:mail": "u2321401a"
  },
  "uploadUrl": "https://api.fastmail.com/jmap/upload/{accountId}/",
  "eventSourceUrl": "https://api.fastmail.com/jmap/event/",
  "downloadUrl": "https://www.fastmailusercontent.com/jmap/download/{accountId}/{blobId}/{name}?type={type}",
  "apiUrl": "https://api.fastmail.com/jmap/api/",
  "username": "example@example.fm"
}
```

There's a lot of useful information in this structure, called the "session
object", but the things to look at now are the `accounts`, `primaryAccounts`,
and `capabilities` properties.  These tell you which accounts you can access,
what capabilities the server is exposing, which accounts are primary for what
capabilities.  This session is nice and simple:  there's only one account
available, and it's the primary for everything you can do.

Almost every method you'll call with JMAP will want an `accountId` parameter to
indicate which account you're working with.  Methods that don't take an
`accountId` parameter will still almost always want to know account ids, but
might call them something else, like `fromAccountId`.

Finally, note the properties that end in `Url`.  These tell you the URLs or URL
templates you'll use for interacting with the server.  The most important, to
start, is `apiUrl`.  We'll use that to write…

## The Simplest Program Worth Writing

Here’s the basics of a program to get just the most recent ten messages in your
inbox.

```perl
use strict;
use warnings;
use LWP::UserAgent;
use JSON;

my $www = LWP::UserAgent->new;
my $bearer_token = 'xyz1-123-321';
my $account_id = 'u2321401a'; # Retrieved from the session object, see above.
my $inbox_id = '...'; # Retrieved in another Mailbox/query

my $res = $www->post(
  'https://api.fastmail.com/jmap/api/',
  'Content-Type'  => 'application/json; charset=utf-8',
  Authorization   => "Bearer $bearer_token",
  Content => encode_json({
    using => [ "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail" ],
    methodCalls => [
      [ 'Email/query',
        {
          accountId => $account_id,
          filter    => { inMailbox => $inbox_id },
          sort      => [ { property => "receivedAt", isAscending: JSON::false } ],
          limit     => 10,
        },
        'a',
      ],
    ],
  }),
);

# Or Dumper or whatever you like for printing data structures!
print JSON->new->pretty( decode_json($res->decoded_content) );
```

You’ll get back something a lot like the request, as expected.  Here are the
highlights:

```javascript
{
  "methodResponses": [
    [
      "Email/query",
      {
        "ids": [
          "Ma8bbd9fcb18d88ea7374bd32",
          "M02886f6b7c8e97aeab5c1b9d",
          "Me291776ded7c75d522850919",
          "M73aff4c1af82a874e2c416d3",
          "Me542737e24136513aaee4d41",
          "M56e3027f5b7cdfa3c2ce53ff",
          "M1c785c3148deae036a41838f",
          "M3a83359e82a1a005d37f854d",
          "Me993595a8c736a1f1091fd41",
          "M452a63811e456b30e0d31c83"
        ],
        "position": 0,
        "sort": [ { "property": "receivedAt" } ],
        "queryState": "5758083:0",
        "accountId": "u2321401a",
        "total": 69105
      },
      "a"
    ]
  ],
  "sessionState": "cyrus-1;fsdb-2;vfs-3"
}
```

Great!  We got ten emails, just like we expected… almost.  In fact, we only got
their ids.  JMAP methods tend not to perform multiple jobs.  The `Email/get`
method exists to get emails by id, so you use that, rather than `Email/query`,
which searches for email ids based on filters.  We could take the output from
our first request and use it to make a second request, but this would be pretty
inefficient.  Instead, JMAP lets you chain methods together within a single
request using result references.

## Core Concept: Result References

Many HTTP APIs expose different kinds of operations as different paths in the
URL.  This means that taking several actions requires several round trips to
the remote server.  JMAP lets you bundle these together in one HTTP request,
*even when later calls depend on the result of earlier calls*.  To do this, the
arguments to an individual method call can make a reference to the a previous
method’s results.  Instead of including a value for the argument `foo`, you
include a value for `#foo`, and that value provides a pointer backward into the
results so far, finding results by method call id, response name, and a
(modified) JSON Pointer to a set of data in that result.

Let’s go back to our program…

## Using Result References

Here, we extend our program by using a result reference.  We add a second
method call, calling `Email/get,` with a reference back to the ids found by the
`Email/query` we already saw above.

```perl
my $res = $www->post(
  'https://api.fastmail.com/jmap/api/',
  'Content-Type'  => 'application/json; charset=utf-8',
  Authorization   => "Bearer $bearer_token",
  Content => encode_json({
    using => [ "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail" ],
    methodCalls => [
      [ 'Email/query',
        {
          accountId => $account_id,
          filter    => $inbox_id,
          sort      =>  [ { property => "receivedAt", isAscending => JSON::false } ],
          limit     => 10,
        },
        'a',
      ],
      [ 'Email/get',
        {
          accountId  => $account_id,
          properties => [ 'id', 'subject', 'receivedAt' ],
          '#ids'     => { resultOf => 'a', name => 'Email/query', path => '/ids/*' },
        },
        'b',
      ]
    ],
  }),
);

for my $email (decode_json($res->decoded_content)->{methodResponses}[1]{list}->@*) {
  printf "%20s - %s\n", $email->{receivedAt}, $email->{subject};
}
```

…and you’ll get a listing of those ten most recent messages by time and
subject.

## Go Forth and JMAP

This is really only the very, very tip of the iceberg.  Not covered:  creating
things (like mailboxes or emails), sending mail, updating existing objects,
updates and synchronization, retrieving or uploading blobs, and more core
concepts.  All these concepts (and more!) should be covered by [the
specifications](https://jmap.io/spec.html).

You can also find a small, but growing, set of very simple sample JMAP programs
for you to see how to do some other basic things, like create and send mail, in
the [fastmail/JMAP-Samples repo on
GitHub](https://github.com/fastmail/JMAP-Samples).
