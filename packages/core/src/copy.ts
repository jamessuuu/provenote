import type { ProvesLine } from "./types";

/**
 * The three top-level headlines, verbatim from docs/SPEC.md's Inspector
 * surface definition. Changing this wording is changing the product's
 * central honesty claim — treat it as a pinned string, not house copy.
 */
export const HEADLINES = {
  validates:
    "These bytes were signed by the party named below, at the time shown — this says nothing about whether the depicted scene is real.",
  "fails-validation":
    "This chain fails validation. It may mean someone altered these bytes after signing — or it may mean the tool that made this file and the tool checking it merely disagree about a metadata schema version. Standard validators cannot tell you which, and treat both identically.",
  "no-chain":
    "No provenance chain is present. That is indistinguishable, by design, from a chain that was deliberately stripped 30 seconds ago — absence proves nothing about history, including whether one ever existed.",
} as const;

/**
 * Plain-language "proves / does not prove" pairs, keyed by C2PA assertion
 * label. Grounded in the C2PA spec's own mechanics and in arXiv
 * 2604.24890's findings (see docs — full citations on /docs/limitations),
 * not in anything provenote infers on its own. Unrecognized labels fall
 * back to GENERIC_ASSERTION_LINE rather than being silently dropped.
 */
export const ASSERTION_COPY: Record<string, { humanLabel: string; provesLine: ProvesLine }> = {
  "c2pa.actions": {
    humanLabel: "Edit actions",
    provesLine: {
      proves: "The signer's own tool declares these editing actions occurred, in this order.",
      doesNotProve:
        "That the list is complete. A tool can simply choose not to log an action — nothing in the chain can detect an omission.",
    },
  },
  "c2pa.actions.v2": {
    humanLabel: "Edit actions",
    provesLine: {
      proves: "The signer's own tool declares these editing actions occurred, in this order.",
      doesNotProve:
        "That the list is complete. A tool can simply choose not to log an action — nothing in the chain can detect an omission.",
    },
  },
  "c2pa.hash.data": {
    humanLabel: "Content hash (hard binding)",
    provesLine: {
      proves: "The exact bytes this hash covers have not changed since signing.",
      doesNotProve:
        "That every byte of the file is covered. C2PA's own exclusion-range mechanism lets some regions sit outside the hard-binding hash by design, so they can be edited post-signing with no signature break.",
    },
  },
  "c2pa.hash.boxes": {
    humanLabel: "Content hash (hard binding)",
    provesLine: {
      proves: "The exact byte ranges this hash covers have not changed since signing.",
      doesNotProve:
        "That every byte of the file is covered. C2PA's own exclusion-range mechanism lets some regions sit outside the hard-binding hash by design.",
    },
  },
  "c2pa.thumbnail.claim": {
    humanLabel: "Embedded thumbnail",
    provesLine: {
      proves: "This is the thumbnail the signer's tool embedded at signing time.",
      doesNotProve: "That the thumbnail matches the current full-resolution image data.",
    },
  },
  "c2pa.thumbnail.ingredient": {
    humanLabel: "Ingredient thumbnail",
    provesLine: {
      proves: "This is the thumbnail the signer's tool embedded for this ingredient.",
      doesNotProve: "That the thumbnail matches the ingredient's current full-resolution data.",
    },
  },
  "stds.schema-org.CreativeWork": {
    humanLabel: "Authorship / credit metadata",
    provesLine: {
      proves: "The signer's tool attached this authorship metadata under its own signature.",
      doesNotProve: "That the named party is who they claim to be, or consented to being named.",
    },
  },
  "c2pa.metadata": {
    humanLabel: "Capture metadata (EXIF/XMP)",
    provesLine: {
      proves: "The signer's tool captured or declared these metadata fields.",
      doesNotProve:
        "That the capture device itself wasn't pointed at a screen showing fabricated content — real metadata from a real camera can describe a fake scene (the analog hole).",
    },
  },
  "c2pa.cawg.identity": {
    humanLabel: "Identity assertion (CAWG)",
    provesLine: {
      proves: "A named identity is cryptographically linked to this claim.",
      doesNotProve: "That the identity provider verified the person's real-world identity beyond its own account-creation process.",
    },
  },
};

export const GENERIC_ASSERTION_LINE: ProvesLine = {
  proves: "The signer's tool included this data under its own signature.",
  doesNotProve: "Anything about whether the data itself is accurate — only that it was included.",
};

export const INGREDIENT_LINE: ProvesLine = {
  proves: "This asset declares these upstream components or edits as its inputs.",
  doesNotProve:
    "That the ingredient list is exhaustive, or that any listed ingredient's own chain — if it has one — was itself checked to this same standard. Trust does not automatically compound down the chain beyond what each link's own validation actually covers.",
};

export const SIGNER_LINE: ProvesLine = {
  proves: "A named signer certified these exact bytes at a stated time, using the certificate shown.",
  doesNotProve:
    "Whether the depicted scene is real, whether the signer verified it themselves, or whether the certificate's issuer is trusted by anyone other than this file's own claim.",
};
