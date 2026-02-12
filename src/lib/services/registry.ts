import { RegistrySchema, type Registry } from '../schemas';
import { db } from '../db';
import { z, ZodError, type ZodIssue } from 'zod';

export const registryService = {
	async fetchRegistry(url: string): Promise<Registry> {
		try {
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(`Failed to fetch registry: ${res.statusText}`);
			}
			const json = await res.json();
			
			// Validate with Zod
			const registry = RegistrySchema.parse(json);
			
			// Save to DB
			await db.addRegistry(url, registry);
			
			return registry;
		} catch (err: unknown) {
			console.error('Registry fetch error:', err);
			// Try to load from DB if offline/failed
			// For now, rethrow or handle specific errors
			if (err instanceof ZodError) {
				// @ts-ignore - ZodError<unknown> issue
				throw new Error(`Invalid registry format: ${err.errors.map((e: ZodIssue) => e.message).join(', ')}`);
			}
			throw err;
		}
	},
	
	async getRegistryFromDB(url: string): Promise<Registry | undefined> {
		// Implement getting specific registry logic via db.getRegistries().find
		const registries = await db.getRegistries();
		const reg = registries.find(r => r.url === url);
		return reg;
	}
};
