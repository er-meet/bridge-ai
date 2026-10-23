// Vercel's Express framework detection uses a root-level app entry point.
import express from 'express';
import app from './server/src/index.ts';

// Keep Express visible in this root entrypoint for Vercel framework detection.
void express;

export default app;
