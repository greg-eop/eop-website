/// <reference types="astro/client" />

declare module '*.css';
declare module '*.webp';
declare module '*.svg' {
	import type { SvgComponent } from 'astro/types';
	const Component: SvgComponent;
	export default Component;
}
