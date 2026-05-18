/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as games_mutations from "../games/mutations.js";
import type * as games_queries from "../games/queries.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_game from "../lib/game.js";
import type * as lib_validators from "../lib/validators.js";
import type * as matchmaking_internal from "../matchmaking/internal.js";
import type * as matchmaking_mutations from "../matchmaking/mutations.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  "games/mutations": typeof games_mutations;
  "games/queries": typeof games_queries;
  "lib/auth": typeof lib_auth;
  "lib/game": typeof lib_game;
  "lib/validators": typeof lib_validators;
  "matchmaking/internal": typeof matchmaking_internal;
  "matchmaking/mutations": typeof matchmaking_mutations;
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
