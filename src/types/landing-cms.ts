/**
 * DTO تخت Nest برای CMS لندینگ (بنر / شبکه اجتماعی / محصول).
 * شناسه و ارقام payload فقط ASCII انگلیسی (`0-9`).
 */

export interface LandingBanner {
  id: string;
  title: string;
  /** مسیر عمومی یا data-URL موک بعد از فشرده‌سازی. */
  imageUrl: string;
  /** مسیر مارکتینگ داخلی، hash، یا URL مطلق؛ خالی = فقط نمایش. */
  link: string;
}

export interface LandingSocial {
  id: string;
  name: string;
  link: string;
  /** خالی وقتی از stem `icon` به‌عنوان fallback استفاده می‌شود. */
  iconImageUrl: string;
  /** stem کلاس Font Awesome، مثل `fa-share-nodes`. */
  icon: string;
}

export interface LandingProduct {
  id: string;
  title: string;
  link: string;
  /** خالی وقتی از stem `icon` به‌عنوان fallback استفاده می‌شود. */
  logoImageUrl: string;
  /** stem کلاس Font Awesome وقتی لوگو خالی است. */
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
