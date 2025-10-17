import { renderCampaignEmail } from './base';

export interface ActivationEmailData {
  userName?: string;
  gettingStartedUrl: string;
  communityUrl: string;
}

export function renderActivationEmail({
  userName,
  gettingStartedUrl,
  communityUrl,
}: ActivationEmailData) {
  const greeting = userName ? `Szia ${userName}!` : 'Szia!';

  return renderCampaignEmail({
    title: 'Kezdj bele a Yumekai élménybe',
    greeting,
    intro: 'Örülünk, hogy csatlakoztál a közösséghez. Pár lépés, és máris megmutathatod a világnak a saját alkotásaidat.',
    paragraphs: [
      'Tölts fel legalább egy illusztrációt vagy csatlakozz egy beszélgetéshez, hogy elinduljon a profilod aktivitása.',
      `A közösségi irányelveink rövid és könnyen áttekinthető összefoglalót adnak arról, hogyan maradhat pozitív a hangulat: ${communityUrl}.`,
    ],
    cta: {
      label: 'Fedezd fel a teendőket',
      url: gettingStartedUrl,
    },
  });
}
