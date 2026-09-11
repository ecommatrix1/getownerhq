/**
 * Centralized Meta WhatsApp Cloud API Configuration
 * Ensures a single source of truth for Graph API versions, base endpoints, and scopes.
 */

export const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;
export const META_OAUTH_DIALOG_BASE = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`;

export const REQUIRED_WHATSAPP_SCOPES = [
  'whatsapp_business_management',
  'whatsapp_business_messaging',
].join(',');
