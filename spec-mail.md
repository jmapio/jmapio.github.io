---
layout: default
permalink: /spec-mail.html
---

# JSON Mail

This document specifies a data model for synchronising mail with a server using [JMAP](spec-core.html).

{% capture x %}{% include spec/mail/intro.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/mailbox.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/messagelist.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/thread.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/message.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/identity.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/searchsnippet.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
{% capture x %}{% include spec/mail/vacationresponse.mdown %}{% endcapture %}
{{ x | replace: "# ", "## " | markdownify }}
