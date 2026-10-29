---
"web": minor
---

Error monitoring (KES-38). If a page breaks, people see "Something went wrong" with a Reload button and the support address, instead of a blank screen. What broke is reported to the API's `/client-errors`, along with errors nothing else caught: the message, stack and page path, never who, once per distinct error and at most five per page load. The privacy notice says so, and that reports are kept 30 days.
