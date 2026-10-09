import assert from "node:assert/strict";
import test from "node:test";
import { resolveClientFormRedirect } from "../clientFormRedirect.ts";

test("accepts a public https URL and derives the host from it", () => {
  assert.deepEqual(resolveClientFormRedirect("https://acme.se/thank-you?x=1#top"), {
    href: "https://acme.se/thank-you?x=1#top",
    host: "acme.se",
  });
});

test("shows an internationalised domain in its punycode form", () => {
  assert.deepEqual(resolveClientFormRedirect("https://bücher.de/"), {
    href: "https://xn--bcher-kva.de/",
    host: "xn--bcher-kva.de",
  });
});

for (const raw of [
  null,
  undefined,
  42,
  { url: "https://acme.se" },
  "",
  "javascript:alert(1)",
  "java\tscript:alert(1)",
  "data:text/html,hi",
  "http://acme.se",
  "//acme.se",
  "acme.se",
  "https://user:pass@acme.se",
  "https://acme.se@evil.example",
  "https://acme.se\\@evil.example",
  "https://acme .se",
  "https://acme.se/\npath",
  "https://127.0.0.1/",
  "https://[::1]/",
  "https://localhost/",
  "https://intranet/",
  `https://acme.se/${"a".repeat(2050)}`,
]) {
  test(`refuses ${JSON.stringify(raw)?.slice(0, 40)}`, () => {
    assert.equal(resolveClientFormRedirect(raw), null);
  });
}
