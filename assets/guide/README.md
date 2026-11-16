# Portfolio assistant artwork

Owner-supplied source: `Portfoilo Asistance.png` (1536 × 1024 RGBA, 2,134,234 bytes).
Original bytes are preserved as `source-atlas.png`, outside the public directory.
SHA-256: `ea86951126787ae4e9893a4285afb640e602f1669a898e205fd5a18e5485d4c6`.

## Permission and provenance

On 2026-11-11, the owner was asked whether they own the character or have permission
to adapt/publish it, and replied: **“yes I drew it myself”**. This is the permission
basis for adaptation and use on their Portfolio Quest website. No third-party
asset pack or public redistribution license was supplied; do not treat this as
an openly licensed character library.

The original PNG also contains C2PA/JUMBF metadata reporting a `gpt-image` 2.0
created action and OpenAI Media Service processing. This is recorded separately
from the owner's authorship statement; the cryptographic signature/complete
creation history was not independently validated. The source file retains that
metadata. Derived atlases have a new pixel hash and cannot retain the original
validity claim. No generative model or paid service was used to create the crops.

For context, OpenAI's [Terms of Use](https://openai.com/en-GB/policies/row-terms-of-use/)
and [Services Agreement](https://openai.com/policies/services-agreement/) assign
output rights as between the applicable customer and OpenAI, while requiring
rights to inputs. These terms alone do not establish who created this particular
file. The owner confirmation above is the project-specific authorization.

## Production processing

Run `python3 scripts/prepare-guide-atlas.py` from the website root. Preparation
requires Pillow (tested with the already installed version); the website does
not need Python, Pillow, a new npm dependency or an image service.

- Input is an **irregular atlas**. `GROUPS` lists measured per-frame regions and
  pelvis anchors. No equal input grid is assumed.
- A connected alpha mask isolates each character; faint background/shadows,
  labels, neighboring fragments and detached effect marks are excluded. Measured
  exclusions remove a touching walk label and attached gold marks.
- Edge alpha is remapped and edge RGB pulled from solid interior pixels to reduce
  background color fringes. Resampling is uniform, never independent X/Y scaling.
- The 42 clean frames occupy 144 × 176 output cells with feet at y=160, pelvis
  anchor x=72 and a 140px apparent body height. A regular **output** packing is safe
  after individual extraction; it is not a description of the source layout.
- `frame-map.json` records each exact source region, extracted bounds, anchor,
  scale and output bounds. A source hash guard requires remeasurement on changes.
- Public `assistant-atlas.webp` is 1,008 × 1,056 with exact alpha, high-quality RGB
  compression; `assistant-idle.webp` is a matching static poster. Production has
  one atlas download shared by the scene and conversation portrait.
- CSS display canvas is 90 × 110px (about 87.5px character height); conversation
  portrait is 48px wide. Source detail is finite: high-DPI rendering does not
  create missing artwork detail. No runtime scale stretch or pixelated filtering.

The available source walks are similar poses rather than a complete mechanical
contact/passing/contact gait. Selected side-facing frames use a ping-pong loop to
avoid abrupt first/last pose changes; frame phase follows distance travelled.
The source calling sequence includes a back-facing pose, so speech uses frontal
calling/neutral poses. Front wave and happy poses supply a short greeting gesture.
Full new walk/run key-pose artwork is a future art task, not claimed generated here.
Run/hurt/climbing are not used by the entrance and were intentionally not shipped.

See `docs/AVATAR_QUALITY_REVIEW.md` for implementation, validation and visual evidence.
