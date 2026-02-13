import { RegistrySchema, CharacterSchema, type Registry } from '../schemas';
import { db } from '../db';
import { z } from 'zod';

export const registryService = {
	async fetchRegistry(url: string): Promise<Registry> {
		try {
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(`Failed to fetch registry: ${res.statusText}`);
			}
			const json = await res.json();
			
			// Validate top-level metadata first
			const metaResult = RegistrySchema.pick({ meta: true }).safeParse(json);
			if (!metaResult.success) {
				throw new Error(`Invalid registry metadata: ${metaResult.error.issues[0].message}`);
			}

			// Validate characters one by one to support partial failure
			const rawCharacters = json.characters;
			if (!Array.isArray(rawCharacters)) {
				throw new Error('Invalid registry format: "characters" must be an array');
			}

			const validCharacters: any[] = [];
			const errors: string[] = [];

			for (const char of rawCharacters) {
				const charResult = CharacterSchema.safeParse(char);
				if (charResult.success) {
					validCharacters.push(charResult.data);
				} else {
					errors.push(`Character "${char.name || 'unknown'}" skipped: ${charResult.error.issues[0].message}`);
				}
			}

			if (validCharacters.length === 0) {
				throw new Error('The registry contains no valid characters.');
			}

			if (errors.length > 0) {
				console.warn('Some characters were skipped during registry fetch:', errors);
			}

			const registry: Registry = {
				meta: metaResult.data.meta,
				characters: validCharacters
			};
			
			// Save to DB
			await db.addRegistry(url, registry);
			
			return registry;
		} catch (err: unknown) {
			console.error('Registry fetch error:', err);
			if (err instanceof Error) throw err;
			throw new Error('An unknown error occurred during registry fetch');
		}
	},
	
	async getRegistryFromDB(url: string): Promise<Registry | undefined> {
		const registries = await db.getRegistries();
		const reg = registries.find(r => r.url === url);
		return reg;
	},

	async updateAllRegistries(): Promise<void> {
		const registries = await db.getRegistries();
		for (const reg of registries) {
			try {
				await this.fetchRegistry(reg.url);
			} catch (err) {
				console.error(`Failed to background update ${reg.url}:`, err);
			}
		}
	}
};
