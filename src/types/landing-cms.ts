/**
 * Nest-flat DTOs for Landing CMS (banners / socials / products).
 * IDs and numeric payloads use English ASCII digits (`0-9`) only.
 */

export interface LandingBanner {
  id: string;
  title: string;
  /** Public path or mock data-URL after compress. */
  imageUrl: string;
  /** Internal marketing path, hash target, or absolute URL; empty = display-only. */
  link: string;
}

export interface LandingSocial {
  id: string;
  name: string;
  link: string;
  /** Empty when using `icon` stem fallback. */
  iconImageUrl: string;
  /** Font Awesome class stem, e.g. `fa-share-nodes`. */
  icon: string;
}

export interface LandingProduct {
  id: string;
  title: string;
  link: string;
  /** Empty when using `icon` stem fallback. */
  logoImageUrl: string;
  /** Font Awesome class stem fallback when logo is empty. */
  icon: string;
}

export type CreateLandingBannerInput = {
  title: string;
  link?: string;
  image: File;
};

export type CreateLandingSocialInput = {
  name: string;
  link: string;
  iconImage?: File | null;
  icon?: string;
};

export type CreateLandingProductInput = {
  title: string;
  link: string;
  logoImage: File;
  icon?: string;
};

export type LandingCmsSnapshot = {
  banners: LandingBanner[];
  socials: LandingSocial[];
  products: LandingProduct[];
};
