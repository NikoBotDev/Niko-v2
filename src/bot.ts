import 'dotenv/config';
import Niko from './classes/Niko';

import Database from './database';

const client = new Niko();

Database.init();

client.start();
