/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clock_internal from "../clock/internal.js";
import type * as clock_lib_constants from "../clock/lib/constants.js";
import type * as clock_lib_enforce from "../clock/lib/enforce.js";
import type * as crons from "../crons.js";
import type * as games_mutations from "../games/mutations.js";
import type * as games_queries from "../games/queries.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_finishGame from "../lib/finishGame.js";
import type * as lib_finishSideEffects from "../lib/finishSideEffects.js";
import type * as lib_game from "../lib/game.js";
import type * as lib_isUserId from "../lib/isUserId.js";
import type * as lib_room from "../lib/room.js";
import type * as lib_stats from "../lib/stats.js";
import type * as lib_validators from "../lib/validators.js";
import type * as matchmaking_internal from "../matchmaking/internal.js";
import type * as matchmaking_mutations from "../matchmaking/mutations.js";
import type * as matchmaking_queries from "../matchmaking/queries.js";
import type * as rankedMatchmaking_internal from "../rankedMatchmaking/internal.js";
import type * as rankedMatchmaking_mutations from "../rankedMatchmaking/mutations.js";
import type * as rankedMatchmaking_queries from "../rankedMatchmaking/queries.js";
import type * as ratings_internal from "../ratings/internal.js";
import type * as ratings_lib_applyResult from "../ratings/lib/applyResult.js";
import type * as ratings_lib_constants from "../ratings/lib/constants.js";
import type * as ratings_lib_matchmaking from "../ratings/lib/matchmaking.js";
import type * as ratings_lib_seasonRatings from "../ratings/lib/seasonRatings.js";
import type * as ratings_lib_seasons from "../ratings/lib/seasons.js";
import type * as ratings_queries from "../ratings/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "clock/internal": typeof clock_internal;
  "clock/lib/constants": typeof clock_lib_constants;
  "clock/lib/enforce": typeof clock_lib_enforce;
  crons: typeof crons;
  "games/mutations": typeof games_mutations;
  "games/queries": typeof games_queries;
  "lib/auth": typeof lib_auth;
  "lib/finishGame": typeof lib_finishGame;
  "lib/finishSideEffects": typeof lib_finishSideEffects;
  "lib/game": typeof lib_game;
  "lib/isUserId": typeof lib_isUserId;
  "lib/room": typeof lib_room;
  "lib/stats": typeof lib_stats;
  "lib/validators": typeof lib_validators;
  "matchmaking/internal": typeof matchmaking_internal;
  "matchmaking/mutations": typeof matchmaking_mutations;
  "matchmaking/queries": typeof matchmaking_queries;
  "rankedMatchmaking/internal": typeof rankedMatchmaking_internal;
  "rankedMatchmaking/mutations": typeof rankedMatchmaking_mutations;
  "rankedMatchmaking/queries": typeof rankedMatchmaking_queries;
  "ratings/internal": typeof ratings_internal;
  "ratings/lib/applyResult": typeof ratings_lib_applyResult;
  "ratings/lib/constants": typeof ratings_lib_constants;
  "ratings/lib/matchmaking": typeof ratings_lib_matchmaking;
  "ratings/lib/seasonRatings": typeof ratings_lib_seasonRatings;
  "ratings/lib/seasons": typeof ratings_lib_seasons;
  "ratings/queries": typeof ratings_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
