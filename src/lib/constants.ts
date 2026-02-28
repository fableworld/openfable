export const APP_NAME = 'OpenFable';
export const APP_DESCRIPTION = 'Manager for custom audio characters';
export const DEFAULT_REGISTRY_URL = 'https://storage.fableforge.d71.dev/fabletastic/index.json';
export const DB_NAME = 'openfable-db';
export const DB_VERSION = 2; // Incremented for schema change

export const DB_STORES = {
	REGISTRIES: 'registries',
	CHARACTERS: 'characters'
} as const;
