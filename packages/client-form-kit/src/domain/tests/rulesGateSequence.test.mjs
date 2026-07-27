import assert from "node:assert/strict";
import test from "node:test";
import {
  getNextRulesGateIndex,
  getPreviousRulesGateIndex,
  getRulesGateSequenceState,
} from "../rulesGateSequence.ts";

test("an empty sequence has no active progress or final stage", () => {
  assert.deepEqual(getRulesGateSequenceState(0, 0), {
    activeIndex: 0,
    currentPosition: 0,
    isFirst: true,
    isLast: false,
    progress: 0,
    ruleCount: 0,
  });
});

test("a single rule is both the first and final stage", () => {
  assert.deepEqual(getRulesGateSequenceState(0, 1), {
    activeIndex: 0,
    currentPosition: 1,
    isFirst: true,
    isLast: true,
    progress: 1,
    ruleCount: 1,
  });
});

test("navigation advances and returns without crossing sequence boundaries", () => {
  assert.equal(getNextRulesGateIndex(0, 4), 1);
  assert.equal(getNextRulesGateIndex(3, 4), 3);
  assert.equal(getPreviousRulesGateIndex(2, 4), 1);
  assert.equal(getPreviousRulesGateIndex(0, 4), 0);
});

test("progress and stale positions are derived from the clamped active rule", () => {
  assert.deepEqual(getRulesGateSequenceState(1, 4), {
    activeIndex: 1,
    currentPosition: 2,
    isFirst: false,
    isLast: false,
    progress: 0.5,
    ruleCount: 4,
  });
  assert.deepEqual(getRulesGateSequenceState(8, 2), {
    activeIndex: 1,
    currentPosition: 2,
    isFirst: false,
    isLast: true,
    progress: 1,
    ruleCount: 2,
  });
});
