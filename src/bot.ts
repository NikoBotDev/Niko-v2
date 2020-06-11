import 'dotenv/config';
import Niko from '~/classes/Niko';

import Database from '~/database';

const client = new Niko();

// eslint-disable-next-line func-names
(async function () {
  await Database.init();

  await client.start();
})();
