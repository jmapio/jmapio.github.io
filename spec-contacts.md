---
layout: default
permalink: /spec-contacts.html
title: JMAP Contacts Specification
---

# JMAP Contacts

This document specifies a data model for synchronising contacts data with a server using [JMAP](spec-core.html).

{% capture x %}{% include spec/contacts/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/addressbook.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/card.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/cardgroup.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/securityconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/ianaconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
