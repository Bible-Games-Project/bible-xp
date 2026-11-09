# Avatar portraits

Every avatar is a Bible character (`src/progress/characters.ts`, names and
descriptions in `src/content/locales/en/characters.ts`). Each portrait is a
transparent webp at `src/assets/characters/<id>.webp`, 384×384. `PlayerAvatar`
picks the files up by name and shows them on a round sky-to-sand backdrop; a
character without a file yet shows a neutral silhouette. So adding a portrait
is only adding the file.

Done so far (November 2026): the first ten men (Adam to Japheth) and the first
ten women (Eve to Rebekah) of the lists.

## Method

All portraits form one set: same painterly style, framing, light and size.
Keep it that way:

1. Model `gpt-image-1.5` via `POST /v1/images/edits`, quality "medium",
   1024×1024, `background: transparent`, base64 output. It followed props
   (lamb, sheaf of wheat, rope, water jar) much better than `gpt-image-1-mini`.
2. Reference image: `docs/avatar-art/reference-male.webp` for men,
   `reference-female.webp` for women (converted to PNG before upload). These
   were the first generic avatars; they are kept only as the style reference.
3. Prompt = "Use the reference image only for its painting style, framing and
   transparent background; paint a different person." + the character's own
   description + the style paragraph below.
4. Scale to 384×384 webp (quality 80, alpha quality 90, about 30 KB each).
5. Look at the new ones next to the existing set at 56 px (list) and 112 px
   (chosen character) before adding them.

The character descriptions used are in `docs/avatar-art/prompts.json`. Each
gives age, skin, hair, clothing in period colours and, when it helps tell
characters apart, one prop from their story (Abel's lamb, Noah's coil of rope,
Rebekah's water jar). No halos, no weapons in hand, no gore; villains look
stern, never monstrous.

Style paragraph (word for word):

> Match the reference image exactly in rendering: a stylised painterly 2D
> illustration like animated-film concept art, simplified smooth shapes, soft
> brush texture, slightly stylised features, warm golden light from the upper
> right. It must NOT look like a photograph or a realistic 3D render. Keep the
> same framing, head size and position, pose and transparent background as the
> reference. Dignified, suitable for adults, not childish. No text, no frame,
> no halo.

Jesus and God are deliberately not avatars.

## Full-body style test (November 2026)

The maintainer wants the characters drawn full-body (for unlock cards), brighter
and more varied. Three candidate styles were made with the same four people
(Adam, Eve, Noah, Rebekah) and are shown by the DEV button's "Avatar styles"
panel (`src/dev/AvatarStyles.tsx`, pictures in `src/dev/avatar-styles/`).

Method: `gpt-image-1.5`, 1024×1536, quality medium, transparent background.
Adam was generated from text (`images/generations`); the other three are
`images/edits` with Adam's picture as the style reference ("Use the reference
image only for its art style, rendering, proportions, framing and lighting;
paint a different person."). Saved as 512×768 webp.

Common paragraph:

> Full-body character: the whole figure visible from the top of the head to
> the feet, with a little empty space around it, centred, standing, turned
> three-quarters toward the viewer. Transparent background, nothing behind the
> figure, no ground, no shadow, no text, no frame, no halo. Dignified and
> suitable for all ages, not childish, not a caricature.

Styles:

- A, bright painting: "bright painterly 2D illustration like animated-film
  concept art: clean simple shapes, soft brush texture, vivid saturated but
  natural colours, bright warm daylight with a soft rim light around the
  figure, high clarity and contrast so it reads well at small sizes. Not a
  photograph, not a 3D render."
- B, 3D animation: "stylised 3D animated-film character render: appealing
  slightly stylised proportions (head a little larger than realistic),
  expressive but dignified face, soft global illumination, vivid saturated
  colours, clean believable materials (linen, wool, leather, clay), bright
  cheerful lighting with a soft rim light. Not photorealistic."
- C, flat cartoon: "clean flat storybook illustration for a collectible card
  in a mobile game: bold simple shapes, crisp dark outlines of varying weight,
  two-tone cel shading, bright joyful saturated palette, strong clear
  silhouette that reads at small sizes. Not a photograph, not a 3D render."

Each character also gets a prop from their story: a songbird on Adam's hand
(naming the animals), wildflowers for Eve, a dove and a carpenter's mallet for
Noah, the water jar and gold bracelets for Rebekah.
