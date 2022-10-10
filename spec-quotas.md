---
layout: default
permalink: /spec-quotas.html
title: JMAP Quotas Specification
---

# JMAP Quotas

This specification defines a data model for handling quotas, allowing you to read and explain quota information using [JMAP](spec-core.html).

{% capture x %}{% include spec/quotas/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/quotas/quota.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/quotas/securityconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/quotas/ianaconsiderations.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
