import { TestBed } from '@angular/core/testing';

import { ApprovalGuard } from './approval.guard';

describe('ApprovalGuard', () => {
  let guard: ApprovalGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ApprovalGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
