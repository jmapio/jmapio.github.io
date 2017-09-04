---
layout: default
permalink: /spec-core.html
---

# JSON Meta Application Protocol (JMAP)

This document specifies the core protocol for synchronising JSON-based data objects efficiently, with support for push and out-of-band binary data upload/download.

This is then built upon to provide [mail](spec-mail.html), [contacts](spec-contacts.html) and [calendar](spec-calendars.html) synchronisation protocols.

{% capture x %}{% include spec/jmap/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/jmap/authentication.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/jmap/api.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/jmap/upload.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/jmap/download.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/jmap/push.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
