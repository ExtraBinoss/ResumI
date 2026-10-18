/** Original, deterministic vector ornaments. Every mark remains a native shape. */
export function ArtfulChromaMark() {
  return (
    <svg className="cv-af-chroma-mark" viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r="73" fill="#25252b" />
      {[0, 30, 60, 90, 120, 150].map((angle) => (
        <ellipse
          key={angle}
          cx="80"
          cy="80"
          rx="62"
          ry="17"
          fill="none"
          stroke="#ff745d"
          strokeWidth="1.8"
          transform={`rotate(${angle} 80 80)`}
        />
      ))}
      <circle cx="80" cy="80" r="10" fill="#fff4df" />
    </svg>
  );
}

export function ArtfulTerrazzoArt() {
  return (
    <svg
      className="cv-af-terrazzo-art"
      viewBox="0 0 112 1123"
      aria-hidden="true"
    >
      <g transform="scale(0.7 1.123)">
        <path d="M0 0h160v1000H0Z" fill="#e9e3d7" />
        <path d="m21 13 70 17-18 66-49-7Z" fill="#8d5749" />
        <path d="m125 3 35 31v106l-44-39Z" fill="#243f3a" />
        <path d="m3 124 45-10 17 59-36 30-29-12Z" fill="#b9c4ad" />
        <path d="m83 151 51 7 22 59-58 23-28-44Z" fill="#c19d63" />
        <path d="m0 246 44-23 17 87-61 21Z" fill="#faf7ef" />
        <path d="m112 280 48 14v111l-64-41Z" fill="#9d5c48" />
        <path d="m22 353 53-8 20 70-65 28Z" fill="#233d38" />
        <path d="m0 469 36-22 19 54-55 28Z" fill="#c49e64" />
        <path d="m96 453 64 10v83l-47 17-33-58Z" fill="#b8c0ad" />
        <path d="m24 553 57 13-17 73-64-17v-36Z" fill="#b16e58" />
        <path d="m110 611 50 7v98l-61-30Z" fill="#f9f6ed" />
        <path d="m18 692 63-9 16 61-61 47-36-19v-48Z" fill="#b8c0ad" />
        <path d="m115 757 45-14v90l-51 17-14-56Z" fill="#243f3a" />
        <path d="m8 834 58-20 25 52-46 43-45-18Z" fill="#c49e64" />
        <path d="m98 914 62-24v110h-79Z" fill="#9a5f4b" />
        <path d="m0 954 46-34 19 55-18 25H0Z" fill="#faf7ef" />
        {[
          [107, 126],
          [17, 319],
          [71, 467],
          [128, 585],
          [16, 665],
          [91, 815],
          [59, 934],
        ].map(([x, y], i) => (
          <path key={i} d={`m${x} ${y} 11-5 7 14-12 6Z`} fill="#5d6258" />
        ))}
      </g>
    </svg>
  );
}

export function ArtfulSpectrumArt() {
  return (
    <svg
      className="cv-af-spectrum-art"
      viewBox="0 0 210 180"
      aria-hidden="true"
    >
      <rect x="65" y="4" width="138" height="138" rx="69" fill="#e2f17e" />
      <path d="M9 70h112a55 55 0 0 1 0 110H9Z" fill="#f0a5bb" />
      <path
        d="M65 70h56a55 55 0 0 1 55 55v17h-42a69 69 0 0 1-69-69Z"
        fill="#f38a71"
      />
      <rect x="16" y="18" width="56" height="56" rx="28" fill="#353254" />
      <path d="M45 32v28M31 46h28" stroke="#ede9ff" strokeWidth="1.8" />
      <path d="m191 159 10 10m-10 0 10-10" stroke="#353254" strokeWidth="1.4" />
    </svg>
  );
}

export function ArtfulBloomArt() {
  return (
    <svg className="cv-af-bloom-art" viewBox="0 0 250 250" aria-hidden="true">
      <path
        d="M131 245c12-80-4-128-16-174M136 181c27-13 48-34 63-62M123 131C94 105 75 83 67 47"
        fill="none"
        stroke="#38544c"
        strokeWidth="2"
      />
      <path d="M137 204c-45-10-71-39-72-70 42 0 72 22 72 70Z" fill="#718a69" />
      <path d="M138 180c37-4 64-25 76-56-38-6-69 13-76 56Z" fill="#a6b38a" />
      <path d="M114 111c-34 4-63-13-76-38 35-13 67 0 76 38Z" fill="#38544c" />
      <path d="M194 119c-10-22-8-44 8-63 20 23 18 45-8 63Z" fill="#718a69" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="122"
          cy="45"
          rx="18"
          ry="35"
          fill="#b63e58"
          transform={`rotate(${angle} 122 72)`}
        />
      ))}
      <circle cx="122" cy="72" r="19" fill="#e9ad51" />
      <circle cx="122" cy="72" r="7" fill="#f9e4d7" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="66"
          cy="24"
          rx="9"
          ry="18"
          fill="#d99d85"
          transform={`rotate(${angle} 66 39)`}
        />
      ))}
      <circle cx="66" cy="39" r="7" fill="#665142" />
      <path d="M136 211c16-16 35-23 55-19-8 23-27 32-55 28Z" fill="#38544c" />
      <path d="m14 180 8 4-5 8-9-5Z" fill="#e9ad51" />
      <circle cx="214" cy="25" r="4" fill="#b63e58" />
    </svg>
  );
}

export function ArtfulKineticArt() {
  return (
    <svg className="cv-af-kinetic-art" viewBox="0 0 190 190" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path
          key={i}
          d={`M${18 + i * 10} 172V${86 + i * 2}a${71 - i * 8} ${71 - i * 8} 0 0 1 ${142 - i * 16} 0v${86 - i * 2}`}
          stroke="#2446e8"
          strokeWidth="3"
          fill="none"
        />
      ))}
      <circle cx="87" cy="100" r="24" fill="#f2763c" />
      <path d="M14 13h37M14 13v37" stroke="#f2763c" strokeWidth="2" />
    </svg>
  );
}

export function ArtfulPatinaArt() {
  return (
    <svg className="cv-af-patina-art" viewBox="0 0 190 250" aria-hidden="true">
      <path
        d="M20 211h149M95 8v225"
        stroke="#77817b"
        strokeWidth=".6"
        strokeDasharray="3 4"
      />
      <ellipse
        cx="95"
        cy="190"
        rx="63"
        ry="21"
        fill="#40534e"
        stroke="#94b2a2"
        strokeWidth="1"
      />
      <path
        d="M32 168v22c0 28 126 28 126 0v-22"
        fill="#56746a"
        stroke="#a2b6a5"
      />
      <ellipse
        cx="95"
        cy="168"
        rx="63"
        ry="21"
        fill="#8fa692"
        stroke="#b3c0a8"
      />
      <path
        d="M45 112v30c0 23 100 23 100 0v-30"
        fill="#965f43"
        stroke="#c29167"
      />
      <ellipse
        cx="95"
        cy="112"
        rx="50"
        ry="17"
        fill="#c19168"
        stroke="#ecc5a0"
      />
      <ellipse
        cx="95"
        cy="111"
        rx="31"
        ry="10"
        fill="#344440"
        stroke="#ebbb92"
      />
      <path d="M62 51v27c0 15 66 15 66 0V51" fill="#bc8b64" stroke="#e7b48b" />
      <ellipse
        cx="95"
        cy="51"
        rx="33"
        ry="11"
        fill="#ddb18a"
        stroke="#f0cfae"
      />
      <ellipse cx="95" cy="50" rx="12" ry="4" fill="#597267" />
      <path
        d="M159 50h19M159 168h19M174 50v118M170 54l4-4 4 4M170 164l4 4 4-4"
        fill="none"
        stroke="#c9aa88"
        strokeWidth=".7"
      />
      <circle cx="24" cy="25" r="3" fill="#c19168" />
      <path d="M33 25h35M23 232h144" stroke="#737f76" strokeWidth=".7" />
    </svg>
  );
}
