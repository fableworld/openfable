import { z } from 'zod';

export const Model3DSchema = z.object({
	provider: z.enum(['makerworld', 'printables', 'thingiverse', 'direct', 'other']).default('other'),
	url: z.string().url()
});

export const CharacterSchema = z.object({
	id: z.string(),
	name: z.string().min(1, 'Name is required'),
	created_at: z.string().datetime().optional(), // ISO 8601
	preview_image: z.string().url().optional(),
    description: z.string().optional(),
	gallery_images: z.array(z.string().url()).optional().default([]),
	audio_sample_url: z.string().url().optional(),
	audio_zip_url: z.string().url().optional(),
	models_3d: z.array(Model3DSchema).optional().default([]),
	nfc_payload: z.string().optional()
});

export const RegistryMetaSchema = z.object({
	name: z.string(),
	version: z.string().optional(),
	maintainer: z.string().optional()
});

export const RegistrySchema = z.object({
	meta: RegistryMetaSchema,
	characters: z.array(CharacterSchema)
});

export type Model3D = z.infer<typeof Model3DSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type RegistryMeta = z.infer<typeof RegistryMetaSchema>;
export type Registry = z.infer<typeof RegistrySchema>;
