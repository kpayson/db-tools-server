
import { PerfTestResult } from './perf-test-result.entity';

export const PERF_TEST_RESULT_REPOSITORY = "PERF_TEST_RESULT_REPOSITORY";

export const PerfTestResultProviders = [
  {
    provide: PERF_TEST_RESULT_REPOSITORY,
    useValue: PerfTestResult,
  },
];