---
layout: default
permalink: /spec-calendars.html
---

# JSON Calendars

This document specifies a data model for synchronising calendar data with a server using [JMAP](spec-core.html).

{% capture x %}{% include spec/calendars/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/calendars/calendar.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/calendars/calendareventlist.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/calendars/calendarevent.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
