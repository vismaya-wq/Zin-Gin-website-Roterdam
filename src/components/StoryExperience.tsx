import { STORY_CHAPTERS } from '../data/story';

const PARAGRAPHS = [
  'Our journey began just three years ago, in November 2023, with a humble 6-seater Tapri—a street-side food stall nestled in the vibrant center of Rotterdam. Back then, it was all about the quick, comforting rhythm of the streets: serving up hot chai and authentic, flavor-packed bites to guests who crowded around our tiny 45-square-meter space. Driven by the incredible love from our community, we expanded into the shop next door within just nine months, growing into a bustling 40-seater that became a local favorite for honest comfort food.',
  'But as our community grew, so did our vision. We realized our guests wanted more than just a quick bite; they wanted a place to linger, celebrate, and unwind.',
  'That is why we made our biggest leap yet, moving just five minutes away to a stunning 220-square-meter space on the ground floor of Hotel Teleport Rotterdam. Building upon the street-food legacy of Urban Tapri, we evolved into Zin & Gin, a 75-seat dine-in destination and botanical lounge. We transformed our concept from a casual street-side stop into an elevated, modern gastrobar. We kept the exact same authentic taste our loyal guests love, but brought it to a completely different, elevated place.',
  'Today, we have traded quick cups of chai for crystal glasses of botanical Gin, shifting from a local Indian street ambiance to an upscale, comfortable setting infused with local Dutch elegance. We now invite our guests for hours of savoring, sipping, and enjoying live events and buffets, rather than just eating on the go.',
  'We named this new chapter Zin & Gin because the Dutch word Zin perfectly captures our philosophy: a feeling of desire, a good mood, and the craving for an enjoyable experience. As a place where botanical craft meets authentic flavor, we have packaged everything essential to elevate your mood and cater to your cravings.',
  'Welcome to our table. We hope you stay a while.',
];

export default function StoryExperience() {
  return (
    <div className="story-xp">
      <header className="xp-hero">
        <div className="container xp-hero__inner">
          <p className="eyebrow eyebrow--terra">Our story</p>
          <h1 className="h1">Our story</h1>
        </div>
      </header>

      <article className="container story-copy">
        {PARAGRAPHS.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </article>

      <div className="container story-stills" aria-label="Photographs from Zin & Gin">
        {STORY_CHAPTERS.map((chapter) => (
          <figure key={chapter.id}>
            <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}
