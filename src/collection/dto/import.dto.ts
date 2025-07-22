export class PmItem {
  name: string;
  item?: PmItem[];
  request?: any;
  response?: any[];
}

export class PmCollection {
  info: {
    name: string;
    description: string;
  };
  item: PmItem[];
}
