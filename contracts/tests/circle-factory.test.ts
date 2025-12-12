import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';
import { TEST_ACCOUNTS, CONTRACTS, ERROR_CODES, createCircleArgs, expectOk, expectErr } from './helpers/test-utils';
import { MOCK_CIRCLES, INVALID_INPUTS } from './helpers/mock-data';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('Circle Factory Contract', () => {
  beforeEach(() => {
    // Reset state before each test
  });

  describe('Circle Creation', () => {
    it('should create a circle successfully', () => {
      const { result } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(MOCK_CIRCLES.FAMILY.name),
        wallet1
      );
      
      const circleId = expectOk(result);
      expect(circleId).toBeUint(1);
    });

    it('should increment circle IDs for multiple circles', () => {
      // Create first circle
      const { result: result1 } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs('Circle 1'),
        wallet1
      );
      expect(expectOk(result1)).toBeUint(1);

      // Create second circle
      const { result: result2 } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs('Circle 2'),
        wallet2
      );
      expect(expectOk(result2)).toBeUint(2);
    });

    it('should reject empty circle name', () => {
      const { result } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(INVALID_INPUTS.EMPTY_STRING),
        wallet1
      );
      
      expectErr(result, ERROR_CODES.ERR_INVALID_INPUT);
    });

    it('should set creator as first member', () => {
      // Create circle
      const { result } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(MOCK_CIRCLES.FAMILY.name),
        wallet1
      );
      const circleId = expectOk(result);

      // Check if creator is member
      const { result: memberResult } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'is-circle-member',
        [Cl.uint(circleId), Cl.principal(wallet1)],
        wallet1
      );
      
      expect(expectOk(memberResult)).toBeBool(true);
    });
  });

  describe('Circle Information Retrieval', () => {
    it('should retrieve circle information correctly', () => {
      // Create circle first
      const { result } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(MOCK_CIRCLES.FAMILY.name),
        wallet1
      );
      const circleId = expectOk(result);

      // Get circle info
      const { result: infoResult } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'get-circle',
        [Cl.uint(circleId)],
        wallet1
      );
      
      const circleInfo = expectOk(infoResult);
      expect(circleInfo).toBeTuple({
        name: Cl.stringAscii(MOCK_CIRCLES.FAMILY.name),
        creator: Cl.principal(wallet1),
        'created-at': Cl.uint(simnet.blockHeight),
        'member-count': Cl.uint(1),
        'is-active': Cl.bool(true)
      });
    });

    it('should return error for non-existent circle', () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'get-circle',
        [Cl.uint(INVALID_INPUTS.NON_EXISTENT_CIRCLE_ID)],
        wallet1
      );
      
      expectErr(result, ERROR_CODES.ERR_NOT_FOUND);
    });
  });

  describe('Member Management', () => {
    let circleId: number;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(MOCK_CIRCLES.FAMILY.name),
        wallet1
      );
      circleId = expectOk(result);
    });

    it('should check membership correctly', () => {
      // Creator should be member
      const { result: memberResult } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'is-circle-member',
        [Cl.uint(circleId), Cl.principal(wallet1)],
        wallet1
      );
      expect(expectOk(memberResult)).toBeBool(true);

      // Non-member should return false
      const { result: nonMemberResult } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'is-circle-member',
        [Cl.uint(circleId), Cl.principal(wallet2)],
        wallet1
      );
      expect(expectOk(nonMemberResult)).toBeBool(false);
    });

    it('should get circle members list', () => {
      const { result } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'get-circle-members',
        [Cl.uint(circleId)],
        wallet1
      );
      
      const members = expectOk(result);
      expect(members).toBeList([Cl.principal(wallet1)]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum circle name length', () => {
      const maxLengthName = 'a'.repeat(50); // Exactly 50 characters
      
      const { result } = simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(maxLengthName),
        wallet1
      );
      
      expect(expectOk(result)).toBeUint(1);
    });

    it('should track total circles correctly', () => {
      // Initial count should be 0
      const { result: initialResult } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'get-total-circles',
        [],
        wallet1
      );
      expect(expectOk(initialResult)).toBeUint(0);

      // Create a circle
      simnet.callPublicFn(
        CONTRACTS.FACTORY,
        'create-circle',
        createCircleArgs(MOCK_CIRCLES.FAMILY.name),
        wallet1
      );

      // Count should be 1
      const { result: afterResult } = simnet.callReadOnlyFn(
        CONTRACTS.FACTORY,
        'get-total-circles',
        [],
        wallet1
      );
      expect(expectOk(afterResult)).toBeUint(1);
    });
  });
});