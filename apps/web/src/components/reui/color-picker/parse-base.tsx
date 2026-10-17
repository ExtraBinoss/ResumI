// Imported with shadcn CLI from ReUI's Base UI registry (MIT); split by responsibility.
import { Triple } from "./types";

export const HEX_PATTERN = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/;

export const FUNCTION_PATTERN = /^([a-z][a-z\d-]*)\(([\s\S]*)\)$/;

export const NUMBER_PATTERN =
  /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%|deg|rad|grad|turn)?$/;

export const NAMED_COLORS =
  "alicebluef0f8ff antiquewhitefaebd7 aqua00ffff aquamarine7fffd4 " +
  "azuref0ffff beigef5f5dc bisqueffe4c4 black000000 blanchedalmondffebcd " +
  "blue0000ff blueviolet8a2be2 browna52a2a burlywooddeb887 " +
  "cadetblue5f9ea0 chartreuse7fff00 chocolated2691e coralff7f50 " +
  "cornflowerblue6495ed cornsilkfff8dc crimsondc143c cyan00ffff " +
  "darkblue00008b darkcyan008b8b darkgoldenrodb8860b darkgraya9a9a9 " +
  "darkgreen006400 darkgreya9a9a9 darkkhakibdb76b darkmagenta8b008b " +
  "darkolivegreen556b2f darkorangeff8c00 darkorchid9932cc darkred8b0000 " +
  "darksalmone9967a darkseagreen8fbc8f darkslateblue483d8b " +
  "darkslategray2f4f4f darkslategrey2f4f4f darkturquoise00ced1 " +
  "darkviolet9400d3 deeppinkff1493 deepskyblue00bfff dimgray696969 " +
  "dimgrey696969 dodgerblue1e90ff firebrickb22222 floralwhitefffaf0 " +
  "forestgreen228b22 fuchsiaff00ff gainsborodcdcdc ghostwhitef8f8ff " +
  "goldffd700 goldenroddaa520 gray808080 green008000 greenyellowadff2f " +
  "grey808080 honeydewf0fff0 hotpinkff69b4 indianredcd5c5c indigo4b0082 " +
  "ivoryfffff0 khakif0e68c lavendere6e6fa lavenderblushfff0f5 " +
  "lawngreen7cfc00 lemonchiffonfffacd lightblueadd8e6 lightcoralf08080 " +
  "lightcyane0ffff lightgoldenrodyellowfafad2 lightgrayd3d3d3 " +
  "lightgreen90ee90 lightgreyd3d3d3 lightpinkffb6c1 lightsalmonffa07a " +
  "lightseagreen20b2aa lightskyblue87cefa lightslategray778899 " +
  "lightslategrey778899 lightsteelblueb0c4de lightyellowffffe0 lime00ff00 " +
  "limegreen32cd32 linenfaf0e6 magentaff00ff maroon800000 " +
  "mediumaquamarine66cdaa mediumblue0000cd mediumorchidba55d3 " +
  "mediumpurple9370db mediumseagreen3cb371 mediumslateblue7b68ee " +
  "mediumspringgreen00fa9a mediumturquoise48d1cc mediumvioletredc71585 " +
  "midnightblue191970 mintcreamf5fffa mistyroseffe4e1 moccasinffe4b5 " +
  "navajowhiteffdead navy000080 oldlacefdf5e6 olive808000 olivedrab6b8e23 " +
  "orangeffa500 orangeredff4500 orchidda70d6 palegoldenrodeee8aa " +
  "palegreen98fb98 paleturquoiseafeeee palevioletreddb7093 " +
  "papayawhipffefd5 peachpuffffdab9 perucd853f pinkffc0cb plumdda0dd " +
  "powderblueb0e0e6 purple800080 rebeccapurple663399 redff0000 " +
  "rosybrownbc8f8f royalblue4169e1 saddlebrown8b4513 salmonfa8072 " +
  "sandybrownf4a460 seagreen2e8b57 seashellfff5ee siennaa0522d " +
  "silverc0c0c0 skyblue87ceeb slateblue6a5acd slategray708090 " +
  "slategrey708090 snowfffafa springgreen00ff7f steelblue4682b4 tand2b48c " +
  "teal008080 thistled8bfd8 tomatoff6347 turquoise40e0d0 violetee82ee " +
  "wheatf5deb3 whiteffffff whitesmokef5f5f5 yellowffff00 " +
  "yellowgreen9acd32";

export let namedColors: Map<string, string> | null = null;

export function namedColor(name: string) {
  namedColors ??= new Map(
    NAMED_COLORS.split(" ").map((entry) => [
      entry.slice(0, -6),
      entry.slice(-6),
    ]),
  );
  return namedColors.get(name);
}

export function readNumber(token: string, percentOf: number, angle = false) {
  if (token === "none") return 0;
  const match = NUMBER_PATTERN.exec(token);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const unit = match[2];
  if (!unit) return value;
  if (unit === "%") return angle ? null : (value * percentOf) / 100;
  if (!angle) return null;
  if (unit === "rad") return (value * 180) / Math.PI;
  if (unit === "grad") return value * 0.9;
  if (unit === "turn") return value * 360;
  return value;
}

export type Matrix = [Triple, Triple, Triple];

export const multiply = (matrix: Matrix, [x, y, z]: Triple): Triple =>
  matrix.map((row) => row[0] * x + row[1] * y + row[2] * z) as Triple;

export const compose = (outer: Matrix, inner: Matrix): Matrix =>
  outer.map((row) =>
    [0, 1, 2].map(
      (column) =>
        row[0] * inner[0][column] +
        row[1] * inner[1][column] +
        row[2] * inner[2][column],
    ),
  ) as Matrix;

export const XYZ_TO_SRGB: Matrix = [
  [12831 / 3959, -329 / 214, -1974 / 3959],
  [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
  [705 / 12673, -2585 / 12673, 705 / 667],
];

export const D50_TO_D65: Matrix = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];

export const D50_TO_SRGB = compose(XYZ_TO_SRGB, D50_TO_D65);

export const decodeSrgb = (value: number) => {
  const size = Math.abs(value);
  return (
    Math.sign(value) *
    (size <= 0.04045 ? size / 12.92 : ((size + 0.055) / 1.055) ** 2.4)
  );
};

export const RGB_SPACES: Record<
  string,
  { decode: (value: number) => number; toSrgb: Matrix | null }
> = {
  srgb: { decode: decodeSrgb, toSrgb: null },
  "srgb-linear": { decode: (value) => value, toSrgb: null },
  "display-p3": {
    decode: decodeSrgb,
    toSrgb: compose(XYZ_TO_SRGB, [
      [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
      [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
      [0, 0.04511338185890264, 1.043944368900976],
    ]),
  },
  "a98-rgb": {
    decode: (value) => Math.sign(value) * Math.abs(value) ** (563 / 256),
    toSrgb: compose(XYZ_TO_SRGB, [
      [573536 / 994567, 263643 / 1420810, 187206 / 994567],
      [591459 / 1989134, 6239551 / 9945670, 374412 / 4972835],
      [53769 / 1989134, 351524 / 4972835, 4929758 / 4972835],
    ]),
  },
  "prophoto-rgb": {
    decode: (value) => {
      const size = Math.abs(value);
      return size <= 16 / 512 ? value / 16 : Math.sign(value) * size ** 1.8;
    },
    toSrgb: compose(D50_TO_SRGB, [
      [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
      [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
      [0, 0, 0.8251046025104602],
    ]),
  },
  rec2020: {
    decode: (value) => {
      const size = Math.abs(value);
      return size < 0.018053968510807 * 4.5
        ? value / 4.5
        : Math.sign(value) *
            ((size + 0.09929682680944) / 1.09929682680944) ** (1 / 0.45);
    },
    toSrgb: compose(XYZ_TO_SRGB, [
      [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
      [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
      [0, 0.028072693049087428, 1.060985057710791],
    ]),
  },
  xyz: { decode: (value) => value, toSrgb: XYZ_TO_SRGB },
  "xyz-d65": { decode: (value) => value, toSrgb: XYZ_TO_SRGB },
  "xyz-d50": { decode: (value) => value, toSrgb: D50_TO_SRGB },
};
