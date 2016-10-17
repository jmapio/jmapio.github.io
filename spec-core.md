---
layout: default
permalink: /spec-core.html
---

# JSON Meta Application Protocol (JMAP)

This document specifies the core protocol for synchronising JSON-based data objects efficiently, with support for push and out-of-band binary data upload/download.

This is then built upon to provide [mail](spec-mail.html), [contacts](spec-contacts.html) and [calendar](spec-calendars.html) synchronisation protocols.

{% include spec/jmap/intro.mdown %}
{% include spec/jmap/authentication.mdown %}
{% include spec/jmap/api.mdown %}
{% include spec/jmap/download.mdown %}
{% include spec/jmap/upload.mdown %}
{% include spec/jmap/push.mdown %}
