import assert from "node:assert/strict";
import test from "node:test";
import {
  getNextRulesGateIndex,
  getPreviousRulesGateIndex,
  getRulesGateSequenceState,
} from "../rulesGateSequence.ts";

test("an empty sequence has no stages, progress or confirm stage", () => {
  assert.deepEqual(getRulesGateSequenceState(0, 0), {
    activeIndex: 0,
    currentPosition: 0,
    isFirst: true,
    isLast: false,
    isConfirmStage: false,
    progress: 0,
    ruleCount: 0,
    stageCount: 0,
  });
});

test("a single rule is followed by the confirm stage", () => {
  assert.deepEqual(getRulesGateSequenceState(0, 1), {
    activeIndex: 0,
    currentPosition: 1,
    isFirst: true,
    isLast: false,
    isConfirmStage: false,
    progress: 0.5,
    ruleCount: 1,
    stageCount: 2,
  });
  assert.deepEqual(getRulesGateSequenceState(1, 1), {
    activeIndex: 1,
    currentPosition: 2,
    isFirst: false,
    isLast: true,
    isConfirmStage: true,
    progress: 1,
    ruleCount: 1,
    stageCount: 2,
  });
});

test("navigation reaches the confirm stage and never crosses past it", () => {
  assert.equal(getNextRulesGateIndex(0, 4), 1);
  assert.equal(getNextRulesGateIndex(3, 4), 4);
  assert.equal(getNextRulesGateIndex(4, 4), 4);
  assert.equal(getPreviousRulesGateIndex(4, 4), 3);
  assert.equal(getPreviousRulesGateIndex(0, 4), 0);
});

test("progress and stale positions are derived from the clamped active stage", () => {
  assert.deepEqual(getRulesGateSequenceState(1, 3), {
    activeIndex: 1,
    currentPosition: 2,
    isFirst: false,
    isLast: false,
    isConfirmStage: false,
    progress: 0.5,
    ruleCount: 3,
    stageCount: 4,
  });
  // A refresh that drops rules lands a customer past the end on the confirm stage.
  assert.deepEqual(getRulesGateSequenceState(8, 2), {
    activeIndex: 2,
    currentPosition: 3,
    isFirst: false,
    isLast: true,
    isConfirmStage: true,
    progress: 1,
    ruleCount: 2,
    stageCount: 3,
  });
});
