/**
 * @provenote/core — pure, framework-free logic shared by the web app and
 * (indirectly, via recorded fixtures) the unit test suite. No browser
 * globals, no network, no filesystem: this package's whole job is to be
 * testable in plain Node without touching the c2pa WASM reader itself.
 *
 * Filled in starting M1 (docs/SPEC.md): the chain-summary transformer
 * (raw c2pa-web lib output -> plain-language model) lives here.
 */
export const CORE_VERSION = "0.1.0";
