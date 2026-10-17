// @/components/templates/social/social-template.tsx
import React from "react";
import FeedScreen from "./feed-screen";
import type { SocialTemplateProps } from "./types";

export function SocialTemplate(props: SocialTemplateProps) {
  return <FeedScreen {...props} />;
}

export default SocialTemplate;
