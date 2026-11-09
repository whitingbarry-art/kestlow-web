import { jobsHref } from "./data/jobs";
import { sourceFrom } from "./logic/signUp";

// The address on the counter cards' QR codes (KES-121), e.g. /waitlist/?ref=screwfix-bromley.
// It goes straight to the jobs page (KES-155), keeping the card's code, so cards and ads both
// start where people see real jobs first. replace(), so Back doesn't land here again.
window.location.replace(jobsHref(sourceFrom(window.location.search)));
