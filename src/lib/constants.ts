export const APP_NAME = 'OpenFable';
export const APP_DESCRIPTION = 'Manager for custom audio characters';
export const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/openfable/registry/main/index.json'; // Placeholder
export const DB_NAME = 'openfable-db';
export const DB_VERSION = 1;

export const DB_STORES = {
	REGISTRIES: 'registries',
	CHARACTERS: 'characters'
} as const;
