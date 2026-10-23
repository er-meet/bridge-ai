// Vercel's Express framework detection uses a root-level app entry point.
import express from 'express';
// The build compiles the backend to ESM before Vercel bundles this entrypoint.
import app from './server/dist/index.js';

// Keep Express visible in this root entrypoint for Vercel framework detection.
void express;

export default app;
