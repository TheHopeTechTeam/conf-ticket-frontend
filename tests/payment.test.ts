import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { isPossiblyChargedError } from '../src/utils/payment.ts';

test('uncertain payment outcomes do not permit retry', () => {
  assert.equal(
    isPossiblyChargedError({ response: { code: 'PAYMENT_OUTCOME_UNKNOWN' } }),
    true
  );
  assert.equal(
    isPossiblyChargedError({
      response: { code: 'ERROR_PAYMENT_PAYMENT_RECORD_CREATION_FAILURE' },
    }),
    true
  );
  assert.equal(
    isPossiblyChargedError({ response: { message: '已進入付款流程' } }),
    false
  );
  assert.equal(
    isPossiblyChargedError({ response: { message: '金流服務交易未成功' } }),
    false
  );
});
