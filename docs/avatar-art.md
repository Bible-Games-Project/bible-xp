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
