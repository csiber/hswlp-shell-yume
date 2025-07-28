export interface SimpleID3Data {
  title: string | null;
  artist: string | null;
  album: string | null;
  picture?: { mime: string; data: Uint8Array };
}

function synchsafeToInt(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] & 0x7f) << 21 |
    (bytes[offset + 1] & 0x7f) << 14 |
    (bytes[offset + 2] & 0x7f) << 7 |
    (bytes[offset + 3] & 0x7f)
  );
}

function decodeText(frame: Uint8Array): string | null {
  if (!frame.length) return null;
  const enc = frame[0];
  const data = frame.subarray(1);
  let decoder: TextDecoder;
  if (enc === 0) decoder = new TextDecoder('iso-8859-1');
  else if (enc === 1) decoder = new TextDecoder('utf-16');
  else if (enc === 3) decoder = new TextDecoder('utf-8');
  else decoder = new TextDecoder();
  return decoder.decode(data).replace(/\0/g, '').trim() || null;
}

export function parseID3(buffer: ArrayBuffer): SimpleID3Data | null {
  const bytes = new Uint8Array(buffer);
  let title: string | null = null;
  let artist: string | null = null;
  let album: string | null = null;
  let pictureMime: string | null = null;
  let pictureData: Uint8Array | null = null;

  if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const tagSize = synchsafeToInt(bytes, 6);
    let offset = 10;
    while (offset + 10 <= bytes.length && offset < 10 + tagSize) {
      const id = String.fromCharCode(
        bytes[offset],
        bytes[offset + 1],
        bytes[offset + 2],
        bytes[offset + 3]
      );
      const size =
        (bytes[offset + 4] << 24) |
        (bytes[offset + 5] << 16) |
        (bytes[offset + 6] << 8) |
        bytes[offset + 7];
      const data = bytes.subarray(offset + 10, offset + 10 + size);
      if (id === 'TIT2') title = decodeText(data);
      else if (id === 'TPE1') artist = decodeText(data);
      else if (id === 'TALB') album = decodeText(data);
      else if (id === 'APIC') {
        let i = 1;
        let mimeEnd = data.indexOf(0, i);
        if (mimeEnd < 0) mimeEnd = data.length;
        pictureMime = new TextDecoder().decode(data.subarray(i, mimeEnd));
        i = mimeEnd + 1;
        i += 1; // picture type
        const descEnd = data.indexOf(0, i);
        if (descEnd >= 0) i = descEnd + 1;
        pictureData = data.subarray(i);
      }
      offset += 10 + size;
    }
  } else if (bytes.length >= 128) {
    const start = bytes.length - 128;
    if (bytes[start] === 0x54 && bytes[start + 1] === 0x41 && bytes[start + 2] === 0x47) {
      const dec = new TextDecoder('iso-8859-1');
      title = dec.decode(bytes.subarray(start + 3, start + 33)).trim() || null;
      artist = dec.decode(bytes.subarray(start + 33, start + 63)).trim() || null;
      album = dec.decode(bytes.subarray(start + 63, start + 93)).trim() || null;
    }
  }

  if (!title && !artist && !album && !pictureData) {
    return null;
  }

  const meta: SimpleID3Data = { title, artist, album };
  if (pictureData && pictureMime) {
    meta.picture = { mime: pictureMime, data: pictureData };
  }
  return meta;
}
