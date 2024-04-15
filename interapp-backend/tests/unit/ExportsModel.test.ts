import { runSuite, testSuites } from '../constants.test';
import { ExportsModel } from '@models/.';
import { User } from '@db/entities';
import { describe, test, expect } from 'bun:test';


const SUITE_NAME = 'ExportsModel';
const suite = testSuites[SUITE_NAME];

console.log(suite);


runSuite(SUITE_NAME, suite);

