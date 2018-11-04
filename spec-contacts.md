---
layout: default
permalink: /spec-contacts.html
title: JMAP Contacts Specification
---

# JMAP Contacts

This document specifies a data model for synchronising contacts data with a server using [JMAP](spec-core.html).

{% capture x %}{% include spec/contacts/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/contactgroup.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/contact.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
