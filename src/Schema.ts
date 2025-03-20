import { Schema } from "effect";

const EventType = Schema.Union(
  // Schema.Literal("PushEvent"),
  Schema.Literal("PullRequestEvent"),
  Schema.Literal("CreateEvent"),
  Schema.Literal("WatchEvent"),
  Schema.Literal("DeleteEvent"),
  Schema.Literal("IssueCommentEvent"),
  Schema.Literal("IssuesEvent")
);

export type PushEvent = Schema.Schema.Type<typeof PushEvent>;

const Repo = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

export type Repo = Schema.Schema.Type<typeof Repo>;

const PushEvent = Schema.Struct({
  type: Schema.Literal("PushEvent"),
  repo: Repo,
  payload: Schema.Struct({
    commits: Schema.Array(Schema.Any),
  }),
});

export const GithubEvent = Schema.Union(
  Schema.Struct({
    id: Schema.String,
    type: EventType,
    repo: Repo,
    // payload: Schema.Never,
  }),
  PushEvent
);

export type GithubEvent = Schema.Schema.Type<typeof GithubEvent>;
