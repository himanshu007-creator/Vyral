import { unlayer } from './links';

export const LEGAL =
  'VYRAL is an independent, non-commercial fan parody made for the Unlayer React Image Editor challenge. It is not affiliated with, endorsed, sponsored or approved by Rockstar Games, Take-Two Interactive, Meta, Snap Inc., Apple, or any company referenced. Grand Theft Auto and GTA are trademarks of Take-Two Interactive. All characters, apps, brands and events are fictional; any resemblance to real persons is coincidental. Video clips and artwork belong to their credited creators and are used for commentary and tribute. Nothing leaves your browser.';

export default function Legal({ compact = false, className = '' }) {
  if (compact)
    return (
      <p className={`legal legal--compact ${className}`} title={LEGAL}>
        Fan parody · not affiliated with Rockstar Games / Take-Two · fictional characters ·{' '}
        <a href={unlayer('app-footer')} target="_blank" rel="noreferrer">
          built with Unlayer
        </a>
      </p>
    );
  return <p className={`legal ${className}`}>{LEGAL}</p>;
}
