/** Original decorative SVG drawn for this milestone; no third-party assets. */
export function WorldPreview() {
  return (
    <figure className="world-preview">
      <div className="preview-topline"><span aria-hidden="true">FIELD NOTES / 001</span><span>World in progress</span></div>
      <svg viewBox="0 0 600 440" aria-hidden="true" focusable="false" className="world-art">
        <ellipse cx="300" cy="365" rx="240" ry="28" fill="var(--temp-map-shadow)" />
        <path d="M60 250 300 128 544 250 304 390Z" fill="var(--temp-map-earth)" />
        <path d="M60 230 300 108 544 230 304 370Z" fill="var(--temp-map-grass)" />
        <path d="m60 230 244 140v20L60 250Z" fill="var(--temp-map-edge)" />
        <path d="m304 370 240-140v20L304 390Z" fill="var(--temp-map-earth)" />
        <path d="M302 338c-75-48 43-57 2-103s-102-8-106-55M304 236c36-38 84-4 122-37" fill="none" stroke="var(--temp-map-path)" strokeWidth="23" strokeLinecap="round" />
        <path d="m168 173 60-32 60 32-60 34Z" fill="var(--temp-map-shadow)" />
        <path d="M184 137v45l43 25v-48Z" fill="var(--temp-map-building)" />
        <path d="m227 159 41-23v47l-41 24Z" fill="var(--temp-map-building-shade)" />
        <path d="m173 139 53-69 55 68-54 31Z" fill="var(--temp-map-roof)" />
        <path d="m226 70 55 68-54 31Z" fill="var(--temp-map-roof-shade)" />
        <path d="M199 169v-18l15 9v18Z" fill="var(--temp-map-window)" />
        <path d="M242 196v-25q9-17 15-8v24Z" fill="var(--temp-map-ink)" />
        <path d="m367 201 48-27 44 27-47 28Z" fill="var(--temp-map-shadow)" />
        <path d="M380 150v49l32 18v-49Z" fill="var(--temp-map-lilac)" />
        <path d="m412 168 32-18v48l-32 19Z" fill="var(--temp-map-purple)" />
        <path d="m371 151 41-49 42 49-42 24Z" fill="var(--temp-map-purple)" />
        <path d="M393 182v-16l10 6v16Z" fill="var(--temp-map-window)" />
        <path d="m267 277 38-20 42 24-40 22Z" fill="var(--temp-map-shadow)" />
        <path d="M280 233v43l27 16v-44Z" fill="var(--temp-map-building)" />
        <path d="m307 248 27-15v43l-27 16Z" fill="var(--temp-map-building-shade)" />
        <path d="m270 233 37-34 37 34-37 21Z" fill="var(--temp-map-gold)" />
        <path d="m307 199 37 34-37 21Z" fill="var(--temp-map-gold-shade)" />
        <path d="M292 256v-13l8 5v13Z" fill="var(--temp-map-ink)" />
        <g fill="var(--temp-map-trunk)"><path d="M132 236h7v34h-7ZM470 249h7v33h-7ZM339 144h7v29h-7Z" /></g>
        <g fill="var(--temp-map-tree)"><ellipse cx="136" cy="224" rx="24" ry="34" /><ellipse cx="474" cy="235" rx="24" ry="34" /><ellipse cx="343" cy="130" rx="20" ry="29" /></g>
        <g fill="var(--temp-map-tree-light)"><ellipse cx="128" cy="214" rx="12" ry="21" /><ellipse cx="466" cy="225" rx="12" ry="21" /><ellipse cx="337" cy="121" rx="10" ry="18" /></g>
        <g fill="var(--temp-map-flower)"><circle cx="212" cy="277" r="4" /><circle cx="222" cy="283" r="3" /><circle cx="374" cy="285" r="4" /><circle cx="386" cy="279" r="3" /></g>
        <path d="M305 199v-37" stroke="var(--temp-map-ink)" strokeWidth="3" />
        <path d="m307 162 25 6-25 10Z" fill="var(--temp-map-roof)" />
        <g fill="none" stroke="var(--temp-map-ink)" strokeWidth="2" opacity=".5"><path d="M85 112h16m-8-8v16M475 89h16m-8-8v16M508 168h12m-6-6v12" /></g>
      </svg>
      <figcaption><span className="preview-dot" aria-hidden="true" />Illustrative world preview · Not playable yet</figcaption>
    </figure>
  );
}
