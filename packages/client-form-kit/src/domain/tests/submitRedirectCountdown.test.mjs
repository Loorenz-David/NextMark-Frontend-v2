import assert from "node:assert/strict";
import test from "node:test";
import { createSubmitRedirectCountdown } from "../submitRedirectCountdown.ts";

const createFakeEnv = () => {
  let now = 1_000;
  let nextId = 1;
  const timers = new Map();
  const env = {
    hidden: false,
    navigations: [],
    handlers: null,
    now: () => now,
    isHidden: () => env.hidden,
    navigate: (href) => env.navigations.push(href),
    setInterval: (cb, ms) => {
      const id = nextId++;
      timers.set(id, { cb, ms, at: now + ms, repeat: true });
      return id;
    },
    clearInterval: (id) => timers.delete(id),
    setTimeout: (cb, ms) => {
      const id = nextId++;
      timers.set(id, { cb, ms, at: now + ms, repeat: false });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    subscribe: (handlers) => {
      env.handlers = handlers;
      return () => {
        env.handlers = null;
      };
    },
    /** Advances the clock, firing due timers in order. */
    advance: (ms) => {
      const end = now + ms;
      for (;;) {
        const due = [...timers.entries()]
          .filter(([, t]) => t.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        const [id, t] = due;
        now = t.at;
        if (t.repeat) t.at += t.ms;
        else timers.delete(id);
        t.cb();
      }
      now = end;
    },
    /** Moves the clock without firing timers, as a frozen background tab does. */
    jump: (ms) => {
      now += ms;
      for (const t of timers.values()) t.at = Math.max(t.at, now);
    },
    pendingTimers: () => timers.size,
  };
  return env;
};

const setup = (overrides = {}) => {
  const env = createFakeEnv();
  const states = [];
  const countdown = createSubmitRedirectCountdown({
    href: "https://acme.se/",
    env,
    onChange: (s) => states.push(s),
    ...overrides,
  });
  countdown.start();
  return { env, states, countdown };
};

test("counts down from four seconds and navigates once at the deadline", () => {
  const { env, states, countdown } = setup();

  assert.deepEqual(states[0], { phase: "counting", secondsLeft: 4 });
  env.advance(1_000);
  assert.equal(countdown.getState().secondsLeft, 3);
  env.advance(2_999);
  assert.deepEqual(env.navigations, []);
  env.advance(1);
  assert.deepEqual(env.navigations, ["https://acme.se/"]);
  assert.equal(countdown.getState().phase, "navigating");

  env.handlers.onResume();
  env.advance(10);
  assert.equal(env.navigations.length, 1);
});

test("a throttled timer still navigates as soon as it next runs past the deadline", () => {
  const { env } = setup();
  env.jump(9_000);
  env.handlers.onResume();
  assert.deepEqual(env.navigations, ["https://acme.se/"]);
});

test("waits for the page to be visible before navigating", () => {
  const { env, countdown } = setup();
  env.hidden = true;
  env.advance(6_000);
  assert.deepEqual(env.navigations, []);
  assert.deepEqual(countdown.getState(), { phase: "counting", secondsLeft: 0 });

  env.hidden = false;
  env.handlers.onResume();
  assert.deepEqual(env.navigations, ["https://acme.se/"]);
});

test("reports a stall when the page outlives the navigation", () => {
  const { env, countdown } = setup();
  env.advance(4_000);
  env.advance(2_499);
  assert.equal(countdown.getState().phase, "navigating");
  env.advance(1);
  assert.equal(countdown.getState().phase, "stalled");
});

test("a page restored from the back/forward cache never redirects again", () => {
  const { env, countdown } = setup();
  env.advance(4_000);
  env.handlers.onPageShow(true);
  assert.equal(countdown.getState().phase, "manual");
  env.advance(10_000);
  assert.equal(countdown.getState().phase, "manual");
  assert.equal(env.navigations.length, 1);
});

test("a restore mid-countdown also stops the countdown", () => {
  const { env, countdown } = setup();
  env.advance(1_000);
  env.handlers.onPageShow(true);
  env.advance(10_000);
  assert.equal(countdown.getState().phase, "manual");
  assert.deepEqual(env.navigations, []);
});

test("cancel stops the countdown for good", () => {
  const { env, countdown } = setup();
  env.advance(1_500);
  countdown.cancel();
  env.advance(10_000);
  env.handlers.onResume();
  assert.equal(countdown.getState().phase, "cancelled");
  assert.deepEqual(env.navigations, []);
});

test("a tapped link hands off to the browser without a second navigation", () => {
  const { env, countdown } = setup();
  env.advance(500);
  countdown.markFollowed();
  env.advance(10_000);
  assert.deepEqual(env.navigations, []);
  assert.equal(countdown.getState().phase, "stalled");
});

test("dispose clears every timer and listener", () => {
  const { env, countdown } = setup();
  env.advance(4_000);
  countdown.dispose();
  assert.equal(env.pendingTimers(), 0);
  assert.equal(env.handlers, null);
});
