import { IPoliticalParty } from '../interfaces/i-political-party.interface';

export const POLITICAL_PARTIES: Record<string, IPoliticalParty> = {
  KMT: {
    EMBLEM: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Emblem_of_the_Kuomintang.svg',
    CN_FULL_NAME: '中國國民黨',
    CN_SHORT_NAME: '國民黨',
    EN_FULL_NAME: 'Kuomintang Chinese Nationalist Party',
    EN_SHORT_NAME: 'KMT',
  },
  DPP: {
    EMBLEM: 'https://upload.wikimedia.org/wikipedia/zh/c/c1/Emblem_of_Democratic_Progressive_Party_%28new%29.svg',
    CN_FULL_NAME: '民主進步黨',
    CN_SHORT_NAME: '民進黨',
    EN_FULL_NAME: 'Democratic Progressive Party',
    EN_SHORT_NAME: 'DPP',
  },
  TPP: {
    EMBLEM: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Emblem_of_Taiwan_People%27s_Party_2019.svg',
    CN_FULL_NAME: '台灣民眾黨',
    CN_SHORT_NAME: '民眾黨',
    EN_FULL_NAME: "Taiwan People's Party",
    EN_SHORT_NAME: 'TPP',
  },
  PFP: {
    EMBLEM: 'https://upload.wikimedia.org/wikipedia/zh/6/65/Flag_of_People_First_Party.png',
    CN_FULL_NAME: '親民黨',
    CN_SHORT_NAME: '親民黨',
    EN_FULL_NAME: 'People First Party',
    EN_SHORT_NAME: 'PFP',
  },
  NP: {
    EMBLEM: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Np_logo.svg',
    CN_FULL_NAME: '新黨',
    CN_SHORT_NAME: '新黨',
    EN_FULL_NAME: 'New Party',
    EN_SHORT_NAME: 'NP',
  },
  PETITION: {
    EMBLEM: '',
    CN_FULL_NAME: '連署',
    CN_SHORT_NAME: '',
    EN_FULL_NAME: 'Petition',
    EN_SHORT_NAME: 'PETITION',
  },
  EMPTY: {
    EMBLEM: '',
    CN_FULL_NAME: '無黨籍及未經政黨推薦',
    CN_SHORT_NAME: '',
    EN_FULL_NAME: 'Empty',
    EN_SHORT_NAME: 'EMPTY',
  },
};
