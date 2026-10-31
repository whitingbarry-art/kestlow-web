import { BUSINESS_ADDRESS, CONTACT } from "./contact";
import { DATA_CONTROLLER } from "./waitlist";

/**
 * Kestlow's privacy notice, terms and refund policy (KES-37), kept as data so they can be edited
 * without touching the pages. Email addresses and web addresses in the text become links.
 * Change `updated` whenever the words change.
 */

/** A paragraph, or a bulleted list. */
export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  /** When the words last changed, shown at the top. */
  updated: string;
  intro: string[];
  sections: LegalSection[];
}

/** The ICO's registration number, issued on 29 October 2026. */
export const ICO_REGISTRATION: string | null = "ZC286813";

/** What the privacy notice says about the ICO, with the number once there is one. */
export function icoRegistration(number: string | null): string {
  return number
    ? `We're registered with the Information Commissioner's Office (ICO), number ${number}.`
    : "We've registered with the Information Commissioner's Office (ICO); our registration number will appear here once it's issued.";
}

const UPDATED = "30 October 2026";
/**
 * Who runs Kestlow, named only where the law needs it: the Terms and Privacy notice, which every
 * page's footer links to (KES-124). Elsewhere the site says Kestlow.
 */
export const OWNER = `${DATA_CONTROLLER.name}, trading as Kestlow`;

export const PRIVACY: LegalDocument = {
  title: "Privacy notice",
  // Where people found us, kept with their account (KES-125).
  updated: "31 October 2026",
  intro: [
    "This notice explains what personal information Kestlow keeps, why, who helps us look after it, and your rights. We keep as little as we can, we never sell it, and we don't use advertising or tracking cookies.",
  ],
  sections: [
    {
      heading: "Who we are",
      blocks: [
        `Kestlow is run by ${OWNER} ("we", "us"), ${BUSINESS_ADDRESS}. We decide how your information is used, which makes us its "controller" under UK data protection law. For anything about your information, email ${CONTACT.privacy}.`,
        icoRegistration(ICO_REGISTRATION),
      ],
    },
    {
      heading: "What we keep, and why",
      blocks: [
        "For each kind of information, here's what it's for and the legal reason we can use it:",
        {
          list: [
            "Your account: your name, email address, whether you've confirmed it, and your password, which we only ever store scrambled so no one can read it. We need these to give you an account (to perform our contract with you).",
            "Where you found us: if you signed up from one of our cards, ads or links, which one, so we can tell which work and stop paying for the ones that don't. It's a short code, such as a shop's name, never anything about you, and it's deleted with your account (our legitimate interest in knowing which advertising works).",
            "Your alert settings: your base postcode and its position on the map, how far you'll travel, your trades, and how you want alerts. We need these to find leads for you (contract).",
            "Leads you save, and a record of which leads we've already told you about, so we never send the same one twice (contract).",
            "Push alerts: if you turn them on, your browser gives us an address to send them to. We use it only for your alerts, and it's deleted when you turn push off (your consent).",
            "Signing in: a cookie keeps you signed in, and for each signed-in session we keep your IP address and browser type for up to 30 days, to keep your account secure (our legitimate interest in security).",
            "Security: we briefly use IP addresses and email addresses to slow down repeated sign-in attempts and messages, which stops people guessing passwords or flooding inboxes (legitimate interest).",
            "Messages you send us, through the Contact us form or by email: your name, email address and what you wrote, so we can reply (legitimate interest in answering you).",
            "Error reports: when something breaks in Kestlow, we keep what broke and on which page, never who you are, so we can fix it (legitimate interest in keeping Kestlow working).",
            "The waitlist, which has now closed: if you joined it, your email address, the first half of your postcode, your trades, your survey answers and, if you came from one of our cards or links, which one, to tell you when Kestlow opens near you, set fair prices and see which cards work (your consent).",
            "Free trials: whether you've had one. If you delete your account, we keep only a scrambled copy of your email address (a one-way hash, which can't be turned back into the address), so the same email can't start a second free trial (legitimate interest in preventing misuse of free trials).",
            "Payments, once paid plans start: your plan, when it renews, and Stripe's references for you and your payments, so we can bill you (contract) and keep the accounts the law requires (legal obligation). Card and bank details go straight to Stripe; we never see or keep them.",
          ],
        },
      ],
    },
    {
      heading: "Planning applications",
      blocks: [
        "The leads Kestlow shows come from councils' public planning registers. They include the address of each site and, where the applicant is a company, its name. We never keep the names of private individuals who apply. Using public planning information this way is in our legitimate interest, and in that of the tradespeople we serve. If you think an application of yours shows something it shouldn't, email us and we'll look at it straight away.",
      ],
    },
    {
      heading: "Cookies",
      blocks: [
        "We use one cookie, which keeps you signed in. It's essential, so it doesn't need your consent. Your browser also remembers how you like leads sorted, on your device only. We don't use analytics, advertising or tracking cookies, which is why there's no cookie banner.",
      ],
    },
    {
      heading: "Who helps us",
      blocks: [
        "A few trusted companies process information for us, only to run Kestlow and only as we instruct:",
        {
          list: [
            "Cloudflare: runs our website and servers, protects them from attacks, and forwards emails sent to our @kestlow.co.uk addresses.",
            "Neon: hosts our database, in London.",
            "Resend: sends our emails, such as sign-up confirmations and alerts, from the EU.",
            "Google: our support inbox, where emails and Contact us messages arrive, runs on Gmail.",
            "GitHub: runs the nightly jobs that collect planning applications and send push alerts.",
            "Your browser's push service (from Google, Mozilla, Apple or Microsoft, depending on your browser): delivers push alerts to your device.",
            "postcodes.io: looks up where your base postcode is. Only the postcode is sent.",
            "Stripe, once paid plans start: takes payments by card or Direct Debit, and keeps the payment details needed to do that.",
            "OpenStreetMap: provides the map images. Your browser fetches them directly, so OpenStreetMap sees your IP address, as with any website you visit.",
          ],
        },
        "Some of these companies are based in the United States. Where your information leaves the UK, it's protected by UK adequacy arrangements or the standard contract terms the ICO approves.",
      ],
    },
    {
      heading: "How long we keep it",
      blocks: [
        {
          list: [
            "Your account and everything that goes with it: until you delete your account. Deleting it, from the Account page, removes your account, settings, saved leads, alert history and push alerts straight away, and any waitlist sign-up with the same email address.",
            "Signed-in sessions: up to 30 days.",
            "Password reset links last an hour, and email confirmation links 24 hours.",
            "Messages you send us: up to two years, then we delete them.",
            "The scrambled record of a free trial: for as long as we offer free trials.",
            "Records of payments: five years after the 31 January tax return deadline for the year they belong to, as HMRC requires.",
            "Error reports: 30 days.",
            "Waitlist sign-ups: until Kestlow opens in your area, or sooner if you ask.",
            "Copies in our database's backups expire within seven days.",
          ],
        },
      ],
    },
    {
      heading: "Your rights",
      blocks: [
        "You can ask us for a copy of your information, to correct it, to delete it, to limit how we use it, to object to how we use it, or to have it sent to you in a format a computer can read. Where we rely on your consent, such as for push alerts or the waitlist, you can withdraw it at any time. You can delete your account yourself from the Account page; for anything else, email " +
          `${CONTACT.privacy}. We'll reply within one month.`,
        "If you're unhappy with how we've handled your information, please tell us first and we'll put it right. You can also complain to the Information Commissioner's Office at https://ico.org.uk or on 0303 123 1113.",
      ],
    },
    {
      heading: "Changes to this notice",
      blocks: [
        "If we change this notice, we'll update it here and change the date at the top. If a change matters to you, we'll email you before it takes effect.",
      ],
    },
  ],
};

export const TERMS: LegalDocument = {
  title: "Terms of service",
  updated: UPDATED,
  intro: [
    `These terms are the agreement between you and ${OWNER} ("we", "us"), ${BUSINESS_ADDRESS}, for using Kestlow. Please read them: by creating an account or using Kestlow, you agree to them. If anything's unclear, email ${CONTACT.hello}.`,
  ],
  sections: [
    {
      heading: "Who Kestlow is for",
      blocks: [
        "Kestlow is for tradespeople and trade businesses finding work. By using it, you confirm you're at least 18 and using it for your business. Because of that, the extra rights the law gives to consumers buying for personal use don't apply, but nothing in these terms takes away any rights the law says can't be taken away.",
      ],
    },
    {
      heading: "What Kestlow does, and doesn't do",
      blocks: [
        "Kestlow tells you about planning applications near you that may need your trade, from councils' public planning registers. We work hard to make it accurate and useful, but:",
        {
          list: [
            "We can't promise any application will lead to work, or that a job will go ahead.",
            "Planning information comes from councils and other sources, so it can be incomplete, late or wrong. Always check the council's own page, which every lead links to, before acting on it.",
            "Some locations are worked out from the address and are approximate; Kestlow says when.",
            "Leads aren't exclusive: other tradespeople may see the same applications.",
          ],
        },
      ],
    },
    {
      heading: "Your account",
      blocks: [
        {
          list: [
            "Give us accurate details, and keep your email address up to date so alerts reach you.",
            "Keep your password safe. An account is for one person; please don't share it.",
            "You're responsible for what happens on your account. If you think someone else has used it, change your password and tell us.",
          ],
        },
      ],
    },
    {
      heading: "Using Kestlow fairly",
      blocks: [
        "Please don't:",
        {
          list: [
            "copy, scrape, resell or republish Kestlow's leads or data in bulk, or use them to build a competing service;",
            "try to get into parts of Kestlow you're not meant to, overload it, or interfere with how it works;",
            "use Kestlow to harass anyone, including applicants and their neighbours.",
          ],
        },
        "When you contact people about their planning applications, you're responsible for following the law, including data protection and marketing rules. Be courteous, and respect anyone who says they're not interested or has a \"no cold callers\" notice.",
      ],
    },
    {
      heading: "Plans and payment",
      blocks: [
        "Kestlow has a free plan. Once paid plans start:",
        {
          list: [
            "New accounts get 14 days of the Pro plan free, with no card needed. If you don't choose a paid plan by the end, your account moves to the free plan and you're not charged anything. We'll email you 3 days before your trial ends. There's one free trial per person: an email address that has had one won't get another, even after its account is deleted.",
            "Paid plans are monthly or yearly, paid in advance by card or Direct Debit through our payment provider, Stripe, and renew automatically until you cancel. We'll email you at least 7 days before a yearly plan renews.",
            "We're not registered for VAT, so no VAT is added to our prices. If that changes, we'll tell you at least 30 days before.",
            "You can cancel at any time from your Account page. You'll keep your plan until the end of the period you've paid for, and won't be charged again.",
            "Instead of cancelling, you can pause a paid plan for up to 3 months, once in any 12 months. You're not charged while it's paused, and your account works like the free plan until it restarts.",
            "Changing plan: an upgrade starts straight away, charged for the rest of the period. A downgrade starts when your next payment is due: you keep your current plan until then, and nothing is refunded.",
            "Founding members: the first 100 customers to pay keep their launch price for as long as they stay subscribed. Pausing doesn't lose it; cancelling does.",
            "Prices are as shown when you sign up. If we change a price, we'll email you at least 30 days before it affects you, so you can cancel first if you'd rather.",
            "If a payment fails, Stripe tries again and we'll email you. You keep your plan for 7 days while it's sorted; after that, your account moves to the free plan until it's paid.",
            "We don't refund payments for time you've had. Our refund policy covers the exceptions, such as a charge we take by mistake.",
          ],
        },
      ],
    },
    {
      heading: "Changes to Kestlow",
      blocks: [
        "We'll keep improving Kestlow, which means features may change. We aim to keep it running all the time, but we can't promise it will never be unavailable, for example during maintenance. If we ever stop running Kestlow, we'll give you at least 30 days' notice and refund any time you've paid for and won't get.",
      ],
    },
    {
      heading: "Ending your account",
      blocks: [
        "You can delete your account at any time from the Account page. We may suspend or close an account that breaks these terms; if we do, we'll tell you why, unless the law stops us.",
      ],
    },
    {
      heading: "Our responsibility to you",
      blocks: [
        "Nothing in these terms limits our responsibility for death or personal injury caused by our negligence, for fraud, or for anything else the law doesn't allow us to limit. Otherwise:",
        {
          list: [
            "we're not responsible for loss of profit, business, work, contracts or opportunity, or for any indirect loss;",
            "our total responsibility to you is limited to the amount you've paid us in the 12 months before the problem arose.",
          ],
        },
      ],
    },
    {
      heading: "Who owns what",
      blocks: [
        "Kestlow's software, design and name are ours. Planning information belongs to the councils and others who publish it. Kestlow also uses Ordnance Survey and OpenStreetMap data, which they're credited for where it appears.",
      ],
    },
    {
      heading: "Changes to these terms",
      blocks: [
        "We may update these terms. If a change matters, we'll email you at least 30 days before it takes effect. If you keep using Kestlow after that, the new terms apply; if you don't agree, you can delete your account.",
      ],
    },
    {
      heading: "The law that applies",
      blocks: [
        "These terms are governed by the law of England and Wales, and the courts of England and Wales can decide any dispute. Please talk to us first, though: email " +
          `${CONTACT.support} and we'll do our best to sort it out.`,
      ],
    },
  ],
};

export const REFUNDS: LegalDocument = {
  title: "Refund policy",
  updated: UPDATED,
  intro: ["This policy applies once paid plans start, and sits alongside our terms of service."],
  sections: [
    {
      heading: "Try it free first",
      blocks: [
        "Every new account gets 14 days of the Pro plan free, with no card needed, so you can see the leads in your own area before you pay anything. Because of that, we don't refund payments for time you've had, except as below.",
      ],
    },
    {
      heading: "Cancelling",
      blocks: [
        {
          list: [
            "You can cancel at any time from your Account page, and you won't be charged again.",
            "You'll keep your plan until the end of the period you've already paid for.",
            "We don't refund part-used months or years, or the rest of a plan you downgrade from.",
          ],
        },
      ],
    },
    {
      heading: "When we'll always refund",
      blocks: [
        {
          list: [
            "If we've charged you by mistake, such as twice for the same period, we'll refund the mistaken charge in full, whenever you notice.",
            "If we stop running Kestlow or your plan, we'll refund the time you've paid for and won't get.",
          ],
        },
      ],
    },
    {
      heading: "How to ask",
      blocks: [
        `Email ${CONTACT.billing} from the email address on your account. We'll refund to the card or account you paid with within 14 days of agreeing it, though your bank may take a few more working days to show it.`,
      ],
    },
  ],
};
