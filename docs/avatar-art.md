# Avatar portraits

The six player portraits in `src/assets/avatars/` (male/female × light,
brown, dark skin) were made with OpenAI's image model `gpt-image-1-mini`
(quality "medium", 1024×1024, transparent background), then scaled to 384×384
webp. `PlayerAvatar.tsx` shows them on a round sky-to-sand backdrop.

They are a set: same painterly style, framing, light, age and clothing. To
keep new pictures (other ages, robes, sandals, accessories for the XP rewards)
consistent, make them the same way:

1. Start from an existing portrait as the reference image (`images/edits`),
   never from a bare prompt, or the style drifts towards photorealism.
2. Reuse the style paragraph below word for word.
3. Check the result inside the round backdrop at 36 px (header) and 128 px
   (avatar editor) before adding it.

## The first portrait (`male-brown`), generated from text

> Head-and-shoulders portrait avatar of an adult man from biblical times, warm
> medium-brown skin, short dark curly hair and a neat short dark beard, wearing
> a simple cream linen tunic with a terracotta-red woollen mantle draped over
> his left shoulder. He faces the viewer, calm and kind expression with a gentle
> closed-mouth smile. Style: soft painterly 2D illustration like modern
> animated-film concept art: clean simple shapes, soft gradients, warm golden
> afternoon light from the upper right, the same look as a storybook painting
> of ancient Jerusalem. Dignified and suitable for adults: not childish, not a
> caricature, no big cartoon eyes. Centered for a circular profile picture, head
> in the upper middle, shoulders reaching the bottom edge. Transparent
> background, nothing behind him. No text, no frame, no halo.

## The others, edited from a reference

Men (reference: `male-brown`): "Paint the same portrait design (cream linen
tunic, terracotta-red mantle over his left shoulder, same pose) but of a white
man with fair, light skin, short dark-brown wavy hair and a neat short beard"
(or "a Black man with deep dark-brown skin, short tightly coiled black hair and
a neat short black beard"), followed by the style paragraph.

Women: `female-light` and `female-dark` from `female-brown` + `male-brown`;
`female-brown` was then remade from `female-light` + `male-brown` so all three
look the same age. Design: "deep sky-blue head covering framing her face and
falling over her shoulders, cream linen tunic, calm kind expression with a
gentle closed-mouth smile, a woman in her late twenties".

Style paragraph:

> Match the reference image exactly in rendering: a stylised painterly 2D
> illustration like animated-film concept art, simplified smooth shapes, soft
> brush texture, slightly stylised features, warm golden light from the upper
> right. It must NOT look like a photograph or a realistic 3D render. Keep the
> same framing, head size and position, pose and transparent background as the
> reference. Dignified, suitable for adults, not childish. No text, no frame,
> no halo.

Cost: the whole set took 10 images (4 of them discarded) on
`gpt-image-1-mini` at medium quality.
