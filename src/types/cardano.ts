import { CardanoFullAPI } from "@/shared/wallet";

export interface Pagination {
  page: number;
  limit: number;
}

export interface LocalDanoAPI {
  enable(): Promise<CardanoFullAPI>;
  isEnabled(): boolean;
  name: string;
}
