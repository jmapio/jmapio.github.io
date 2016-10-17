---
layout: default
permalink: /spec-contacts.html
---

# JMAP Contacts

This document specifies a data model for synchronising contacts data with a server using [JMAP](spec-core.html).

{% capture x %}{% include spec/contacts/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/contactgroup.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/contactlist.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/contacts/contact.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
