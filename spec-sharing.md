---
layout: default
permalink: /spec-sharing.html
title: JMAP Sharing Specification
---

# JMAP Sharing

This document specifies a data model for sharing data between users using JMAP.

{% capture x %}{% include spec/sharing/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/sharing/principal.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/sharing/sharenotifications.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/sharing/shareddatatype.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/sharing/securityconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/sharing/ianaconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
