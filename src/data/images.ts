/**
 * Temporary Unsplash photography. Swap these ids (or replace `photo()` with
 * local paths) once the client's own shoot is available.
 */
export const photo = (id: string, width = 1600, quality = 78) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`;

export const srcset = (id: string, widths = [720, 1200, 1800, 2400]) =>
  widths.map((w) => `${photo(id, w)} ${w}w`).join(', ');

export const IMAGES = {
  thaliDark: '1626777552726-4a6b54c97e46',
  thaliWarm: '1567337710282-00832b415979',
  thaliSteel: '1546833999-b9f581a1996d',
  pavPlatter: '1606491956689-2ea866880c84',
  interiorMoody: '1517248135467-4c7edcad34c4',
  interiorWarm: '1552566626-52f8b828add9',
  friendsDinner: '1528605248644-14dd04022da1',
  masalaDosa: '1668236543090-82eba5ee5976',
  paneerTikka: '1567188040759-fb8a883dc6d8',
  biryaniDark: '1563379091339-03b21ab4a4f8',
  vegPulao: '1596560548464-f010549b84d7',
  chaat: '1610192244261-3f33de3f55e4',
  paniPuri: '1541014741259-de529411b96a',
  samosa: '1601050690597-df0568f70950',
  pavBhaji: '1626132647523-66f5bf380027',
  bananaLeaf: '1625398407796-82650a8c135f',
  idliVada: '1630383249896-424e482df921',
  cocktailDark: '1514362545857-3bc16c4c7d1b',
  cocktailPour: '1470337458703-46ad1756a187',
} as const;
