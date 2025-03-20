import { Command, Args, Options } from "@effect/cli";
import { FetchHttpClient } from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, Match } from "effect";
import { GithubEvents, GithubEventsLive } from "./GithubEvents.js";

const username = Args.text({ name: "username" });
const page = Options.integer("page").pipe(
  Options.withAlias("p"),
  Options.withDefault(1)
);
const limit = Options.integer("limit").pipe(
  Options.withAlias("l"),
  Options.withDefault(3)
);

const command = Command.make(
  "github-activity",
  { username, limit, page },
  ({ username, limit, page }) =>
    Effect.gen(function* () {
      const githubEvents = yield* GithubEvents;
      const events = yield* githubEvents.get(username, {
        limit,
        page,
      });

      for (const event of events) {
        yield* Match.value(event).pipe(
          Match.when({ type: "PushEvent" }, (event) => {
            const numOfCommits = event.payload.commits.length;
            const plural = numOfCommits > 1 ? "s" : "";
            return Console.log(
              `Pushed ${numOfCommits} commit${plural} to ${event.repo.name}.`
            );
          }),
          Match.orElse(() =>
            Console.log(`Behaviour Not Implemented! (I'm to lazy for that!)`)
          )
        );
      }
    })
);

const cli = Command.run(command, {
  name: "Github Activity",
  version: "v1.0.0",
});

cli(process.argv).pipe(
  Effect.provide(NodeContext.layer),
  Effect.provide(FetchHttpClient.layer),
  Effect.provide(GithubEventsLive),
  NodeRuntime.runMain
);
