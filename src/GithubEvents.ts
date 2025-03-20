import { HttpClient, HttpClientResponse } from "@effect/platform";
import { GithubEvent } from "./Schema.js";
import { Effect, Context, Schema, Data, Layer } from "effect";

export class GithubEventsError extends Data.TaggedError("GithubEventsError")<{
  message: string;
  cause?: Error;
}> {}

export class GithubEvents extends Context.Tag("GithubEvents")<
  GithubEvents,
  {
    readonly get: (
      username: string,
      { limit, page }: { limit?: number; page?: number }
    ) => Effect.Effect<
      ReadonlyArray<GithubEvent>,
      GithubEventsError,
      HttpClient.HttpClient
    >;
  }
>() {}

export const GithubEventsLive = Layer.succeed(
  GithubEvents,
  GithubEvents.of({
    get: (username, { limit, page }) =>
      Effect.gen(function* () {
        const url = new URL(`https://api.github.com/users/${username}/events`);

        if (limit) url.searchParams.set("per_page", String(limit));
        if (page) url.searchParams.set("page", String(page));

        const client = yield* HttpClient.HttpClient;

        const events = yield* client.get(url).pipe(
          Effect.flatMap(HttpClientResponse.filterStatusOk),
          Effect.flatMap(
            HttpClientResponse.schemaBodyJson(Schema.Array(GithubEvent))
          ),
          Effect.mapError(
            (error) =>
              new GithubEventsError({ message: error.message, cause: error })
          )
        );

        return events;
      }),
  })
);
