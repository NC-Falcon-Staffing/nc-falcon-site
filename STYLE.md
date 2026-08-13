# Writing style

How copy on this site is written, and how anyone (or any assistant) working in
this repo should write.

## Voice

Simple and direct. Not showy.

## Two patterns to avoid

**Statement, comma, opposite statement.**

- No: We build long-term partnerships, not one-off transactions.
- Yes: We build long-term partnerships.

**Statement, dash, emphasis kicker.**

- No: Clear, direct, and responsive - no runaround.
- Yes: Clear, direct, and responsive.

In both cases the fix is the same: keep the substantive first half, delete the
rhetorical second half. The second half is almost never carrying information.

The same reasoning rules out:

- Rhetorical ad-copy questions: "Short-handed? Scaling up?"
- "Real X, real Y" fragments
- Punchy sentence fragments used for rhythm: "Relationships first."

## Punctuation

**In English prose, avoid em dashes, and never use several. A spaced hyphen
" - " is the normal substitute. A plain dash is fine where one is genuinely
needed.**

The em dash has become strongly associated with AI-generated text. Whatever its
merits as punctuation, it now reads as a tell, and on a site whose entire pitch
is that a real family runs this business, that costs more than the punctuation
is worth. The problem is density more than the character itself. One in a long
document is invisible. Four on a page is the tell.

This covers English site copy, content JSON, code comments, docs, commit
messages, and assistant replies. Three things it does not cover:

**Markup and metadata.** `<title>`, `og:title`, `twitter:title` and
`og:image:alt` all use "Page Name — NC Falcon Electrical Staffing" on every
page. That dash is a structural separator doing the job of a pipe or a colon,
not prose. Nobody reads a browser tab and hears a machine. Leave those, and
match the pattern on any new page.

**Spanish prose.** The raya is standard Spanish typography for parentheticals,
not a stylistic flourish. A spaced hyphen there reads as an error to a native
speaker, which costs more than reading as AI would. Write Spanish the way
Spanish is written.

**Hyphens as syntax.** `data-cms`, `stroke-width`, `--navy-700` and CLI flags
are unaffected.

Often the better fix is not swapping the character but restructuring the
sentence, since a dash in the middle of a sentence is frequently the "emphasis
kicker" pattern above wearing a different hat. Reach for that first.

## When editing copy

Two things bite here, both silent:

**Every string exists twice.** The JSON in `/content` holds the live value and
the HTML holds the same text as a fallback. Change one and not the other, and
the old wording reappears whenever the JSON fails to load or JavaScript is off.

**Spanish twins.** Every English key has an `_es` twin beside it. If the English
changes and the Spanish doesn't, `/es/` keeps serving the old text with no
warning, because a filled `_es` value always wins over its English twin.

## Known cleanup

Roughly 60 em dashes in English body copy predate this rule, spread across the
site pages. The content JSON is already clean, as are the privacy pages, the
README, the build script, the CMS config and the working notes in
`_local-docs/`.

Under the current rule this is a judgement pass, not a search and replace. Most
of those 60 are fine on their own. What matters is a page carrying several.
Restructure the sentence where the dash is an emphasis kicker, and leave the
rest alone.
