import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  realUpdateBanner,
  realUpdateProduct,
  realUpdateSocial,
} from './real-landing-cms';
import { FilesService } from '@/services/files.service';
import { floatingProductsApi } from './floating-products.api';
import { sliderBannersApi } from './slider-banners.api';
import { socialNetworksApi } from './social-networks.api';

vi.mock('@/services/files.service', () => ({
  FilesService: { uploadFile: vi.fn(async () => ({ id: 'file-9', path: 'x.png' })) },
}));

const dto = { id: 'a', title: 't', name: 'n', link: 'l', picture: { id: 'f', path: 'p.png' } };
vi.mock('./slider-banners.api', () => ({ sliderBannersApi: { update: vi.fn(async () => dto) } }));
vi.mock('./floating-products.api', () => ({ floatingProductsApi: { update: vi.fn(async () => dto) } }));
vi.mock('./social-networks.api', () => ({ socialNetworksApi: { update: vi.fn(async () => dto) } }));

describe('real landing updates', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends only changed banner fields and skips upload without a new image', async () => {
    await realUpdateBanner({ id: 'b1', link: ' /x ' });

    expect(FilesService.uploadFile).not.toHaveBeenCalled();
    expect(sliderBannersApi.update).toHaveBeenCalledWith('b1', { link: '/x' });
  });

  it('uploads a replaced product logo and sends its file id', async () => {
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    await realUpdateProduct({ id: 'p1', logoImage: file, title: 'پرتال' });

    expect(FilesService.uploadFile).toHaveBeenCalledWith(file);
    expect(floatingProductsApi.update).toHaveBeenCalledWith('p1', {
      picture: { id: 'file-9' },
      title: 'پرتال',
    });
  });

  it('sends picture null to remove a social icon', async () => {
    await realUpdateSocial({ id: 's1', iconImage: null });

    expect(socialNetworksApi.update).toHaveBeenCalledWith('s1', { picture: null });
  });
});
