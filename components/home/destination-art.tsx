type DestinationArtProps = { kind: "work" | "concepts" | "arcade" | "about" | "contact" };

/** Original line artwork, drawn for section navigation; no reference imagery. */
export function DestinationArt({ kind }: DestinationArtProps) {
  return (
    <svg className="destination-art" viewBox="0 0 240 220" aria-hidden="true" focusable="false">
      {kind === "work" ? <>
        <rect x="30" y="30" width="180" height="150" rx="4" />
        <path d="M30 58h180M66 58v122M86 83h98M86 101h62" />
        <rect x="86" y="124" width="42" height="34" rx="2" />
        <rect x="142" y="124" width="42" height="34" rx="2" />
        <circle cx="42" cy="44" r="2" /><circle cx="51" cy="44" r="2" />
      </> : null}
      {kind === "concepts" ? <>
        <circle cx="120" cy="110" r="63" /><circle cx="120" cy="110" r="27" />
        <ellipse cx="120" cy="110" rx="95" ry="27" transform="rotate(-30 120 110)" />
        <path d="M120 19v20M120 181v20M29 110h20M191 110h20" />
      </> : null}
      {kind === "arcade" ? <>
        <path d="M63 72h114l25 79q4 18-10 20-9 2-23-22H71q-14 24-23 22-14-2-10-20Z" />
        <path d="M70 99v30M55 114h30" />
        <circle cx="158" cy="104" r="6" /><circle cx="177" cy="121" r="6" />
        <path d="M105 120h30M93 72l8-22h38l8 22" />
      </> : null}
      {kind === "about" ? <>
        <circle cx="120" cy="72" r="32" />
        <path d="M57 180c0-65 126-65 126 0ZM35 28h23M35 28v23M205 192h-23M205 192v-23" />
        <circle cx="120" cy="111" r="87" />
      </> : null}
      {kind === "contact" ? <>
        <rect x="29" y="51" width="182" height="122" rx="3" />
        <path d="m29 51 91 76 91-76M29 173l65-67M211 173l-65-67" />
      </> : null}
    </svg>
  );
}
