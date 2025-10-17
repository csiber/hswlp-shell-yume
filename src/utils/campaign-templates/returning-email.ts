import { renderCampaignEmail } from './base';

export interface ReturningEmailData {
  userName?: string;
  exploreUrl: string;
  highlightUrl: string;
}

export function renderReturningEmail({
  userName,
  exploreUrl,
  highlightUrl,
}: ReturningEmailData) {
  const greeting = userName ? `Szia újra ${userName}!` : 'Szia újra!';

  return renderCampaignEmail({
    title: 'Kimaradt pár dolog a Yumekain',
    greeting,
    intro: 'Egy ideje nem láttunk a galériában, pedig azóta rengeteg új inspiráció érkezett.',
    paragraphs: [
      'Az alkotók új, limitált időre látható tartalmakat töltöttek fel, így most különösen érdemes visszanézni.',
      `A heti ajánlóban a közösség által legjobbra értékelt anyagokat gyűjtöttük össze: ${highlightUrl}.`,
    ],
    cta: {
      label: 'Nézd meg az újdonságokat',
      url: exploreUrl,
    },
  });
}
