import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import firmInfo from '../../data/firm-info.json';

export async function getStaticPaths() {
  const attorneys = await getCollection('attorneys');
  return attorneys.map((entry: CollectionEntry<'attorneys'>) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props, url }) => {
  const entry = props.entry as CollectionEntry<'attorneys'>;
  const { name, role, specialty, email } = entry.data;

  // Parse name into parts: first, middle(s), last
  const nameParts = name.trim().split(/\s+/);
  const familyName = nameParts.at(-1) ?? '';
  const givenName = nameParts[0] ?? '';
  const additionalNames = nameParts.slice(1, -1).join(' ');

  // Clean firm phone: "+1 503.224.7112" → "+15032247112"
  const cleanPhone = firmInfo.phone.replace(/[\s.]/g, '');

  // Build profile URL from the request origin
  const origin = url.origin;
  const profileUrl = `${origin}/our-attorneys/${entry.id}`;

  const title = role ?? 'Attorney';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${familyName};${givenName};${additionalNames};;`,
    `ORG:${firmInfo.firmName}`,
    `TITLE:${title}`,
    `TEL;TYPE=WORK,VOICE:${cleanPhone}`,
    ...(email ? [`EMAIL;TYPE=WORK:${email}`] : []),
    `ADR;TYPE=WORK:;;${firmInfo.addressLines[0]};Portland;OR;97205;USA`,
    `URL:${profileUrl}`,
    `NOTE:${specialty}`,
    'END:VCARD',
  ];

  const vcf = lines.join('\r\n') + '\r\n';

  return new Response(vcf, {
    headers: {
      'Content-Type': 'text/vcard;charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.id}.vcf"`,
    },
  });
};
