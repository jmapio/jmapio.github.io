---
layout: default
permalink: /spec-tasks.html
title: JMAP Tasks Specification
---

# JMAP Tasks

This document specifies a data model for synchronizing todo/task data with a server using [JMAP](spec-core.html).

{% capture x %}{% include spec/tasks/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/tasks/principal.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/tasks/list.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/tasks/task.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/tasks/tasknotifications.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/tasks/securityconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/tasks/ianaconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
